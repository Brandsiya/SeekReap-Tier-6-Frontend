/* ═══════════════════════════════════════════════════════════
   SeekReap · agreements.js — wired to real Tier 4 API
   ═══════════════════════════════════════════════════════════ */

const TIER4 = 'https://seekreap-tier-4-orchestrator-1.onrender.com';

let _jwt = null;
let _agreements = [];
let _currentId = null;
let _currentDetail = null;

async function _getJwt() {
  if (_jwt) return _jwt;
  // Wait for supabaseClient if not ready yet
  let attempts = 0;
  while (!window.supabaseClient && attempts < 30) {
    await new Promise(r => setTimeout(r, 100));
    attempts++;
  }
  if (window.supabaseClient) {
    const { data: { session } } = await window.supabaseClient.auth.getSession();
    _jwt = session?.access_token || null;
    if (!_jwt && window.currentUser) {
      // Re-fetch session
      const { data: { session: s2 } } = await window.supabaseClient.auth.getSession();
      _jwt = s2?.access_token || null;
    }
    window.supabaseClient.auth.onAuthStateChange((_, s) => { _jwt = s?.access_token || null; });
  }
  return _jwt;
}

async function _apiFetch(path, opts = {}) {
  const jwt = await _getJwt();
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  if (jwt) headers['Authorization'] = 'Bearer ' + jwt;
  const res = await fetch(TIER4 + path, { ...opts, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.detail || 'HTTP ' + res.status);
  }
  return res.json();
}

document.addEventListener('DOMContentLoaded', async () => {
  addParticipantRow();
  _bindEvents();

  // Wait for auth-guard to expose waitForAuth
  let attempts = 0;
  while (typeof window.waitForAuth !== 'function' && attempts < 40) {
    await new Promise(r => setTimeout(r, 100));
    attempts++;
  }

  if (typeof window.waitForAuth === 'function') {
    const user = await window.waitForAuth(12000);
    if (!user) { window.location.href = '/signup_signin.html'; return; }
    _setUserDisplay(user);
  }

  await loadAgreements();
});

function _setUserDisplay(user) {
  const name = user.user_metadata?.display_name || user.email?.split('@')[0] || 'Creator';
  const el = document.getElementById('userNameNav');
  const av = document.getElementById('userAvatarNav');
  if (el) el.textContent = name.slice(0, 14);
  if (av) av.textContent = name[0].toUpperCase();
}

async function loadAgreements() {
  showListLoading(true);
  try {
    const data = await _apiFetch('/api/agreements');
    _agreements = data.agreements || [];
    renderStats();
    renderList();
    if (_agreements.length) selectAgreement(_agreements[0].id);
    else {
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
  const active  = _agreements.filter(a => a.status === 'active').length;
  const pending = _agreements.filter(a => a.status === 'pending').length;
  const coowned = _agreements.filter(a => a.participant_count > 1).length;
  setText('statTotal',   _agreements.length);
  setText('statActive',  active);
  setText('statPending', pending);
  setText('statCoOwned', coowned);
}

function renderList(filter = '') {
  const container = document.getElementById('agreementList');
  if (!container) return;
  const filtered = _agreements.filter(a =>
    !filter || a.id.toLowerCase().includes(filter) || (a.status||'').includes(filter)
  );
  if (!filtered.length) {
    container.innerHTML = '<div class="empty-state"><i class="fas fa-file-signature"></i><p>No agreements found</p></div>';
    return;
  }
  container.innerHTML = filtered.map(a => {
    const sc = { active:'badge-active', pending:'badge-pending', revoked:'badge-revoked' }[a.status] || 'badge-draft';
    const date = a.created_at ? new Date(a.created_at).toLocaleDateString('en-ZA',{day:'numeric',month:'short',year:'numeric'}) : '—';
    const title = 'Agreement ' + a.id.slice(0,8).toUpperCase();
    return '<div class="agreement-item' + (_currentId===a.id?' active':'') + '" onclick="selectAgreement(\'' + a.id + '\')">' +
      '<h4>' + title + '</h4>' +
      '<div class="agreement-item-meta">' +
        '<span class="badge ' + sc + '">' + (a.status||'—') + '</span>' +
        '<p>' + (a.participant_count||1) + ' participant' + (a.participant_count!==1?'s':'') + ' · ' + date + '</p>' +
      '</div>' +
    '</div>';
  }).join('');
}

async function selectAgreement(id) {
  _currentId = id;
  renderList();
  document.getElementById('emptyDetail').style.display = 'none';
  document.getElementById('detailPanel').style.display = 'block';
  showDetailLoading(true);
  try {
    const data = await _apiFetch('/api/agreements/' + id);
    _currentDetail = data;
    renderDetail(data);
  } catch (e) {
    showDetailError(e.message);
  } finally {
    showDetailLoading(false);
  }
}

function renderDetail(d) {
  const sc = { active:'badge-active', pending:'badge-pending', revoked:'badge-revoked' }[d.status] || 'badge-draft';
  const badge = document.getElementById('detailStatusBadge');
  if (badge) { badge.className = 'badge ' + sc; badge.textContent = (d.status||'').toUpperCase(); }
  setText('detailAgreementId', d.id);
  setText('detailCreated',   d.created_at   ? new Date(d.created_at).toLocaleString('en-ZA')   : '—');
  setText('detailActivated', d.activated_at ? new Date(d.activated_at).toLocaleString('en-ZA') : '—');
  renderParticipants(d.participants || []);
  renderRights(d);
  loadRevenue(d.submission_id);
  switchTab('participants');
}

function renderParticipants(participants) {
  const tbody = document.getElementById('participantsTbody');
  if (!tbody) return;
  if (!participants.length) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-dim);padding:20px;">No participants</td></tr>';
    return;
  }
  const colors = ['#C9993A','#4CAF50','#2196F3','#FF9800','#9C27B0'];
  tbody.innerHTML = participants.map(function(p, i) {
    const sc = { accepted:'badge-active', invited:'badge-pending', declined:'badge-revoked' }[p.status] || 'badge-draft';
    const initial = (p.display_name||p.email||'?')[0].toUpperCase();
    return '<tr>' +
      '<td><div style="display:flex;align-items:center;gap:8px;">' +
        '<div style="width:26px;height:26px;border-radius:50%;background:' + colors[i%colors.length] + ';display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#0a0a0f;">' + initial + '</div>' +
        '<div><div style="font-size:12px;font-weight:600;">' + (p.display_name||p.email||'—') + '</div>' +
        '<div style="font-size:10px;color:var(--text-dim);">' + (p.email||'') + '</div></div>' +
      '</div></td>' +
      '<td style="font-size:12px;">' + (p.role||'—') + '</td>' +
      '<td><div style="font-size:12px;font-weight:600;color:var(--gold-light);">' + (p.ownership_pct||0) + '%</div>' +
        '<div class="own-bar-wrap"><div class="own-bar"><div class="own-bar-fill" style="width:' + (p.ownership_pct||0) + '%;background:' + colors[i%colors.length] + ';"></div></div></div>' +
      '</td>' +
      '<td style="font-family:\'JetBrains Mono\',monospace;font-size:11px;color:var(--gold-light);">' + (p.royalty_pct||p.ownership_pct||0) + '%</td>' +
      '<td><span class="badge ' + sc + '">' + (p.status||'—') + '</span></td>' +
    '</tr>';
  }).join('');
}

function renderRights(d) {
  const el = document.getElementById('rightsContent');
  if (!el) return;
  const yes = '<span style="color:var(--green);font-size:14px;">✓</span>';
  const no  = '<span style="color:var(--text-dim);font-size:14px;">—</span>';
  el.innerHTML =
    '<table class="sr-table">' +
    '<thead><tr><th>Right</th><th style="text-align:center;">Granted</th><th>Description</th></tr></thead>' +
    '<tbody>' +
    '<tr><td>Commercial Use</td><td style="text-align:center;">' + (d.commercial_use?yes:no) + '</td><td style="font-size:11px;color:var(--text-dim);">Revenue-generating usage</td></tr>' +
    '<tr><td>Derivative Works</td><td style="text-align:center;">' + (d.derivative_works?yes:no) + '</td><td style="font-size:11px;color:var(--text-dim);">Remixes, adaptations</td></tr>' +
    '<tr><td>Sublicensing</td><td style="text-align:center;">' + (d.sublicensing?yes:no) + '</td><td style="font-size:11px;color:var(--text-dim);">Third-party licensing</td></tr>' +
    '<tr><td>AI Training</td><td style="text-align:center;">' + (d.ai_training_permitted?yes:no) + '</td><td style="font-size:11px;color:var(--text-dim);">Use in ML datasets</td></tr>' +
    '<tr><td>Attribution Required</td><td style="text-align:center;">' + (d.attribution_required?yes:no) + '</td><td style="font-size:11px;color:var(--text-dim);">Credit must be given</td></tr>' +
    '</tbody></table>' +
    (d.agreement_hash ? '<div style="margin-top:14px;padding:12px;background:var(--bg4);border-radius:8px;font-size:10px;color:var(--text-dim);">Agreement Hash<br><span style="font-family:\'JetBrains Mono\',monospace;word-break:break-all;color:var(--gold-light);">' + d.agreement_hash + '</span></div>' : '');
}

async function loadRevenue(submissionId) {
  const el = document.getElementById('revenueContent');
  if (!el) return;
  if (!submissionId) { el.innerHTML = '<div class="empty-state"><i class="fas fa-chart-line"></i><p>No submission linked</p></div>'; return; }
  el.innerHTML = '<div class="loading"><span class="spinner"></span>Loading revenue…</div>';
  try {
    const data = await _apiFetch('/api/assets/' + submissionId + '/revenue');
    if (!data.events || !data.events.length) {
      el.innerHTML = '<div class="empty-state"><i class="fas fa-chart-line"></i><p>No revenue recorded yet</p></div>';
      return;
    }
    const summary = data.summary || [];
    el.innerHTML =
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-bottom:18px;">' +
      summary.map(function(s) {
        return '<div style="background:var(--bg4);border:1px solid rgba(255,255,255,0.05);border-radius:10px;padding:14px;">' +
          '<div style="font-size:10px;color:var(--text-dim);text-transform:uppercase;">' + s.currency + ' Net</div>' +
          '<div style="font-size:20px;font-weight:700;color:var(--gold-light);font-family:\'Cormorant Garamond\',serif;margin-top:6px;">' + s.currency + ' ' + s.total_net.toFixed(2) + '</div>' +
          '<div style="font-size:10px;color:var(--text-dim);margin-top:2px;">' + s.event_count + ' event' + (s.event_count!==1?'s':'') + ' · ' + s.currency + ' ' + s.total_gross.toFixed(2) + ' gross</div>' +
        '</div>';
      }).join('') + '</div>' +
      data.events.map(function(ev) {
        return '<div class="ledger-item">' +
          '<div><div class="ledger-source">' + _fmtSource(ev.source_type) + '</div>' +
          '<div class="ledger-date">' + new Date(ev.created_at).toLocaleDateString('en-ZA',{day:'numeric',month:'short',year:'numeric'}) + '</div>' +
          (ev.notes ? '<div style="font-size:10px;color:var(--text-dim);margin-top:3px;">' + ev.notes + '</div>' : '') +
          '<div class="ledger-allocs">' +
          ev.allocations.map(function(a) {
            return '<div class="ledger-alloc-row"><span>' + (a.role||'Creator') + ' · ' + a.allocation_pct + '%</span><span style="color:var(--gold-light);">' + ev.currency + ' ' + a.net_share.toFixed(2) + '</span></div>';
          }).join('') +
          '</div></div>' +
          '<div class="ledger-amount">' + ev.currency + ' ' + ev.net_amount.toFixed(2) + '</div>' +
        '</div>';
      }).join('');
  } catch (e) {
    el.innerHTML = '<div style="color:var(--text-dim);font-size:12px;">Could not load revenue: ' + e.message + '</div>';
  }
}

async function loadChain(d) {
  const el = document.getElementById('chainContent');
  if (!el) return;
  el.innerHTML = '<div class="loading"><span class="spinner"></span>Verifying chain…</div>';
  try {
    const chain = await fetch(TIER4 + '/api/agreements/' + d.id + '/verify-chain').then(function(r){ return r.json(); });
    const cls = chain.chain_valid ? 'chain-valid' : 'chain-invalid';
    el.innerHTML =
      '<div class="chain-result ' + cls + '">' +
        '<strong>' + (chain.chain_valid?'✓ Chain Valid':'✗ Chain Invalid') + '</strong>' +
        ' — ' + chain.event_count + ' events · Final hash: <span style="font-family:\'JetBrains Mono\',monospace;font-size:10px;">' + (chain.final_hash||'').slice(0,16) + '…</span>' +
      '</div>' +
      (chain.errors&&chain.errors.length ? '<div style="margin-top:10px;font-size:11px;color:var(--red);">' + chain.errors.map(function(e){return e.error+' at event '+e.event_index;}).join('<br>') + '</div>' : '') +
      '<div style="margin-top:16px;" id="chainEventsList"></div>';
    const evts = await _apiFetch('/api/agreements/' + d.id + '/events');
    const evList = document.getElementById('chainEventsList');
    if (evList && evts.events) {
      evList.innerHTML = evts.events.slice().reverse().map(function(e) {
        return '<div class="audit-item"><div class="audit-dot"></div><div>' +
          '<div class="audit-text">' + _fmtEvent(e.event_type) + '</div>' +
          '<div class="audit-time">' + new Date(e.created_at).toLocaleString('en-ZA') + '</div>' +
        '</div></div>';
      }).join('');
    }
  } catch (err) {
    el.innerHTML = '<div style="color:var(--text-dim);font-size:12px;">Could not verify chain: ' + err.message + '</div>';
  }
}

async function createAgreement() {
  const submissionId = (document.getElementById('newSubmissionId').value||'').trim();
  const commercialUse   = document.getElementById('newCommercialUse').checked;
  const derivativeWorks = document.getElementById('newDerivativeWorks').checked;
  const aiTraining      = document.getElementById('newAiTraining').checked;
  const participants = [];
  document.querySelectorAll('.new-participant-row').forEach(function(row) {
    const email = (row.querySelector('.part-email').value||'').trim();
    const role  = (row.querySelector('.part-role').value||'').trim();
    const pct   = parseFloat(row.querySelector('.part-pct').value)||0;
    if (email) participants.push({ email:email, display_name:email, role:role||'co-creator', ownership_pct:pct });
  });
  if (!submissionId) { showToast('Submission ID is required', true); return; }
  if (!participants.length) { showToast('Add at least one participant', true); return; }
  const totalPct = participants.reduce(function(s,p){return s+p.ownership_pct;}, 0);
  if (Math.abs(totalPct - 100) > 0.1) { showToast('Ownership must sum to 100% (currently ' + totalPct + '%)', true); return; }
  const btn = document.getElementById('createAgreementSubmit');
  btn.disabled = true; btn.textContent = 'Creating…';
  try {
    await _apiFetch('/api/agreements/create', {
      method: 'POST',
      body: JSON.stringify({
        submission_id: submissionId,
        participants: participants,
        rights: { commercial_use:commercialUse, derivative_works:derivativeWorks, ai_training_permitted:aiTraining, attribution_required:true }
      })
    });
    closeModal('createModal');
    showToast('Agreement created');
    await loadAgreements();
  } catch (e) {
    showToast(e.message, true);
  } finally {
    btn.disabled = false; btn.textContent = 'Create Agreement';
  }
}

async function revokeAgreement() {
  if (!_currentId) return;
  if (!confirm('Revoke this agreement? This cascades to all delegations and cannot be undone.')) return;
  try {
    await _apiFetch('/api/agreements/' + _currentId + '/revoke', { method:'POST', body:JSON.stringify({reason:'creator_initiated'}) });
    showToast('Agreement revoked');
    await loadAgreements();
  } catch (e) { showToast(e.message, true); }
}

async function generatePdf() {
  if (!_currentId) return;
  try {
    const jwt = await _getJwt();
    const res = await fetch(TIER4 + '/api/agreements/' + _currentId + '/generate-pdf', {
      method:'POST', headers:{ 'Authorization':'Bearer '+jwt, 'Content-Type':'application/json' }
    });
    if (!res.ok) throw new Error('PDF generation failed');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'agreement-' + _currentId.slice(0,8) + '.pdf';
    a.click(); URL.revokeObjectURL(url);
    showToast('PDF downloaded');
  } catch (e) { showToast(e.message, true); }
}

function addParticipantRow() {
  const container = document.getElementById('participantRows');
  if (!container) return;
  const row = document.createElement('div');
  row.className = 'new-participant-row';
  row.style.cssText = 'display:grid;grid-template-columns:2fr 1fr 70px auto;gap:6px;margin-bottom:8px;';
  row.innerHTML =
    '<input class="part-email" type="email" placeholder="email@example.com" style="padding:9px 10px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:var(--text);font-family:\'DM Sans\',sans-serif;font-size:12px;">' +
    '<input class="part-role" type="text" placeholder="Role" style="padding:9px 10px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:var(--text);font-family:\'DM Sans\',sans-serif;font-size:12px;">' +
    '<input class="part-pct" type="number" min="1" max="99" placeholder="%" style="padding:9px 10px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:var(--text);font-family:\'DM Sans\',sans-serif;font-size:12px;">' +
    '<button onclick="this.parentElement.remove()" style="background:rgba(244,67,54,0.1);border:1px solid rgba(244,67,54,0.2);color:var(--red);border-radius:6px;padding:7px 10px;cursor:pointer;font-size:12px;">✕</button>';
  container.appendChild(row);
}

function switchTab(tabId) {
  document.querySelectorAll('.tab').forEach(function(t){ t.classList.remove('active'); });
  document.querySelectorAll('.tab-pane').forEach(function(p){ p.classList.remove('active'); });
  var tabBtn = document.querySelector('[data-tab="' + tabId + '"]');
  var pane = document.getElementById('pane-' + tabId);
  if (tabBtn) tabBtn.classList.add('active');
  if (pane) pane.classList.add('active');
  if (tabId === 'chain' && _currentDetail) loadChain(_currentDetail);
}

function openModal(id) { var el=document.getElementById(id); if(el) el.classList.add('open'); }
function closeModal(id) { var el=document.getElementById(id); if(el) el.classList.remove('open'); }

function _bindEvents() {
  document.querySelectorAll('.tab').forEach(function(t) {
    t.addEventListener('click', function(){ switchTab(t.dataset.tab); });
  });
  var search = document.getElementById('searchInput');
  if (search) search.addEventListener('input', function(e){ renderList(e.target.value.toLowerCase()); });
  document.querySelectorAll('.modal-overlay').forEach(function(m) {
    m.addEventListener('click', function(e){ if(e.target===m) m.classList.remove('open'); });
  });
}

function setText(id, v) { var el=document.getElementById(id); if(el) el.textContent=v; }
function showListLoading(v) { var el=document.getElementById('listLoading'); if(el) el.style.display=v?'block':'none'; }
function showListError(msg) { var el=document.getElementById('agreementList'); if(el) el.innerHTML='<div class="empty-state"><i class="fas fa-exclamation-circle" style="color:var(--red);"></i><p style="color:var(--red);">' + msg + '</p></div>'; }
function showDetailLoading(v) { var el=document.getElementById('detailLoading'); if(el) el.style.display=v?'flex':'none'; var p=document.getElementById('detailPanel'); if(p) p.style.opacity=v?'0.5':'1'; }
function showDetailError(msg) { var el=document.getElementById('detailPanel'); if(el) el.innerHTML='<div class="empty-state" style="padding:60px;"><i class="fas fa-exclamation-circle" style="color:var(--red);"></i><p style="color:var(--red);">' + msg + '</p></div>'; }
function showToast(msg, isErr) {
  var t=document.createElement('div'); t.className='toast';
  t.style.borderLeftColor=isErr?'var(--red)':'var(--green)'; t.textContent=msg;
  document.body.appendChild(t);
  setTimeout(function(){ t.style.opacity='0'; t.style.transition='opacity 0.3s'; setTimeout(function(){ t.remove(); },300); },2800);
}
function _fmtSource(t) { var m={license_fee:'License Fee',sync_fee:'Sync Fee',streaming:'Streaming',download:'Download',subscription:'Subscription',marketplace:'Marketplace',manual:'Manual',other:'Other'}; return m[t]||t; }
function _fmtEvent(t) { return (t||'').replace(/_/g,' ').replace(/\b\w/g,function(c){return c.toUpperCase();}); }

window.selectAgreement   = selectAgreement;
window.openModal         = openModal;
window.closeModal        = closeModal;
window.createAgreement   = createAgreement;
window.revokeAgreement   = revokeAgreement;
window.generatePdf       = generatePdf;
window.addParticipantRow = addParticipantRow;
window.loadAgreements    = loadAgreements;
