/* ═══════════════════════════════════════════════════════════
   SeekReap · license_generator.js — wired to real Tier 4 API
   ═══════════════════════════════════════════════════════════ */

var TIER4 = 'https://seekreap-tier-4-orchestrator-1.onrender.com';
var _jwt = null;
var _licenses = [];
var _currentId = null;

async function _getJwt() {
  if (_jwt) return _jwt;
  var attempts = 0;
  while (!window.supabaseClient && attempts < 40) {
    await new Promise(function(r){ setTimeout(r, 100); });
    attempts++;
  }
  if (window.supabaseClient) {
    var res = await window.supabaseClient.auth.getSession();
    _jwt = res.data.session ? res.data.session.access_token : null;
    window.supabaseClient.auth.onAuthStateChange(function(_, s){ _jwt = s ? s.access_token : null; });
  }
  return _jwt;
}

async function _apiFetch(path, opts) {
  opts = opts || {};
  var jwt = await _getJwt();
  var headers = Object.assign({ 'Content-Type': 'application/json' }, opts.headers || {});
  if (jwt) headers['Authorization'] = 'Bearer ' + jwt;
  var res = await fetch(TIER4 + path, Object.assign({}, opts, { headers: headers }));
  if (!res.ok) {
    var err = await res.json().catch(function(){ return {}; });
    throw new Error(err.error || err.detail || 'HTTP ' + res.status);
  }
  return res.json();
}

document.addEventListener('DOMContentLoaded', async function() {
  var attempts = 0;
  while (typeof window.waitForAuth !== 'function' && attempts < 40) {
    await new Promise(function(r){ setTimeout(r, 100); });
    attempts++;
  }
  if (typeof window.waitForAuth === 'function') {
    var user = await window.waitForAuth(12000);
    if (!user) { window.location.href = '/signup_signin.html'; return; }
    _setUserDisplay(user);
  }
  await loadLicenses();
  _bindEvents();
});

function _setUserDisplay(user) {
  var name = (user.user_metadata && user.user_metadata.display_name) || (user.email && user.email.split('@')[0]) || 'Creator';
  var el = document.getElementById('userNameNav');
  var av = document.getElementById('userAvatarNav');
  if (el) el.textContent = name.slice(0, 14);
  if (av) av.textContent = name[0].toUpperCase();
}

async function loadLicenses() {
  showListLoading(true);
  try {
    var data = await _apiFetch('/api/licenses/list');
    _licenses = data.licenses || [];
    renderStats();
    renderList();
    if (_licenses.length) {
      selectLicense(_licenses[0].license_id);
    } else {
      document.getElementById('emptyDetail').style.display = 'flex';
      document.getElementById('detailPanel').style.display = 'none';
    }
  } catch (e) {
    showListError(e.message);
  } finally {
    showListLoading(false);
  }
}

function renderStats() {
  var active      = _licenses.filter(function(l){ return l.status === 'active'; }).length;
  var revoked     = _licenses.filter(function(l){ return l.status === 'revoked'; }).length;
  var aiRestricted = _licenses.filter(function(l){ return l.ai_training === false; }).length;
  setText('statActive',      active);
  setText('statRevoked',     revoked);
  setText('statTotal',       _licenses.length);
  setText('statAiRestricted', aiRestricted);
}

function renderList(filter) {
  filter = filter || '';
  var container = document.getElementById('licenseList');
  if (!container) return;
  var filtered = _licenses.filter(function(l){
    return !filter || (l.license_id||'').includes(filter) ||
      (l.license_type||'').includes(filter) || (l.status||'').includes(filter) ||
      (l.title||'').toLowerCase().includes(filter);
  });
  if (!filtered.length) {
    container.innerHTML = '<div class="empty-state"><i class="fas fa-file-contract"></i><p>No licenses found</p></div>';
    return;
  }
  container.innerHTML = filtered.map(function(l) {
    var sc = { active:'badge-active', revoked:'badge-revoked', expired:'badge-draft', draft:'badge-draft' }[l.status] || 'badge-draft';
    var date = l.created_at ? new Date(l.created_at).toLocaleDateString('en-ZA', {day:'numeric',month:'short',year:'numeric'}) : '—';
    var title = l.title ? l.title : ((l.license_type||'standard').toUpperCase() + ' · ' + (l.license_id||'').slice(0,8).toUpperCase());
    return '<div class="license-item' + (_currentId===l.license_id?' active':'') + '" onclick="selectLicense(\'' + l.license_id + '\')">' +
      '<h4>' + _esc(title) + '</h4>' +
      '<div class="license-item-meta">' +
        '<span class="badge ' + sc + '">' + (l.status||'draft') + '</span>' +
        '<span style="font-size:10px;">' + (l.license_type||'standard') + '</span>' +
        '<span style="font-size:10px;color:var(--text-dim);">' + date + '</span>' +
      '</div>' +
    '</div>';
  }).join('');
}

async function selectLicense(id) {
  _currentId = id;
  renderList();
  document.getElementById('emptyDetail').style.display = 'none';
  document.getElementById('detailPanel').style.display = 'block';
  var lic = _licenses.find(function(l){ return l.license_id === id; });
  if (lic) renderDetail(lic);
  // Load full record async
  loadRecord(id);
}

function renderDetail(l) {
  var sc = { active:'badge-active', revoked:'badge-revoked', expired:'badge-draft' }[l.status] || 'badge-draft';
  var badge = document.getElementById('licStatusBadge');
  if (badge) { badge.className = 'badge ' + sc; badge.textContent = (l.status||'draft').toUpperCase(); }
  var typeBadge = document.getElementById('licTypeBadge');
  if (typeBadge) { typeBadge.textContent = (l.license_type||'standard').toUpperCase(); }
  setText('licTitle', l.title || ((l.license_type||'License').toUpperCase() + ' · ' + (l.license_id||'').slice(0,8).toUpperCase()));
  setText('licId', l.license_id || '');
  setText('licIssued', l.created_at ? new Date(l.created_at).toLocaleString('en-ZA') : '—');
  setText('licCertId', l.cert_id || '—');

  // Overview tab
  var ov = document.getElementById('overviewContent');
  if (ov) {
    ov.innerHTML =
      '<div class="license-record">' +
        '<div class="record-row"><span class="record-label">Status</span><span class="record-value" style="color:' + (l.status==='active'?'var(--green)':'var(--red)') + ';">' + (l.status||'—').toUpperCase() + '</span></div>' +
        '<div class="record-row"><span class="record-label">Type</span><span class="record-value">' + (l.license_type||'—') + '</span></div>' +
        '<div class="record-row"><span class="record-label">Territory</span><span class="record-value">' + (l.territory||'worldwide') + '</span></div>' +
        '<div class="record-row"><span class="record-label">Licensee</span><span class="record-value">' + (l.licensee_email||'Open License') + '</span></div>' +
        '<div class="record-row"><span class="record-label">Term Start</span><span class="record-value">' + (l.term_start ? new Date(l.term_start).toLocaleDateString('en-ZA') : 'Perpetual') + '</span></div>' +
        '<div class="record-row"><span class="record-label">Term End</span><span class="record-value">' + (l.term_end ? new Date(l.term_end).toLocaleDateString('en-ZA') : 'Perpetual') + '</span></div>' +
        '<div class="record-row"><span class="record-label">License Hash</span><span class="record-value" style="font-size:9px;">' + ((l.license_hash||'').slice(0,24) + '…') + '</span></div>' +
      '</div>';
  }

  // Rights tab
  renderRights(l);

  // Verify tab placeholder
  var ve = document.getElementById('verifyContent');
  if (ve) {
    ve.innerHTML = '<button class="btn btn-secondary" onclick="verifyCurrentLicense()" style="margin-bottom:14px;"><i class="fas fa-shield-alt"></i> Verify This License</button>' +
      '<div style="font-size:11px;color:var(--text-dim);">Public verification endpoint: ' +
      '<span style="font-family:\'JetBrains Mono\',monospace;font-size:10px;word-break:break-all;">' + TIER4 + '/api/licenses/verify/' + (l.license_id||'') + '</span></div>' +
      '<div id="verifyResult" style="margin-top:12px;"></div>';
  }
}

function renderRights(l) {
  var el = document.getElementById('rightsContent');
  if (!el) return;
  var yes = '<span class="rights-yes">✓</span>';
  var no  = '<span class="rights-no">—</span>';
  var r = l.rights || l;
  el.innerHTML =
    '<div class="rights-grid">' +
      '<div class="rights-row"><span>Commercial Use</span>'      + (r.commercial_use      ? yes : no) + '</div>' +
      '<div class="rights-row"><span>Derivative Works</span>'    + (r.derivative_works    ? yes : no) + '</div>' +
      '<div class="rights-row"><span>Sublicensing</span>'        + (r.sublicensing        ? yes : no) + '</div>' +
      '<div class="rights-row"><span>AI Training</span>'         + (r.ai_training         ? yes : no) + '</div>' +
      '<div class="rights-row"><span>Attribution Required</span>'+ (r.attribution_required!==false ? yes : no) + '</div>' +
    '</div>';
}

async function loadRecord(id) {
  var el = document.getElementById('recordContent');
  if (!el) return;
  el.innerHTML = '<div class="loading"><span class="spinner"></span>Loading record…</div>';
  try {
    var data = await _apiFetch('/api/licenses/' + id + '/record');
    el.innerHTML =
      '<div class="license-record" style="margin-bottom:14px;">' +
        '<div class="record-row"><span class="record-label">License ID</span><span class="record-value">' + _esc(data.license_id||'—') + '</span></div>' +
        '<div class="record-row"><span class="record-label">Type</span><span class="record-value">' + _esc(data.license_type||'—') + '</span></div>' +
        '<div class="record-row"><span class="record-label">Status</span><span class="record-value">' + _esc(data.status||'—') + '</span></div>' +
        '<div class="record-row"><span class="record-label">Valid</span><span class="record-value" style="color:' + (data.valid?'var(--green)':'var(--red)') + ';">' + (data.valid?'YES':'NO') + '</span></div>' +
        '<div class="record-row"><span class="record-label">Territory</span><span class="record-value">' + _esc(data.territory||'worldwide') + '</span></div>' +
        '<div class="record-row"><span class="record-label">Term</span><span class="record-value">' + _esc((data.term&&data.term.start)||'Perpetual') + ' → ' + _esc((data.term&&data.term.end)||'Perpetual') + '</span></div>' +
        '<div class="record-row"><span class="record-label">Integrity Hash</span><span class="record-value" style="font-size:9px;">' + ((data.integrity&&data.integrity.license_hash||'').slice(0,24) + '…') + '</span></div>' +
        '<div class="record-row"><span class="record-label">Activated</span><span class="record-value">' + (data.integrity&&data.integrity.activated_at ? new Date(data.integrity.activated_at).toLocaleString('en-ZA') : '—') + '</span></div>' +
      '</div>' +
      '<div style="font-size:10px;color:var(--text-dim);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px;">Event Ledger</div>' +
      (data.events && data.events.length ? data.events.map(function(e) {
        return '<div class="event-item"><div class="event-dot"></div><div><div class="event-text">' + _fmtEvent(e.event) + '</div>' +
          (e.notes ? '<div style="font-size:10px;color:var(--text-dim);">' + _esc(e.notes) + '</div>' : '') +
          '<div class="event-time">' + new Date(e.at).toLocaleString('en-ZA') + '</div></div></div>';
      }).join('') : '<div style="font-size:12px;color:var(--text-dim);">No events recorded</div>');
  } catch (e) {
    el.innerHTML = '<div style="color:var(--text-dim);font-size:12px;">Could not load record: ' + e.message + '</div>';
  }
}

async function verifyCurrentLicense() {
  if (!_currentId) return;
  var el = document.getElementById('verifyResult');
  if (!el) { switchTab('verify'); el = document.getElementById('verifyResult'); }
  if (el) el.innerHTML = '<div class="loading"><span class="spinner"></span>Verifying…</div>';
  try {
    var data = await fetch(TIER4 + '/api/licenses/verify/' + _currentId).then(function(r){ return r.json(); });
    var cls = data.valid ? 'verify-valid' : 'verify-invalid';
    var icon = data.valid ? '✓' : '✗';
    if (el) el.innerHTML =
      '<div class="verify-box ' + cls + '">' +
        '<strong>' + icon + ' ' + (data.valid ? 'License Valid' : 'License Invalid') + '</strong><br>' +
        '<span style="font-size:11px;color:var(--text-dim);">Status: ' + (data.status||'—') + ' · Type: ' + (data.license_type||'—') + ' · Territory: ' + ((data.rights&&data.rights.territory)||'—') + '</span>' +
      '</div>';
  } catch (e) {
    if (el) el.innerHTML = '<div style="color:var(--red);font-size:12px;">Verification failed: ' + e.message + '</div>';
  }
}

function copyVerifyLink() {
  if (!_currentId) return;
  var url = TIER4 + '/api/licenses/verify/' + _currentId;
  navigator.clipboard.writeText(url).then(function(){ showToast('Verification link copied'); }).catch(function(){ showToast(url); });
}

async function revokeCurrentLicense() {
  if (!_currentId) return;
  if (!confirm('Revoke this license? This cannot be undone.')) return;
  try {
    var jwt = await _getJwt();
    var res = await fetch(TIER4 + '/api/licenses/' + _currentId + '/revoke', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + jwt, 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: 'licensor_initiated' })
    });
    if (!res.ok) throw new Error('Revocation failed');
    showToast('License revoked');
    await loadLicenses();
  } catch (e) { showToast(e.message, true); }
}

async function issueLicense() {
  var submissionId   = (document.getElementById('newSubmissionId').value||'').trim();
  var licenseeEmail  = (document.getElementById('newLicenseeEmail').value||'').trim();
  var licenseType    = document.getElementById('newLicenseType').value;
  var territory      = document.getElementById('newTerritory').value;
  var commercialUse  = document.getElementById('newCommercialUse').checked;
  var derivativeWorks= document.getElementById('newDerivativeWorks').checked;
  var sublicensing   = document.getElementById('newSublicensing').checked;
  var aiTraining     = document.getElementById('newAiTraining').checked;
  var termStart      = document.getElementById('newTermStart').value || null;
  var termEnd        = document.getElementById('newTermEnd').value || null;
  var notes          = (document.getElementById('newNotes').value||'').trim();

  if (!submissionId) { showToast('Submission ID is required', true); return; }

  var btn = document.getElementById('issueLicenseSubmit');
  btn.disabled = true; btn.textContent = 'Issuing…';
  try {
    await _apiFetch('/api/licenses/issue', {
      method: 'POST',
      body: JSON.stringify({
        submission_id:    submissionId,
        licensee_email:   licenseeEmail || null,
        license_type:     licenseType,
        territory:        territory,
        commercial_use:   commercialUse,
        derivative_works: derivativeWorks,
        sublicensing:     sublicensing,
        ai_training:      aiTraining,
        term_start:       termStart,
        term_end:         termEnd,
        notes:            notes,
      })
    });
    closeModal('issueLicenseModal');
    showToast('License issued');
    await loadLicenses();
  } catch (e) {
    showToast(e.message, true);
  } finally {
    btn.disabled = false; btn.textContent = 'Issue License';
  }
}

function switchTab(tabId) {
  document.querySelectorAll('.tab').forEach(function(t){ t.classList.remove('active'); });
  document.querySelectorAll('.tab-pane').forEach(function(p){ p.classList.remove('active'); });
  var btn = document.querySelector('[data-tab="' + tabId + '"]');
  var pane = document.getElementById('pane-' + tabId);
  if (btn) btn.classList.add('active');
  if (pane) pane.classList.add('active');
  if (tabId === 'record' && _currentId) loadRecord(_currentId);
  if (tabId === 'verify' && _currentId) verifyCurrentLicense();
}

function _bindEvents() {
  document.querySelectorAll('.tab').forEach(function(t) {
    t.addEventListener('click', function(){ switchTab(t.dataset.tab); });
  });
  var search = document.getElementById('searchInput');
  if (search) search.addEventListener('input', function(e){ renderList(e.target.value.toLowerCase()); });
  document.querySelectorAll('.modal-overlay').forEach(function(m) {
    m.addEventListener('click', function(e){ if (e.target === m) m.classList.remove('open'); });
  });
}

function setText(id, v) { var el=document.getElementById(id); if(el) el.textContent=v; }
function showListLoading(v) { var el=document.getElementById('listLoading'); if(el) el.style.display=v?'inline-block':'none'; }
function showListError(msg) { var el=document.getElementById('licenseList'); if(el) el.innerHTML='<div class="empty-state"><i class="fas fa-exclamation-circle" style="color:var(--red);"></i><p style="color:var(--red);">' + msg + '</p></div>'; }
function showToast(msg, isErr) {
  var t=document.createElement('div'); t.className='toast';
  t.style.borderLeftColor=isErr?'var(--red)':'var(--green)'; t.textContent=msg;
  document.body.appendChild(t);
  setTimeout(function(){ t.style.opacity='0'; t.style.transition='opacity 0.3s'; setTimeout(function(){ t.remove(); },300); },2800);
}
function _esc(str) { if(!str) return ''; var d=document.createElement('div'); d.textContent=str; return d.innerHTML; }
function _fmtEvent(t) { return (t||'').replace(/_/g,' ').replace(/\b\w/g,function(c){ return c.toUpperCase(); }); }

window.loadLicenses        = loadLicenses;
window.selectLicense       = selectLicense;
window.openModal           = openModal;
window.closeModal          = closeModal;
window.issueLicense        = issueLicense;
window.verifyCurrentLicense= verifyCurrentLicense;
window.copyVerifyLink      = copyVerifyLink;
window.revokeCurrentLicense= revokeCurrentLicense;

function openModal(id) { var el=document.getElementById(id); if(el) el.classList.add('open'); }
function closeModal(id) { var el=document.getElementById(id); if(el) el.classList.remove('open'); }
