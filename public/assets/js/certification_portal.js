// certification_portal.js — state machine, API wiring, polling, auth.
// Auth check is async: waits for authReady event before deciding to redirect.

const TIER4_URL = 'https://seekreap-tier-4-dev.fly.dev';

// ── STATE MACHINE ─────────────────────────────────────────────────────────────
const CertificationState = {
  submissionId: null,
  certId:       null,
  status:       'idle',
  error:        null,
  data:         null,
};

// ── WAIT FOR AUTH (non-blocking, event-driven) ────────────────────────────────
function waitForAuth(timeoutMs = 5000) {
  // If auth-guard already finished (synchronous fast path)
  if (window.currentUser !== undefined && window.currentUser !== null) {
    return Promise.resolve(window.currentUser);
  }
  return new Promise(resolve => {
    const timer = setTimeout(() => {
      // Timed out — resolve with whatever currentUser is (may still be null)
      resolve(window.currentUser ?? null);
    }, timeoutMs);

    document.addEventListener('authReady', e => {
      clearTimeout(timer);
      resolve(e.detail?.user ?? null);
    }, { once: true });
  });
}

// ── STATUS UI ─────────────────────────────────────────────────────────────────
function getOrCreateStatusEl() {
  let el = document.getElementById('certificationStatus');
  if (!el) {
    el = document.createElement('div');
    el.id = 'certificationStatus';
    el.style.cssText = 'margin-top:14px;padding:11px 16px;border-radius:4px;font-size:0.85rem;display:none;';
    const btn = document.getElementById('finalizeBtn');
    if (btn?.parentNode) btn.parentNode.insertBefore(el, btn.nextSibling);
  }
  return el;
}

const STATUS_CONFIG = {
  queued:     { color:'#E8A040', bg:'rgba(232,160,64,0.1)',  icon:'⏳', text:'Certification queued — processing will begin shortly…' },
  processing: { color:'#569cd6', bg:'rgba(86,156,214,0.1)', icon:'🔄', text:'Analysing your work — this may take a few moments…' },
  analyzed:   { color:'#3DB87A', bg:'rgba(61,184,122,0.08)',icon:'🔬', text:'Analysis complete — finalising certificate…' },
  completed:  { color:'#3DB87A', bg:'rgba(61,184,122,0.1)', icon:'✅', text:'Certification complete!' },
  failed:     { color:'#E05555', bg:'rgba(224,85,85,0.1)',   icon:'❌', text:'Certification failed.' },
};

function updateUIBasedOnState() {
  const el  = getOrCreateStatusEl();
  const btn = document.getElementById('finalizeBtn');
  const cfg = STATUS_CONFIG[CertificationState.status];
  if (!cfg) { el.style.display = 'none'; return; }

  let msg = cfg.text;
  if (CertificationState.status === 'completed' && CertificationState.certId)
    msg += ` Certificate ID: <strong style="font-family:monospace;color:${cfg.color};">${CertificationState.certId}</strong>`;
  if (CertificationState.status === 'failed' && CertificationState.error)
    msg += ` ${CertificationState.error}`;

  el.style.cssText = `margin-top:14px;padding:11px 16px;border-radius:4px;font-size:0.85rem;
    background:${cfg.bg};border:1px solid ${cfg.color}44;color:${cfg.color};display:block;`;
  el.innerHTML = `${cfg.icon} ${msg}`;
  if (btn) btn.disabled = ['queued','processing'].includes(CertificationState.status);
}

// ── POLLING ───────────────────────────────────────────────────────────────────
function pollCertificationStatus(submissionId, maxAttempts = 60, intervalMs = 3000) {
  let attempts = 0;
  async function poll() {
    attempts++;
    try {
      const res  = await fetch(`${TIER4_URL}/api/certify/${encodeURIComponent(submissionId)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      CertificationState.submissionId = submissionId;
      CertificationState.certId       = data.cert_id || CertificationState.certId;
      CertificationState.status       = data.status  || CertificationState.status;
      CertificationState.data         = data;
      updateUIBasedOnState();

      if (data.status === 'completed' || data.status === 'analyzed') {
        CertificationState.status = 'completed';
        updateUIBasedOnState();
        renderCompletedState(data);
        sessionStorage.setItem('activeCert', JSON.stringify({
          submission_id: submissionId,
          cert_id:       data.cert_id || CertificationState.certId,
          plan:          data.plan || 'free',
          title:         data.title || '',
          status:        'completed',
        }));
        sessionStorage.removeItem('activeCertification');
        return;
      }
      if (data.status === 'failed') {
        CertificationState.status = 'failed';
        CertificationState.error  = data.failure_reason || 'Processing failed';
        updateUIBasedOnState();
        renderErrorState(data);
        return;
      }
      if (attempts < maxAttempts) setTimeout(poll, intervalMs);
      else {
        CertificationState.status = 'failed';
        CertificationState.error  = 'Timed out — check your dashboard later.';
        updateUIBasedOnState();
      }
    } catch (err) {
      console.warn('Poll', attempts, err.message);
      if (attempts < maxAttempts) setTimeout(poll, intervalMs);
      else { CertificationState.status='failed'; CertificationState.error=err.message; updateUIBasedOnState(); }
    }
  }
  poll();
}

// ── RENDER COMPLETED ──────────────────────────────────────────────────────────
function renderCompletedState(data) {
  const certId    = data.cert_id  || CertificationState.certId || '—';
  const title     = data.title    || document.getElementById('workTitle')?.value?.trim() || 'Your Work';
  const riskScore = data.overall_risk_score ?? '—';
  const riskLevel = data.risk_level || '—';
  const plan      = data.plan || window.selectedPlan || 'free';
  const now       = new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'});
  const certIdLine = document.getElementById('certIdLine');
  if (certIdLine) certIdLine.textContent = `${certId} · ${now}`;

  const certDetails = document.getElementById('certificateDetails');
  if (certDetails) {
    const mode    = window.mode;
    const collabs = window.collaborators || [];
    let ownerRows = `<div class="cert-ownership-row"><span>You (Primary Creator)</span><span>${mode==='collab'?(100-collabs.reduce((s,c)=>s+c.split,0))+'%':'100%'}</span></div>`;
    if (mode === 'collab') collabs.forEach(c => { ownerRows += `<div class="cert-ownership-row"><span>${escHtml(c.fullName||c.email)}</span><span>${c.split}%</span></div>`; });

    const workTypeEl   = document.getElementById('workType');
    const workTypeText = workTypeEl ? workTypeEl.options[workTypeEl.selectedIndex]?.text?.trim() : '—';

    certDetails.innerHTML = `
      <div style="display:grid;gap:10px;font-size:0.88rem;">
        <div><strong style="color:var(--white-dim);font-size:0.72rem;text-transform:uppercase;letter-spacing:0.08em;">Certificate ID</strong><br>
          <span style="font-family:monospace;color:var(--gold-light);">${certId}</span></div>
        <div><strong style="color:var(--white-dim);font-size:0.72rem;text-transform:uppercase;letter-spacing:0.08em;">Work Title</strong><br>${escHtml(title)}</div>
        <div><strong style="color:var(--white-dim);font-size:0.72rem;text-transform:uppercase;letter-spacing:0.08em;">Work Type</strong><br>${escHtml(workTypeText)}</div>
        <div><strong style="color:var(--white-dim);font-size:0.72rem;text-transform:uppercase;letter-spacing:0.08em;">Plan</strong><br>${escHtml(plan)}</div>
        <div><strong style="color:var(--white-dim);font-size:0.72rem;text-transform:uppercase;letter-spacing:0.08em;">Risk Level</strong><br>
          <span style="color:${riskLevel==='low'?'var(--success)':riskLevel==='medium'?'var(--warning)':'var(--danger)'};">${riskLevel} (${riskScore})</span></div>
        <div><strong style="color:var(--white-dim);font-size:0.72rem;text-transform:uppercase;letter-spacing:0.08em;">Certified On</strong><br>${now}</div>
        <div class="cert-ownership-block"><strong><i class="fas fa-shield-alt" style="margin-right:5px;"></i> Ownership</strong>${ownerRows}</div>
      </div>
      <div style="margin-top:14px;display:flex;gap:10px;flex-wrap:wrap;">
        <a href="verification_portal.html?cert=${encodeURIComponent(certId)}" target="_blank"
           style="display:inline-flex;align-items:center;gap:7px;padding:8px 16px;background:var(--gold-glow);border:1px solid var(--border-strong);border-radius:3px;color:var(--gold-light);font-size:0.82rem;text-decoration:none;font-weight:600;">
          <i class="fas fa-external-link-alt"></i> Verify Certificate
        </a>
        <button onclick="navigator.clipboard.writeText(window.location.origin+'/verification_portal.html?cert=${encodeURIComponent(certId)}').then(()=>alert('Link copied'))"
           style="display:inline-flex;align-items:center;gap:7px;padding:8px 16px;background:transparent;border:1px solid var(--border);border-radius:3px;color:var(--white-dim);font-size:0.82rem;cursor:pointer;">
          <i class="fas fa-link"></i> Copy Link
        </button>
      </div>`;
  }
  if (typeof showStep === 'function') showStep('final');
}

function renderErrorState(data) {
  const msg = data.failure_reason || CertificationState.error || 'Certification failed';
  const el  = getOrCreateStatusEl();
  el.style.cssText = 'margin-top:14px;padding:11px 16px;border-radius:4px;font-size:0.85rem;background:rgba(224,85,85,0.1);border:1px solid rgba(224,85,85,0.3);color:#E05555;display:block;';
  el.innerHTML = `❌ ${escHtml(msg)} — <a href="certification_portal.html" style="color:#E05555;text-decoration:underline;">Try again</a>`;
}

// ── HYDRATION ─────────────────────────────────────────────────────────────────
async function hydrateFromSubmissionId(submissionId) {
  if (!submissionId) return false;
  try {
    const res  = await fetch(`${TIER4_URL}/api/certify/${encodeURIComponent(submissionId)}`);
    if (!res.ok) return false;
    const data = await res.json();
    CertificationState.submissionId = submissionId;
    CertificationState.certId       = data.cert_id;
    CertificationState.status       = data.status;
    CertificationState.data         = data;
    updateUIBasedOnState();
    if (['queued','processing','analyzed'].includes(data.status)) pollCertificationStatus(submissionId);
    else if (data.status === 'completed') renderCompletedState(data);
    else if (data.status === 'failed')    renderErrorState(data);
    return true;
  } catch (err) { console.warn('Hydration failed:', err.message); return false; }
}

// ── SUBMIT ────────────────────────────────────────────────────────────────────
async function doSubmit() {
  const title      = (document.getElementById('workTitle')?.value || '').trim() || 'Untitled Work';
  const workTypeEl = document.getElementById('workType');
  const workType   = workTypeEl?.value || 'other';

  let contentHash = '';
  if (window.uploadedFile) {
    try {
      const buf = await window.uploadedFile.arrayBuffer();
      const hb  = await crypto.subtle.digest('SHA-256', buf);
      contentHash = Array.from(new Uint8Array(hb)).map(b=>b.toString(16).padStart(2,'0')).join('');
    } catch (e) { console.warn('Hash failed:', e); }
  }

  const user = window.currentUser;
  const creatorId = user ? (user.id || user.sub) : null;
  if (!creatorId) {
    alert('Your session has expired. Please sign in again.');
    window.location.href = 'signup_signin.html?redirect=' + encodeURIComponent(window.location.href);
    return;
  }

  const plan    = window.selectedPlan || 'free';
  const mode    = window.mode || 'solo';
  const collabs = window.collaborators || [];

  const ownershipSplit = {};
  if (mode === 'collab' && collabs.length) {
    collabs.forEach(c => { ownershipSplit[c.email] = c.split; });
    ownershipSplit['__primary__'] = 100 - collabs.reduce((s,c)=>s+c.split, 0);
  }

  if (plan !== 'free') {
    sessionStorage.setItem('pendingCert', JSON.stringify({
      creator_id: creatorId, email: user.email || '',
      title, work_type: workType, content_hash: contentHash, plan,
      collaborators: mode==='collab' ? collabs : [],
      ownership_split: ownershipSplit,
    }));
    window.location.href = `pay.html?plan=${encodeURIComponent(plan)}&title=${encodeURIComponent(title)}`;
    return;
  }

  const btn = document.getElementById('finalizeBtn');
  if (btn) { btn.disabled = true; btn.innerHTML = '⏳ Submitting…'; }
  CertificationState.status = 'queued';
  updateUIBasedOnState();

  try {
    const res  = await fetch(`${TIER4_URL}/api/certify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creator_id: creatorId, email: user.email || '',
        title, work_type: workType, content_hash: contentHash, plan: 'free',
        collaborators: mode==='collab' ? collabs : [],
        ownership_split: ownershipSplit,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);

    CertificationState.submissionId = data.submission_id;
    CertificationState.certId       = data.cert_id;
    CertificationState.status       = data.status || 'queued';
    CertificationState.data         = data;
    updateUIBasedOnState();

    sessionStorage.setItem('activeCertification', JSON.stringify({
      submission_id: data.submission_id, cert_id: data.cert_id, status:'queued', title,
    }));
    sessionStorage.setItem('activeCert', JSON.stringify({
      submission_id: data.submission_id, cert_id: data.cert_id, plan:'free', title,
    }));

    pollCertificationStatus(data.submission_id);

  } catch (err) {
    console.error('Submission error:', err);
    CertificationState.status = 'failed';
    CertificationState.error  = err.message;
    updateUIBasedOnState();
    if (btn) { btn.disabled=false; btn.innerHTML='<i class="fas fa-paper-plane"></i> Submit'; }
  }
}

// ── INVITE TOKEN ──────────────────────────────────────────────────────────────
function generateInviteToken(coownerEmail, workTitle) {
  const raw    = `${coownerEmail}:${workTitle}:${Date.now()}:${Math.random()}`;
  const digest = btoa(raw).replace(/[^a-zA-Z0-9]/g,'').slice(0,24).toUpperCase();
  return `INV-${digest.slice(0,6)}-${digest.slice(6,12)}-${digest.slice(12,18)}`;
}

// ── ESCAPE ────────────────────────────────────────────────────────────────────
function escHtml(s) {
  if (!s) return '';
  const d = document.createElement('div'); d.textContent = s; return d.innerHTML;
}

// ── BOOTSTRAP ────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {

  // 1. Wait for auth-guard to finish (async, event-driven, max 5s)
  const user = await waitForAuth(5000);

  if (!user) {
    // No session — redirect to sign-in, preserving the return URL
    const returnUrl = encodeURIComponent(window.location.href);
    window.location.href = `/signup_signin.html?redirect=${returnUrl}`;
    return;
  }

  // User is authenticated — page stays, continue initialisation

  // 2. Page-refresh recovery
  const activeCert = sessionStorage.getItem('activeCertification');
  if (activeCert) {
    try {
      const cert = JSON.parse(activeCert);
      if (cert.submission_id && cert.status !== 'completed') {
        const hydrated = await hydrateFromSubmissionId(cert.submission_id);
        if (hydrated) return;
      }
    } catch (e) {}
  }

  // 3. URL param recovery
  const params = new URLSearchParams(window.location.search);
  const sid    = params.get('id') || params.get('submission_id');
  if (sid) await hydrateFromSubmissionId(sid);

  // 4. Wire finalizeBtn (clone to strip prior listeners)
  const finalizeBtn = document.getElementById('finalizeBtn');
  if (finalizeBtn) {
    const fresh = finalizeBtn.cloneNode(true);
    finalizeBtn.parentNode.replaceChild(fresh, finalizeBtn);
    fresh.addEventListener('click', doSubmit);
  }

  // 5. Wire downloadCertBtn
  const dlBtn = document.getElementById('downloadCertBtn');
  if (dlBtn) {
    dlBtn.addEventListener('click', () => {
      const s = CertificationState.submissionId;
      const c = CertificationState.certId;
      if (s && c) window.location.href = `certificate_loader.html?id=${encodeURIComponent(s)}&cert=${encodeURIComponent(c)}`;
      else alert('Certificate not yet available — please wait for processing to complete.');
    });
  }
});
