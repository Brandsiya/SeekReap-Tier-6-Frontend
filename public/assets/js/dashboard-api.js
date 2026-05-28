/**
 * SeekReap · dashboard-api.js v3
 * Wires dashboard to real Tier 4 API.
 */

const TIER4_URL = 'https://seekreap-tier-4-orchestrator-1.onrender.com';

function _mapStatus(s) {
  return {
    'QUEUED':'queued','PROCESSING':'processing',
    'ANALYZED':'analyzed','COMPLETED':'certified','FAILED':'failed'
  }[(s||'').toUpperCase()] || 'pending';
}

function _mapSubmission(s, agreements) {
  const status   = _mapStatus(s.status);
  const title    = s.title || ('Work ' + s.id.slice(0,8).toUpperCase());
  const certDate = (s.completed_at || s.submitted_at || new Date().toISOString())
                     .slice(0,10).replace(/-/g,'');

  // Find matching agreement for this submission
  const agr = agreements.find(a => a.submission_id === s.id && a.status === 'active');

  return {
    id:          s.id,
    title:       title,
    category:    (s.content_type || s.work_type || 'audio').toLowerCase(),
    certId:      status === 'certified'
                   ? (s.cert_id || s.certificate_id || 'SR-' + certDate + '-' + s.id.slice(0,8).toUpperCase())
                   : null,
    ownership:   agr ? agr.ownership_pct : 100,
    coOwners:    agr && agr.participant_count > 1
                   ? [{id:'co_1',name:'Co-owner',email:'',percentage: 100 - agr.ownership_pct, status:'accepted'}]
                   : [],
    description: s.content_url ? 'Source: ' + s.content_url : '',
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
      ...(agr ? [{ l: 'Agreement active', t: agr.activated_at || agr.created_at, type: 'green' }] : []),
    ],
    agreementId: agr ? agr.id : null,
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
  document.getElementById('authGate').style.display   = 'none';
  document.getElementById('mainNav').style.display    = 'block';
  document.getElementById('mainApp').style.display    = 'block';
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
    // Fetch submissions and agreements in parallel
    const [subData, agrData] = await Promise.all([
      _apiFetch('/api/submissions', jwt),
      _apiFetch('/api/agreements',  jwt),
    ]);

    const agreements = agrData ? (agrData.agreements || []) : [];
    const submissions = subData ? (subData.submissions || []) : [];

    works = submissions.map(s => _mapSubmission(s, agreements));

    // Pending agreement invitations → dashboard invitations
    invitations = agreements
      .filter(a => a.my_status === 'invited')
      .map(a => ({
        id:        'inv_' + a.id,
        workId:    a.submission_id || a.id,
        workTitle: 'Agreement ' + a.id.slice(0,8).toUpperCase(),
        fromEmail: '',
        fromName:  'SeekReap Agreement',
        percentage: a.ownership_pct || 0,
        status:    'pending',
        agreementId: a.id,
      }));

    notifications = [];
    disputes      = [];

    // Update co-owned stat
    const coOwned = agreements.filter(a => a.status === 'active' && a.participant_count > 1).length;
    document.getElementById('stCoOwned').textContent = coOwned;

    if (!works.length) {
      document.getElementById('worksGrid').innerHTML =
        '<div class="empty-state"><div class="empty-icon">🚀</div>' +
        '<h3>No works certified yet</h3>' +
        '<p>Upload and certify your first creative work to get started</p>' +
        '<a href="/certification_portal.html" class="btn btn-primary" style="text-decoration:none;">' +
        '<i class="fas fa-plus"></i> Certify Your First Work</a></div>';
    }
  } else {
    loadFromStorage();
    initSampleDataIfEmpty();
  }

  fullRender();
};

console.log('[dashboard-api] v3 loaded — real API mode');
