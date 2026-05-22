/**
 * SeekReap · dashboard-api.js
 * Replaces localStorage simulation with real Tier 4 API calls.
 * Loaded after dashboard.html inline script — overrides loadDashboard().
 */

const TIER4_URL = 'https://seekreap-tier-4-dev.fly.dev';

// Map Tier 4 submission status to dashboard display status
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

// Map Tier 4 submission to dashboard work object
function _mapSubmission(s) {
  return {
    id:          s.id,
    title:       s.title || 'Untitled Work',
    category:    s.content_type || 'audio',
    certId:      _mapStatus(s.status) === 'certified'
                   ? `SR-${(s.completed_at||s.submitted_at||'').slice(0,10).replace(/-/g,'')}-${s.id.slice(0,8).toUpperCase()}`
                   : null,
    ownership:   100,
    coOwners:    [],
    description: '',
    status:      _mapStatus(s.status),
    createdAt:   s.submitted_at || new Date().toISOString(),
    pipeline:    null,
    matches:     s.match_count > 0 ? Array.from({length: s.match_count}, (_, i) => ({
                   matchedTitle: 'Detected Match ' + (i+1),
                   score:        s.overall_risk_score || 0.5,
                   severity:     s.max_severity || 'medium',
                   matchId:      'match_' + s.id + '_' + i,
                 })) : [],
    timeline:    [
                   {l: 'Work submitted', t: s.submitted_at || new Date().toISOString(), type: 'gold'},
                   ..._mapStatus(s.status) === 'certified'
                     ? [{l: 'Certified ✓', t: s.completed_at || new Date().toISOString(), type: 'green'}]
                     : [],
                 ],
    _fromAPI:    true,
  };
}

// Fetch submissions from Tier 4 and populate works array
async function loadWorksFromAPI(jwt) {
  try {
    const res = await fetch(`${TIER4_URL}/api/submissions`, {
      headers: { 'Authorization': 'Bearer ' + jwt }
    });
    if (!res.ok) throw new Error('submissions fetch failed: ' + res.status);
    const data = await res.json();
    return (data.submissions || []).map(_mapSubmission);
  } catch (e) {
    console.error('loadWorksFromAPI failed:', e);
    return [];
  }
}

// Fetch agreements from Tier 4
async function loadAgreementsFromAPI(jwt) {
  try {
    const res = await fetch(`${TIER4_URL}/api/agreements`, {
      headers: { 'Authorization': 'Bearer ' + jwt }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.agreements || [];
  } catch(e) {
    return [];
  }
}

// Override loadDashboard to use real API
const _origLoadDashboard = window.loadDashboard;
window.loadDashboard = async function() {
  // Show UI
  document.getElementById('authGate').style.display = 'none';
  document.getElementById('mainNav').style.display = 'block';
  document.getElementById('mainApp').style.display = 'block';
  document.getElementById('mainFooter').style.display = 'block';

  const displayName = currentUser.user_metadata?.display_name
    || currentUser.email?.split('@')[0] || 'Creator';
  document.getElementById('userName').textContent = displayName.slice(0,14);
  document.getElementById('welcomeName').textContent = displayName.split(' ')[0];
  document.getElementById('userAvatar').textContent = displayName[0].toUpperCase();

  // Show loading state
  document.getElementById('worksGrid').innerHTML =
    '<div class="empty-state"><div class="empty-icon" style="animation:pulse 1.5s infinite;">⟳</div>' +
    '<h3>Loading your works…</h3><p>Fetching from SeekReap registry</p></div>';

  // Get JWT from supabase session
  let jwt = null;
  try {
    const { data: { session } } = await supaClient.auth.getSession();
    jwt = session?.access_token || null;
  } catch(e) {}

  if (jwt) {
    // Load real data
    const apiWorks = await loadWorksFromAPI(jwt);
    works = apiWorks;

    // Load agreements to extract co-ownership info
    const agreements = await loadAgreementsFromAPI(jwt);
    // Update stCoOwned stat from agreements
    const coOwnedCount = agreements.filter(a => a.status === 'active').length;
    document.getElementById('stCoOwned').textContent = coOwnedCount;

    // If no works yet, show helpful empty state (not sample data)
    if (!works.length) {
      document.getElementById('worksGrid').innerHTML =
        '<div class="empty-state"><div class="empty-icon">🚀</div>' +
        '<h3>No works certified yet</h3>' +
        '<p>Upload and certify your first creative work to get started</p>' +
        '<button class="btn btn-primary" onclick="window.location.href=\'certification_portal.html\'"><i class="fas fa-plus"></i> Certify Your First Work</button></div>';
    }
  } else {
    // Demo mode fallback
    loadFromStorage();
    initSampleDataIfEmpty();
  }

  fullRender();
};

// Wire certificate verify button to real Tier 7
window.verifyCertReal = async function(certId) {
  if (!certId) return;
  try {
    const res = await fetch(
      `https://seekreap-tier-7-dev.fly.dev/verify/${encodeURIComponent(certId)}`
    );
    return await res.json();
  } catch(e) {
    return null;
  }
};

console.log('[dashboard-api] Loaded — real API mode active');
