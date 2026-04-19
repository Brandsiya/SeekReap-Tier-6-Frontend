// ═══════════════════════════════════════════════════════════════════════════════
// SEEKREAP · certification_portal.js
// Works in tandem with certification_portal.html (inline JS handles viewers/
// upload/collaborator UI). This file owns: auth, API submission, state machine,
// polling, and page-refresh hydration.
// ═══════════════════════════════════════════════════════════════════════════════

// ── CONFIG ────────────────────────────────────────────────────────────────────
const TIER4_URL = 'https://seekreap-tier-4-dev.fly.dev';

// ── STATE MACHINE ─────────────────────────────────────────────────────────────
const CertificationState = {
  submissionId: null,
  certId:       null,
  status:       'idle', // idle | queued | processing | analyzed | completed | failed
  error:        null,
  data:         null,
};

// ── STATUS UI INJECTION ───────────────────────────────────────────────────────
function getOrCreateStatusEl() {
  let el = document.getElementById('certificationStatus');
  if (!el) {
    el = document.createElement('div');
    el.id = 'certificationStatus';
    el.style.cssText = 'margin-top:14px;padding:11px 16px;border-radius:4px;font-size:0.85rem;display:none;';
    const btn = document.getElementById('finalizeBtn');
    if (btn && btn.parentNode) btn.parentNode.insertBefore(el, btn.nextSibling);
  }
  return el;
}

const STATUS_CONFIG = {
  queued:     { color: '#E8A040', bg: 'rgba(232,160,64,0.1)',   icon: '⏳', text: 'Certification queued — processing will begin shortly…' },
  processing: { color: '#569cd6', bg: 'rgba(86,156,214,0.1)',  icon: '🔄', text: 'Analysing your work — this may take a few moments…' },
  analyzed:   { color: '#3DB87A', bg: 'rgba(61,184,122,0.08)', icon: '🔬', text: 'Analysis complete — finalising certificate…' },
  completed:  { color: '#3DB87A', bg: 'rgba(61,184,122,0.1)',  icon: '✅', text: 'Certification complete!' },
  failed:     { color: '#E05555', bg: 'rgba(224,85,85,0.1)',    icon: '❌', text: 'Certification failed.' },
};

function updateUIBasedOnState() {
  const el  = getOrCreateStatusEl();
  const btn = document.getElementById('finalizeBtn');
  const cfg = STATUS_CONFIG[CertificationState.status];

  if (!cfg) { el.style.display = 'none'; return; }

  let msg = cfg.text;
  if (CertificationState.status === 'completed' && CertificationState.certId) {
    msg += ` Certificate ID: <strong style="font-family:monospace;color:${cfg.color};">${CertificationState.certId}</strong>`;
  }
  if (CertificationState.status === 'failed' && CertificationState.error) {
    msg += ` ${CertificationState.error}`;
  }

  el.style.cssText = `margin-top:14px;padding:11px 16px;border-radius:4px;font-size:0.85rem;
    background:${cfg.bg};border:1px solid ${cfg.color}44;color:${cfg.color};display:block;`;
  el.innerHTML = `${cfg.icon} ${msg}`;

  if (btn) {
    btn.disabled = (CertificationState.status === 'queued' || CertificationState.status === 'processing');
  }
}

// ── POLLING ───────────────────────────────────────────────────────────────────
function pollCertificationStatus(submissionId, maxAttempts = 60, intervalMs = 3000) {
  let attempts = 0;

  async function poll() {
    attempts++;
    try {
      const res  = await fetch(`${TIER4_URL}/api/certify/${encodeURIComponent(submissionId)}`);
      if (!res.ok) throw new Error(`Status check HTTP ${res.status}`);
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

        // Persist cert for dashboard
        const existing = JSON.parse(sessionStorage.getItem('activeCert') || '{}');
        sessionStorage.setItem('activeCert', JSON.stringify({
          ...existing,
          submission_id: submissionId,
          cert_id:       data.cert_id || CertificationState.certId,
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

      // Still in flight
      if (attempts < maxAttempts) {
        setTimeout(poll, intervalMs);
      } else {
        CertificationState.status = 'failed';
        CertificationState.error  = 'Timed out. Your certificate may still process — check the dashboard.';
        updateUIBasedOnState();
      }

    } catch (err) {
      console.warn('Poll attempt', attempts, err.message);
      if (attempts < maxAttempts) {
        setTimeout(poll, intervalMs);
      } else {
        CertificationState.status = 'failed';
        CertificationState.error  = err.message;
        updateUIBasedOnState();
      }
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
  const now       = new Date().toLocaleDateString('en-US', {year:'numeric',month:'long',day:'numeric'});

  const certIdLine = document.getElementById('certIdLine');
  if (certIdLine) certIdLine.textContent = `${certId} · ${now}`;

  const certDetails = document.getElementById('certificateDetails');
  if (certDetails) {
    const mode    = window.mode;
    const collabs = window.collaborators || [];

    let ownerRows = `<div class="cert-ownership-row"><span>You (Primary Creator)</span><span>${mode==='collab'?(100-collabs.reduce((s,c)=>s+c.split,0))+'%':'100%'}</span></div>`;
    if (mode === 'collab') {
      collabs.forEach(c => {
        ownerRows += `<div class="cert-ownership-row"><span>${escHtml(c.fullName||c.email)}</span><span>${c.split}%</span></div>`;
      });
    }

    const workTypeEl = document.getElementById('workType');
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
        <button onclick="navigator.clipboard.writeText(window.location.origin+'/verification_portal.html?cert=${encodeURIComponent(certId)}').then(()=>alert('Verification link copied'))"
           style="display:inline-flex;align-items:center;gap:7px;padding:8px 16px;background:transparent;border:1px solid var(--border);border-radius:3px;color:var(--white-dim);font-size:0.82rem;cursor:pointer;">
          <i class="fas fa-link"></i> Copy Verify Link
        </button>
      </div>`;
  }

  // Navigate to final step
  if (typeof showStep === 'function') showStep('final');
}

function renderErrorState(data) {
  const msg = data.failure_reason || CertificationState.error || 'Certification failed';
  const el  = getOrCreateStatusEl();
  el.style.cssText = 'margin-top:14px;padding:11px 16px;border-radius:4px;font-size:0.85rem;background:rgba(224,85,85,0.1);border:1px solid rgba(224,85,85,0.3);color:#E05555;display:block;';
  el.innerHTML = `❌ ${escHtml(msg)} — <a href="certification_portal.html" style="color:#E05555;text-decoration:underline;">Try again</a>`;
}

// ── PAGE-REFRESH HYDRATION ────────────────────────────────────────────────────
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

    if (data.status === 'queued' || data.status === 'processing' || data.status === 'analyzed') {
      pollCertificationStatus(submissionId);
    } else if (data.status === 'completed') {
      renderCompletedState(data);
    } else if (data.status === 'failed') {
      renderErrorState(data);
    }
    return true;
  } catch (err) {
    console.warn('Hydration failed:', err.message);
    return false;
  }
}

// ── SUBMIT HANDLER (replaces doSubmit in inline JS) ───────────────────────────
async function doSubmit() {
  const title      = (document.getElementById('workTitle')?.value || '').trim() || 'Untitled Work';
  const workTypeEl = document.getElementById('workType');
  const workType   = workTypeEl?.value || 'other';

  // Hash the uploaded file
  let contentHash = '';
  if (window.uploadedFile) {
    try {
      const buf = await window.uploadedFile.arrayBuffer();
      const hb  = await crypto.subtle.digest('SHA-256', buf);
      contentHash = Array.from(new Uint8Array(hb)).map(b => b.toString(16).padStart(2,'0')).join('');
    } catch (e) { console.warn('Hash failed:', e); }
  }

  // Auth guard
  const user = window.currentUser;
  const creatorId = user ? (user.id || user.sub) : null;
  if (!creatorId) {
    alert('Session expired. Please sign in again.');
    window.location.href = 'signup_signin.html';
    return;
  }

  const plan = window.selectedPlan || 'free';
  const mode = window.mode || 'solo';
  const collabs = window.collaborators || [];

  // Build ownership split
  const ownershipSplit = {};
  if (mode === 'collab' && collabs.length) {
    collabs.forEach(c => { ownershipSplit[c.email] = c.split; });
    ownershipSplit['__primary__'] = 100 - collabs.reduce((s,c) => s + c.split, 0);
  }

  // Pay gate — redirect for paid plans
  if (plan !== 'free') {
    const pending = {
      creator_id:    creatorId,
      email:         user.email || '',
      title,
      work_type:     workType,
      content_hash:  contentHash,
      plan,
      collaborators: mode === 'collab' ? collabs : [],
      ownership_split: ownershipSplit,
    };
    sessionStorage.setItem('pendingCert', JSON.stringify(pending));
    window.location.href = `pay.html?plan=${encodeURIComponent(plan)}&title=${encodeURIComponent(title)}`;
    return;
  }

  // Free plan — submit directly
  const btn = document.getElementById('finalizeBtn');
  if (btn) { btn.disabled = true; btn.innerHTML = '⏳ Submitting…'; }

  CertificationState.status = 'queued';
  updateUIBasedOnState();

  const payload = {
    creator_id:      creatorId,
    email:           user.email || '',
    title,
    work_type:       workType,
    content_hash:    contentHash,
    plan:            'free',
    collaborators:   mode === 'collab' ? collabs : [],
    ownership_split: ownershipSplit,
  };

  try {
    const res  = await fetch(`${TIER4_URL}/api/certify`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);

    CertificationState.submissionId = data.submission_id;
    CertificationState.certId       = data.cert_id;
    CertificationState.status       = data.status || 'queued';
    CertificationState.data         = data;

    updateUIBasedOnState();

    // Persist for page refresh recovery
    sessionStorage.setItem('activeCertification', JSON.stringify({
      submission_id: data.submission_id,
      cert_id:       data.cert_id,
      status:        'queued',
      title,
    }));

    // Also keep activeCert in format expected by certificate_loader.html
    sessionStorage.setItem('activeCert', JSON.stringify({
      submission_id: data.submission_id,
      cert_id:       data.cert_id,
      plan:          'free',
      title,
    }));

    // Start polling
    pollCertificationStatus(data.submission_id);

  } catch (err) {
    console.error('Submission error:', err);
    CertificationState.status = 'failed';
    CertificationState.error  = err.message;
    updateUIBasedOnState();
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit';
    }
  }
}

// ── INVITE TOKEN GENERATION ───────────────────────────────────────────────────
function generateInviteToken(coownerEmail, workTitle) {
  // Generates a short opaque token stored in sessionStorage for the invite link
  const raw    = `${coownerEmail}:${workTitle}:${Date.now()}:${Math.random()}`;
  const digest = btoa(raw).replace(/[^a-zA-Z0-9]/g, '').slice(0, 24).toUpperCase();
  return `INV-${digest.slice(0,6)}-${digest.slice(6,12)}-${digest.slice(12,18)}`;
}

// ── SUPABASE AUTH INTEGRATION ─────────────────────────────────────────────────
// auth-guard.js sets window.currentUser before this file runs.
// This block is a safety net: if auth-guard didn't fire, redirect.
function ensureAuth() {
  if (!window.currentUser) {
    const params = new URLSearchParams(window.location.search);
    const redirect = encodeURIComponent(window.location.href);
    window.location.href = `signup_signin.html?redirect=${redirect}`;
  }
}

// ── DOM READY BOOTSTRAP ───────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {

  // 1. Auth guard
  ensureAuth();

  // 2. Page-refresh recovery: check sessionStorage
  const activeCert = sessionStorage.getItem('activeCertification');
  if (activeCert) {
    try {
      const cert = JSON.parse(activeCert);
      if (cert.submission_id && cert.status !== 'completed') {
        const hydrated = await hydrateFromSubmissionId(cert.submission_id);
        if (hydrated) return; // State restored — don't re-render blank form
      }
    } catch (e) { /* malformed JSON, ignore */ }
  }

  // 3. URL param recovery: ?id=xxx or ?submission_id=xxx
  const params = new URLSearchParams(window.location.search);
  const sid    = params.get('id') || params.get('submission_id');
  if (sid) {
    await hydrateFromSubmissionId(sid);
  }

  // 4. Wire finalizeBtn — replaces any inline listener set before this file ran
  const finalizeBtn = document.getElementById('finalizeBtn');
  if (finalizeBtn) {
    // Clone to strip prior listeners, then re-attach
    const fresh = finalizeBtn.cloneNode(true);
    finalizeBtn.parentNode.replaceChild(fresh, finalizeBtn);
    fresh.addEventListener('click', doSubmit);
  }

  // 5. Download cert button → redirect to certificate_loader if we have a submissionId
  const dlBtn = document.getElementById('downloadCertBtn');
  if (dlBtn) {
    dlBtn.addEventListener('click', () => {
      const sid = CertificationState.submissionId;
      const cid = CertificationState.certId;
      if (sid && cid) {
        window.location.href = `certificate_loader.html?id=${encodeURIComponent(sid)}&cert=${encodeURIComponent(cid)}`;
      } else {
        alert('Certificate not yet available. Please wait for processing to complete.');
      }
    });
  }

});

// ── ESCAPE HELPER (used by renderCompletedState) ──────────────────────────────
function escHtml(s) {
  if (!s) return '';
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}
