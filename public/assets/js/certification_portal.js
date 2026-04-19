// ── STATE MACHINE ─────────────────────────────────────────────────────────────
const CertificationState = {
  submissionId: null,
  certId: null,
  status: "idle", // idle | queued | processing | completed | failed
  error: null,
  data: null
};

// ── UI State Helpers ─────────────────────────────────────────────────────────
function updateUIBasedOnState() {
  const submitBtn = document.getElementById('finalizeBtn');
  const loaderEl = document.getElementById('certificationLoader');
  const statusEl = document.getElementById('certificationStatus');
  
  switch(CertificationState.status) {
    case 'queued':
      if (submitBtn) submitBtn.disabled = true;
      if (statusEl) {
        statusEl.innerHTML = '<div class="status-queued">⏳ Certification queued... Processing will begin shortly.</div>';
        statusEl.style.display = 'block';
      }
      break;
    case 'processing':
      if (statusEl) {
        statusEl.innerHTML = '<div class="status-processing">🔄 Analyzing your work... This may take a few moments.</div>';
        statusEl.style.display = 'block';
      }
      break;
    case 'completed':
      if (submitBtn) submitBtn.disabled = false;
      if (statusEl) {
        statusEl.innerHTML = `<div class="status-completed">✅ Certification complete! Certificate ID: ${CertificationState.certId}</div>`;
        statusEl.style.display = 'block';
      }
      break;
    case 'failed':
      if (submitBtn) submitBtn.disabled = false;
      if (statusEl) {
        statusEl.innerHTML = `<div class="status-failed">❌ Certification failed: ${CertificationState.error || 'Unknown error'}</div>`;
        statusEl.style.display = 'block';
      }
      break;
    default:
      if (statusEl) statusEl.style.display = 'none';
  }
}

// ── POLLING LOOP (CRITICAL MISSING PIECE) ────────────────────────────────────
async function pollCertificationStatus(submissionId, maxAttempts = 30, intervalMs = 2000) {
  let attempts = 0;
  
  const poll = async () => {
    attempts++;
    try {
      const response = await fetch(`${TIER4_URL}/api/certify/${submissionId}`);
      if (!response.ok) throw new Error(`Status check failed: ${response.status}`);
      
      const data = await response.json();
      
      // Update state
      CertificationState.submissionId = submissionId;
      CertificationState.status = data.status;
      CertificationState.certId = data.cert_id;
      CertificationState.data = data;
      
      if (data.status === 'completed') {
        CertificationState.status = 'completed';
        updateUIBasedOnState();
        renderCompletedState(data);
        return;
      }
      
      if (data.status === 'failed') {
        CertificationState.status = 'failed';
        CertificationState.error = data.failure_reason || 'Processing failed';
        updateUIBasedOnState();
        renderErrorState(data);
        return;
      }
      
      // Still processing - update UI and continue polling
      updateUIBasedOnState();
      
      if (attempts < maxAttempts) {
        setTimeout(poll, intervalMs);
      } else {
        CertificationState.status = 'failed';
        CertificationState.error = 'Processing timed out. Please check your dashboard later.';
        updateUIBasedOnState();
      }
      
    } catch (error) {
      console.error('Polling error:', error);
      if (attempts < maxAttempts) {
        setTimeout(poll, intervalMs);
      } else {
        CertificationState.status = 'failed';
        CertificationState.error = error.message;
        updateUIBasedOnState();
      }
    }
  };
  
  // Start polling
  poll();
}

// ── RENDER COMPLETED STATE ────────────────────────────────────────────────────
function renderCompletedState(data) {
  const certId = data.cert_id || CertificationState.certId;
  const title = data.title || document.getElementById('workTitle')?.value || 'Your Work';
  const riskScore = data.overall_risk_score || '0.0';
  const riskLevel = data.risk_level || 'low';
  
  // Update certificate display
  const certIdLine = document.getElementById('certIdLine');
  if (certIdLine) {
    certIdLine.textContent = `${certId} · ${new Date().toLocaleDateString()}`;
  }
  
  const certificateDetails = document.getElementById('certificateDetails');
  if (certificateDetails) {
    certificateDetails.innerHTML = `
      <div style="display:grid;gap:10px;font-size:0.88rem;">
        <div><strong>Certificate ID</strong><br><span style="font-family:monospace;color:var(--gold-light);">${certId}</span></div>
        <div><strong>Work Title</strong><br>${title}</div>
        <div><strong>Risk Score</strong><br>${riskScore} (${riskLevel})</div>
        <div><strong>Certified On</strong><br>${new Date().toLocaleDateString()}</div>
      </div>
    `;
  }
  
  // Show step 5 (certificate view)
  showStep(5);
}

function renderErrorState(data) {
  const errorMsg = data.failure_reason || CertificationState.error || 'Certification failed';
  alert(`Certification failed: ${errorMsg}\n\nPlease try again or contact support.`);
}

// ── HYDRATE FROM EXISTING SUBMISSION (Page refresh recovery) ─────────────────
async function hydrateFromSubmissionId(submissionId) {
  if (!submissionId) return false;
  
  try {
    const response = await fetch(`${TIER4_URL}/api/certify/${submissionId}`);
    if (!response.ok) return false;
    
    const data = await response.json();
    
    CertificationState.submissionId = submissionId;
    CertificationState.status = data.status;
    CertificationState.certId = data.cert_id;
    CertificationState.data = data;
    
    updateUIBasedOnState();
    
    if (data.status === 'queued' || data.status === 'processing') {
      // Resume polling
      pollCertificationStatus(submissionId);
    } else if (data.status === 'completed') {
      renderCompletedState(data);
    }
    
    return true;
  } catch (error) {
    console.error('Hydration failed:', error);
    return false;
  }
}

// ── MODIFIED SUBMIT HANDLER WITH STATE MANAGEMENT ────────────────────────────
// Replace the existing finalizeBtn listener
const originalFinalizeHandler = async () => {
  const title = document.getElementById('workTitle').value.trim() || 'Untitled Work';
  const workTypeEl = document.getElementById('workType');
  const workType = workTypeEl.value;
  
  // Hash the uploaded file if available
  let contentHash = '';
  if (uploadedFile) {
    try {
      const buf = await uploadedFile.arrayBuffer();
      const hashBuf = await crypto.subtle.digest('SHA-256', buf);
      contentHash = Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2,'0')).join('');
    } catch(e) { console.warn('Hash failed:', e); }
  }
  
  // Get Supabase user
  const user = window.currentUser;
  const creatorId = user ? (user.id || user.sub) : null;
  
  if (!creatorId) {
    alert('Session expired. Please sign in again.');
    window.location.href = 'signup_signin.html';
    return;
  }
  
  const finalizeBtn = document.getElementById('finalizeBtn');
  finalizeBtn.disabled = true;
  finalizeBtn.textContent = '⏳ Submitting...';
  
  // Show status container
  let statusContainer = document.getElementById('certificationStatus');
  if (!statusContainer) {
    statusContainer = document.createElement('div');
    statusContainer.id = 'certificationStatus';
    statusContainer.style.cssText = 'margin-top: 16px; padding: 12px; border-radius: 8px; text-align: center;';
    finalizeBtn.parentNode.insertBefore(statusContainer, finalizeBtn.nextSibling);
  }
  
  try {
    const payload = {
      creator_id: creatorId,
      email: user.email,
      title: title,
      work_type: workType,
      content_hash: contentHash,
      plan: selectedPlan || 'free',
      collaborators: mode === 'collab' ? collaborators : [],
      ownership_split: mode === 'collab' ? {} : {}
    };
    
    const response = await fetch(`${TIER4_URL}/api/certify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    
    if (!response.ok) throw new Error(data.error || 'Certification failed');
    
    // Update state machine
    CertificationState.submissionId = data.submission_id;
    CertificationState.certId = data.cert_id;
    CertificationState.status = 'queued';
    CertificationState.data = data;
    
    updateUIBasedOnState();
    
    // Store in sessionStorage for page refresh recovery
    sessionStorage.setItem('activeCertification', JSON.stringify({
      submission_id: data.submission_id,
      cert_id: data.cert_id,
      status: 'queued',
      title: title
    }));
    
    // Start polling for completion
    pollCertificationStatus(data.submission_id);
    
  } catch (error) {
    console.error('Submission error:', error);
    CertificationState.status = 'failed';
    CertificationState.error = error.message;
    updateUIBasedOnState();
    finalizeBtn.disabled = false;
    finalizeBtn.textContent = '<i class="fas fa-certificate"></i> Get Certified';
  }
};

// ── PAGE LOAD HYDRATION (Fix refresh blindness) ──────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  // Check for existing certification in sessionStorage
  const activeCert = sessionStorage.getItem('activeCertification');
  if (activeCert) {
    try {
      const cert = JSON.parse(activeCert);
      if (cert.submission_id && cert.status !== 'completed') {
        await hydrateFromSubmissionId(cert.submission_id);
      }
    } catch(e) {}
  }
  
  // Also check URL for submission_id parameter
  const urlParams = new URLSearchParams(window.location.search);
  const submissionId = urlParams.get('id') || urlParams.get('submission_id');
  if (submissionId) {
    await hydrateFromSubmissionId(submissionId);
  }
});

// Replace the event listener (this will override the existing one)
// Wait for DOM to be fully loaded before replacing
document.addEventListener('DOMContentLoaded', () => {
  const finalizeBtn = document.getElementById('finalizeBtn');
  if (finalizeBtn) {
    // Remove existing listeners and add new one
    const newBtn = finalizeBtn.cloneNode(true);
    finalizeBtn.parentNode.replaceChild(newBtn, finalizeBtn);
    newBtn.addEventListener('click', originalFinalizeHandler);
  }
});

// Note: Keep all existing helper functions (setupFileUpload, renderPreview, etc.)
// They remain unchanged from the original file
