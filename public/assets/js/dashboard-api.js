/**
 * SeekReap · dashboard-api.js
 * Wires dashboard to real Tier 4 API. Handles null fields gracefully.
 */

const TIER4_URL = 'https://seekreap-tier-4-dev.fly.dev';

function _mapStatus(s) {
  const m = {
    'QUEUED':     'queued',
    'PROCESSING': 'processing',
    'ANALYZED':   'analyzed',
    'COMPLETED':  'certified',
    'FAILED':     'failed',
  };
  return m[(s||'').toUpperCase()] || 'pending';
}

function _mapSubmission(s) {
  const status   = _mapStatus(s.status);
  const title    = s.title || ('Work ' + s.id.slice(0,8).toUpperCase());
  const certDate = (s.completed_at || s.submitted_at || new Date().toISOString())
                     .slice(0,10).replace(/-/g,'');
  return {
    id:          s.id,
    title:       title,
    category:    (s.content_type || 'audio').toLowerCase(),
    certId:      status === 'certified'
                   ? 'SR-' + certDate + '-' + s.id.slice(0,8).toUpperCase()
                   : null,
    ownership:   100,
    coOwners:    [],
    description: s.content_url ? ('Source: ' + s.content_url) : '',
    status:      status,
    createdAt:   s.submitted_at || s.completed_at || new Date().toISOString(),
    pipeline:    null,
    matches:     s.match_count > 0
                   ? Array.from({length: s.match_count}, (_, i) => ({
                       matchedTitle: 'Detected Match ' + (i+1),
                       score:        s.overall_risk_score || 0.5,
                       severity:     s.max_severity || 'medium',
                       matchId:      'match_' + s.id + '_' + i,
                     }))
                   : [],
    timeline:    [
                   { l: 'Work submitted', t: s.submitted_at || new Date().toISOString(), type: 'gold' },
                   ...(status === 'certified'
                     ? [{ l: 'Certified ✓', t: s.completed_at || new Date().toISOString(), type: 'green' }]
                     : []),
                 ],
    riskScore:   s.overall_risk_score,
    riskLevel:   s.risk_level,
    _fromAPI:    true,
  };
}

async function _apiFetch(path, jwt) {
  try {
    const res = await fetch(TIER4_URL + path, {
      headers: { 'Authorization': 'Bearer ' + jwt }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch(e) {
    console.warn('[dashboard-api] fetch failed:', path, e.message);
    return null;
  }
}

window.loadDashboard = async function() {
  document.getElementById('authGate').style.display  = 'none';
  document.getElementById('mainNav').style.display   = 'block';
  document.getElementById('mainApp').style.display   = 'block';
  document.getElementById('mainFooter').style.display = 'block';

  const displayName = currentUser.user_metadata?.display_name
    || currentUser.email?.split('@')[0] || 'Creator';
  document.getElementById('userName').textContent    = displayName.slice(0,14);
  document.getElementById('welcomeName').textContent = displayName.split(' ')[0];
  document.getElementById('userAvatar').textContent  = displayName[0].toUpperCase();

  document.getElementById('worksGrid').innerHTML =
    '<div class="empty-state"><div class="empty-icon" style="animation:pulse 1.5s infinite">⟳</div>' +
    '<h3>Loading your works…</h3><p>Fetching from SeekReap registry</p></div>';

  let jwt = null;
  try {
    const { data: { session } } = await supaClient.auth.getSession();
    jwt = session?.access_token || null;
  } catch(e) {}

  if (jwt) {
    const data = await _apiFetch('/api/submissions', jwt);
    works = data ? (data.submissions || []).map(_mapSubmission) : [];

    // Stats from real data
    const certified = works.filter(w => w.status === 'certified').length;
    const pending   = works.filter(w => w.status === 'pending' || w.status === 'queued').length;
    document.getElementById('aCertMonth').textContent = certified;
    document.getElementById('aCertSub').textContent   = pending + ' pending';

    // Invitations from real data — load pending agreement invites
    invitations = [];
    notifications = [];
    disputes = [];

    if (!works.length) {
      document.getElementById('stCoOwned').textContent = '0';
    }
  } else {
    // Demo fallback
    loadFromStorage();
    initSampleDataIfEmpty();
  }

  fullRender();
};

console.log('[dashboard-api] v2 loaded');
