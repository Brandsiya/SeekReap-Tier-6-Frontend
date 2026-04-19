// ═══════════════════════════════════════════════════════════════════════════════
// SEEKREAP · certification_portal.js
// FIXED: Removed all automatic redirects
// ═══════════════════════════════════════════════════════════════════════════════

// ── CONFIG ────────────────────────────────────────────────────────────────────
const TIER4_URL = 'https://seekreap-tier-4-dev.fly.dev';

// ── STATE MACHINE ─────────────────────────────────────────────────────────────
const CertificationState = {
  submissionId: null,
  certId:       null,
  status:       'idle',
  error:        null,
  data:         null,
};

// ── STATUS UI ─────────────────────────────────────────────────────────────────
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
  queued:     { color: '#E8A040', bg: 'rgba(232,160,64,0.1)',   icon: '⏳', text: 'Certification queued…' },
  processing: { color: '#569cd6', bg: 'rgba(86,156,214,0.1)',  icon: '🔄', text: 'Processing your work…' },
  completed:  { color: '#3DB87A', bg: 'rgba(61,184,122,0.1)',  icon: '✅', text: 'Certification complete!' },
  failed:     { color: '#E05555', bg: 'rgba(224,85,85,0.1)',    icon: '❌', text: 'Certification failed.' },
};

function updateUIBasedOnState() {
  const el = getOrCreateStatusEl();
  const btn = document.getElementById('finalizeBtn');
  const cfg = STATUS_CONFIG[CertificationState.status];

  if (!cfg) { if (el) el.style.display = 'none'; return; }

  let msg = cfg.text;
  if (CertificationState.status === 'completed' && CertificationState.certId) {
    msg += ` Certificate ID: ${CertificationState.certId}`;
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
      const res = await fetch(`${TIER4_URL}/api/certify/${encodeURIComponent(submissionId)}`);
      if (!res.ok) throw new Error(`Status check HTTP ${res.status}`);
      const data = await res.json();

      CertificationState.submissionId = submissionId;
      CertificationState.certId = data.cert_id || CertificationState.certId;
      CertificationState.status = data.status || CertificationState.status;
      CertificationState.data = data;

      updateUIBasedOnState();

      if (data.status === 'completed') {
        CertificationState.status = 'completed';
        updateUIBasedOnState();
        renderCompletedState(data);
        sessionStorage.removeItem('activeCertification');
        return;
      }

      if (data.status === 'failed') {
        CertificationState.status = 'failed';
        CertificationState.error = data.failure_reason || 'Processing failed';
        updateUIBasedOnState();
        return;
      }

      if (attempts < maxAttempts) {
        setTimeout(poll, intervalMs);
      } else {
        CertificationState.status = 'failed';
        CertificationState.error = 'Timed out. Check dashboard later.';
        updateUIBasedOnState();
      }

    } catch (err) {
      console.warn('Poll error:', err.message);
      if (attempts < maxAttempts) {
        setTimeout(poll, intervalMs);
      }
    }
  }
  poll();
}

// ── RENDER COMPLETED ──────────────────────────────────────────────────────────
function renderCompletedState(data) {
  const certId = data.cert_id || CertificationState.certId || '—';
  const title = data.title || document.getElementById('workTitle')?.value?.trim() || 'Your Work';
  const now = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const certIdLine = document.getElementById('certIdLine');
  if (certIdLine) certIdLine.textContent = `${certId} · ${now}`;

  const certDetails = document.getElementById('certificateDetails');
  if (certDetails) {
    certDetails.innerHTML = `
      <div style="display:grid;gap:10px;font-size:0.88rem;">
        <div><strong>Certificate ID</strong><br><span style="font-family:monospace;color:var(--gold-light);">${certId}</span></div>
        <div><strong>Work Title</strong><br>${escHtml(title)}</div>
        <div><strong>Certified On</strong><br>${now}</div>
      </div>`;
  }

  if (typeof showStep === 'function') showStep('final');
}

// ── PAGE-REFRESH HYDRATION ────────────────────────────────────────────────────
async function hydrateFromSubmissionId(submissionId) {
  if (!submissionId) return false;
  try {
    const res = await fetch(`${TIER4_URL}/api/certify/${encodeURIComponent(submissionId)}`);
    if (!res.ok) return false;
    const data = await res.json();

    CertificationState.submissionId = submissionId;
    CertificationState.certId = data.cert_id;
    CertificationState.status = data.status;
    CertificationState.data = data;

    updateUIBasedOnState();

    if (data.status === 'queued' || data.status === 'processing') {
      pollCertificationStatus(submissionId);
    } else if (data.status === 'completed') {
      renderCompletedState(data);
    }
    return true;
  } catch (err) {
    return false;
  }
}

// ── SUBMIT HANDLER ────────────────────────────────────────────────────────────
async function doSubmit() {
  const title = document.getElementById('workTitle')?.value?.trim() || 'Untitled Work';
  const workTypeEl = document.getElementById('workType');
  const workType = workTypeEl?.value || 'other';

  // Hash the uploaded file
  let contentHash = '';
  if (window.uploadedFile) {
    try {
      const buf = await window.uploadedFile.arrayBuffer();
      const hb = await crypto.subtle.digest('SHA-256', buf);
      contentHash = Array.from(new Uint8Array(hb)).map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) { console.warn('Hash failed:', e); }
  }

  // NO AUTH REDIRECT - use test user ID
  const creatorId = 'user-' + Date.now();

  const plan = window.selectedPlan || 'free';
  const mode = window.mode || 'solo';
  const collabs = window.collaborators || [];

  const ownershipSplit = {};
  if (mode === 'collab' && collabs.length) {
    collabs.forEach(c => { ownershipSplit[c.email] = c.split; });
    ownershipSplit['__primary__'] = 100 - collabs.reduce((s, c) => s + c.split, 0);
  }

  const btn = document.getElementById('finalizeBtn');
  if (btn) { btn.disabled = true; btn.innerHTML = '⏳ Submitting…'; }

  CertificationState.status = 'queued';
  updateUIBasedOnState();

  const payload = {
    creator_id: creatorId,
    email: 'user@seekreap.com',
    title: title,
    work_type: workType,
    content_hash: contentHash,
    plan: plan,
    collaborators: mode === 'collab' ? collabs : [],
    ownership_split: ownershipSplit,
  };

  try {
    const res = await fetch(`${TIER4_URL}/api/certify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);

    CertificationState.submissionId = data.submission_id;
    CertificationState.certId = data.cert_id;
    CertificationState.status = data.status || 'queued';
    CertificationState.data = data;

    updateUIBasedOnState();

    sessionStorage.setItem('activeCertification', JSON.stringify({
      submission_id: data.submission_id,
      cert_id: data.cert_id,
      status: 'queued',
      title,
    }));

    pollCertificationStatus(data.submission_id);

  } catch (err) {
    console.error('Submission error:', err);
    CertificationState.status = 'failed';
    CertificationState.error = err.message;
    updateUIBasedOnState();
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit';
    }
  }
}

// ── DOM READY ─────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  // Page-refresh recovery
  const activeCert = sessionStorage.getItem('activeCertification');
  if (activeCert) {
    try {
      const cert = JSON.parse(activeCert);
      if (cert.submission_id && cert.status !== 'completed') {
        await hydrateFromSubmissionId(cert.submission_id);
      }
    } catch (e) {}
  }

  // URL param recovery
  const params = new URLSearchParams(window.location.search);
  const sid = params.get('id') || params.get('submission_id');
  if (sid) {
    await hydrateFromSubmissionId(sid);
  }

  // Wire submit button
  const finalizeBtn = document.getElementById('finalizeBtn');
  if (finalizeBtn) {
    const fresh = finalizeBtn.cloneNode(true);
    finalizeBtn.parentNode.replaceChild(fresh, finalizeBtn);
    fresh.addEventListener('click', doSubmit);
  }
});

// ── ESCAPE HELPER ─────────────────────────────────────────────────────────────
function escHtml(s) {
  if (!s) return '';
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}
