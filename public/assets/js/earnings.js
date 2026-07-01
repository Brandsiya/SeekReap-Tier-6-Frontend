/* ═══════════════════════════════════════════════════════════
   SeekReap · earnings.js — wired to real Tier 4 API
   ═══════════════════════════════════════════════════════════ */

const TIER4 = 'https://seekreap-tier-4-orchestrator-1.onrender.com';
let _jwt = null;
let _earnings = null;
let _payouts = null;

async function _getJwt() {
  if (_jwt) return _jwt;
  let attempts = 0;
  while (!window.supabaseClient && attempts < 40) {
    await new Promise(r => setTimeout(r, 100));
    attempts++;
  }
  if (window.supabaseClient) {
    const { data: { session } } = await window.supabaseClient.auth.getSession();
    _jwt = session?.access_token || null;
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
  await loadEarnings();
  _bindEvents();
});

function _setUserDisplay(user) {
  const name = user.user_metadata?.display_name || user.email?.split('@')[0] || 'Creator';
  const el = document.getElementById('userNameNav');
  const av = document.getElementById('userAvatarNav');
  if (el) el.textContent = name.slice(0, 14);
  if (av) av.textContent = name[0].toUpperCase();
}

async function loadEarnings() {
  showLoading(true);
  try {
    [_earnings, _payouts] = await Promise.all([
      _apiFetch('/api/earnings/me'),
      _apiFetch('/api/payouts/me'),
    ]);
    renderStats();
    renderAssets();
    renderPayouts();
    renderCurrencyBreakdown();
  } catch (e) {
    showError(e.message);
  } finally {
    showLoading(false);
  }
}

function renderStats() {
  const e = _earnings || {};
  const total = e.total_earned || {};
  const paid  = e.paid || {};
  const pending = e.pending || {};
  const p = _payouts || {};

  // Primary currency display (ZAR first, then USD, then first available)
  const currencies = Object.keys(total);
  const primaryCurrency = currencies.includes('ZAR') ? 'ZAR' :
                          currencies.includes('USD') ? 'USD' :
                          currencies[0] || null;

  setText('statTotalEarned', primaryCurrency
    ? _fmtCurrency(total[primaryCurrency], primaryCurrency)
    : 'R0.00');

  setText('statPaid', primaryCurrency && paid[primaryCurrency]
    ? _fmtCurrency(paid[primaryCurrency], primaryCurrency)
    : 'R0.00');

  setText('statPending', primaryCurrency && pending[primaryCurrency]
    ? _fmtCurrency(pending[primaryCurrency], primaryCurrency)
    : 'R0.00');

  setText('statAssets', (e.assets || []).length);
  setText('statPayouts', (p.payouts || []).length);
  setText('statPayoutTotal', p.total ? _fmtCurrency(p.total, primaryCurrency || 'ZAR') : 'R0.00');
}

function renderAssets() {
  const el = document.getElementById('assetEarningsList');
  if (!el) return;
  const assets = (_earnings && _earnings.assets) || [];
  if (!assets.length) {
    el.innerHTML = _emptyState('fa-coins', 'No asset earnings yet', 'Revenue will appear here once your certified works generate income.');
    return;
  }
  el.innerHTML = assets.map(a => {
    const currencies = Object.keys(a.total_earned || {});
    const amtStr = currencies.map(c => _fmtCurrency(a.total_earned[c], c)).join(' · ') || 'R0.00';
    return `<div class="list-item">
      <div class="list-item-main">
        <div class="list-item-title">${_esc(a.title || a.submission_id || 'Untitled')}</div>
        <div class="list-item-meta">${_esc(a.work_type || '—')} · ${_esc(a.submission_id ? a.submission_id.slice(0,8).toUpperCase() : '—')}</div>
      </div>
      <div class="list-item-value">${amtStr}</div>
    </div>`;
  }).join('');
}

function renderPayouts() {
  const el = document.getElementById('payoutsList');
  if (!el) return;
  const payouts = (_payouts && _payouts.payouts) || [];
  if (!payouts.length) {
    el.innerHTML = _emptyState('fa-money-bill-wave', 'No payouts yet', 'Payouts will appear here once earnings are processed.');
    return;
  }
  el.innerHTML = payouts.map(p => {
    const statusClass = { paid: 'badge-active', pending: 'badge-pending', failed: 'badge-revoked' }[p.status] || 'badge-draft';
    const date = p.created_at ? new Date(p.created_at).toLocaleDateString('en-ZA', {day:'numeric',month:'short',year:'numeric'}) : '—';
    return `<div class="list-item">
      <div class="list-item-main">
        <div class="list-item-title">${_esc(p.payout_id ? p.payout_id.slice(0,16).toUpperCase() : 'Payout')}</div>
        <div class="list-item-meta">${date} · <span class="badge ${statusClass}">${p.status || '—'}</span></div>
      </div>
      <div class="list-item-value">${_fmtCurrency(p.amount, p.currency || 'ZAR')}</div>
    </div>`;
  }).join('');
}

function renderCurrencyBreakdown() {
  const el = document.getElementById('currencyBreakdown');
  if (!el) return;
  const total = (_earnings && _earnings.total_earned) || {};
  const currencies = Object.keys(total);
  if (!currencies.length) {
    el.innerHTML = '<div style="color:var(--text-dim);font-size:12px;">No revenue recorded yet.</div>';
    return;
  }
  el.innerHTML = currencies.map(c => `
    <div class="record-row">
      <span class="record-label">${c}</span>
      <span class="record-value">${_fmtCurrency(total[c], c)}</span>
    </div>`).join('');
}

function _fmtCurrency(amount, currency) {
  if (!amount && amount !== 0) return '—';
  const sym = { ZAR:'R', USD:'$', EUR:'€', GBP:'£' }[currency] || (currency + ' ');
  return sym + parseFloat(amount).toFixed(2);
}

function _emptyState(icon, title, msg) {
  return `<div class="empty-state">
    <i class="fas ${icon}"></i>
    <p><strong>${title}</strong></p>
    <p>${msg}</p>
  </div>`;
}

function _bindEvents() {
  document.getElementById('refreshBtn')?.addEventListener('click', loadEarnings);
  document.getElementById('exportBtn')?.addEventListener('click', exportEarnings);
}

function exportEarnings() {
  const data = { earnings: _earnings, payouts: _payouts, exported_at: new Date().toISOString() };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'seekreap_earnings_' + new Date().toISOString().slice(0,10) + '.json';
  a.click();
}

function showLoading(v) {
  const el = document.getElementById('loadingState');
  if (el) el.style.display = v ? 'block' : 'none';
}

function showError(msg) {
  const el = document.getElementById('errorState');
  if (el) { el.textContent = 'Error: ' + msg; el.style.display = 'block'; }
  showLoading(false);
}

function setText(id, v) { const el = document.getElementById(id); if (el) el.textContent = v; }
function _esc(str) { if (!str) return ''; const d = document.createElement('div'); d.textContent = str; return d.innerHTML; }

window.loadEarnings = loadEarnings;
window.exportEarnings = exportEarnings;
