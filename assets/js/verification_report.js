// ── Config ────────────────────────────────────────────────────────────
const TIER4_URL = (window.API_CONFIG && window.API_CONFIG.TIER4_URL)
    || 'https://seekreap-tier4-tif2gmgi4q-uc.a.run.app';

// ── Helpers ───────────────────────────────────────────────────────────
function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value || '—';
}

function setHTML(id, value) {
    const el = document.getElementById(id);
    if (el && value !== undefined) el.innerHTML = value;
}

function extractVideoId(url) {
    if (!url) return '—';
    const m = url.match(/[?&]v=([^&]+)/) || url.match(/youtu\.be\/([^?]+)/);
    return m ? m[1] : url.slice(-8);
}

function formatDate(isoStr) {
    if (!isoStr) return '—';
    try {
        return new Date(isoStr).toLocaleString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    } catch(e) { return isoStr; }
}

function riskToConfidence(riskScore) {
    // Higher safety score → higher monetization confidence
    if (riskScore === null || riskScore === undefined) return 75;
    return Math.round(Math.max(10, Math.min(99, 100 - riskScore + 15)));
}

// ── Populate UI from API response ─────────────────────────────────────
function populateReport(data) {
    const riskScore  = data.risk_score  !== null ? data.risk_score  : null;
    const riskLevel  = (data.risk_level || 'Low').toLowerCase();   // 'low','medium','high'
    const title      = data.title    || 'Untitled Video';
    const channel    = data.channel  || '—';
    const videoId    = extractVideoId(data.content_url);
    const thumbHash  = data.visual_phash ? data.visual_phash.slice(0, 16) + '…' : '—';
    const completedAt = formatDate(data.completed_at);
    const subId      = data.submission_id || '—';
    const confidence = riskToConfidence(riskScore);

    // ── Score ─────────────────────────────────────────────────────────
    const scoreDisplay = riskScore !== null ? Math.round(100 - riskScore) : '—';
    setText('scoreNumber', scoreDisplay);

    // ── Publishing banner ─────────────────────────────────────────────
    const publishingIcon = document.getElementById('publishingIcon');
    const publishingVerdict = document.getElementById('publishingVerdict');
    if (riskLevel === 'low') {
        if (publishingIcon) {
            publishingIcon.className = 'indicator-icon safe';
            publishingIcon.innerHTML = '<i class="fas fa-check-circle"></i>';
        }
        setText('publishingVerdict', '✅ Safe to Publish');
    } else if (riskLevel === 'medium') {
        if (publishingIcon) {
            publishingIcon.className = 'indicator-icon caution';
            publishingIcon.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
        }
        setText('publishingVerdict', '⚠️ Publish with Caution');
    } else {
        if (publishingIcon) {
            publishingIcon.className = 'indicator-icon danger';
            publishingIcon.innerHTML = '<i class="fas fa-times-circle"></i>';
        }
        setText('publishingVerdict', '🚫 High Risk – Review Before Publishing');
    }

    // ── Risk meter (copyright section) ───────────────────────────────
    const riskMeter = document.getElementById('riskMeter');
    if (riskMeter) {
        riskMeter.className = `risk-meter ${riskLevel}`;
        riskMeter.innerHTML = `<i class="fas fa-shield-alt"></i> Risk Level: ${data.risk_level || 'Low'}`;
    }

    // ── Monetization badge + confidence ──────────────────────────────
    const monBadge = document.getElementById('monetizationBadge');
    if (monBadge) {
        if (riskLevel === 'low') {
            monBadge.className = 'status-badge-large success';
            monBadge.innerHTML = '<i class="fas fa-check-circle"></i> Likely Eligible';
        } else if (riskLevel === 'medium') {
            monBadge.className = 'status-badge-large warning';
            monBadge.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Possibly Restricted';
        } else {
            monBadge.className = 'status-badge-large';
            monBadge.style.background = 'var(--danger-light)';
            monBadge.style.color = 'var(--danger)';
            monBadge.innerHTML = '<i class="fas fa-times-circle"></i> Likely Ineligible';
        }
    }
    const confFill = document.getElementById('confidenceFill');
    if (confFill) confFill.style.width = confidence + '%';
    setText('confidencePct', confidence + '%');

    // ── Summary card ─────────────────────────────────────────────────
    setHTML('summaryVerifId', `${subId.slice(0,12).toUpperCase()} <span class="verification-badge"><i class="fas fa-check"></i> Verified</span>`);
    setText('summaryChannel', channel);
    setText('summaryVideoId', videoId);

    // ── Metadata section ─────────────────────────────────────────────
    setText('metaTitle',        title);
    setText('metaChannel',      channel);
    setText('metaVideoId',      videoId);
    setText('metaCompletedAt',  completedAt);
    setHTML('metaThumbnailHash', `<span class="hash-value">${data.visual_phash || '—'}</span>`);

    // ── Certificate section ───────────────────────────────────────────
    setText('certVerifId',    'SR-' + subId.slice(0,6).toUpperCase());
    setText('certTimestamp',  data.completed_at || '—');
    setHTML('certFingerprintHash', data.visual_phash || '—');

    // ── Audio fingerprint section ────────────────────────────────────
    if (data.audio_stored) {
        setHTML('audioFingerprintHash', '<span style="color:var(--success)">✅ Stored</span>');
    } else {
        setHTML('audioFingerprintHash', '<span style="color:#94a3b8">Pending (Track B)</span>');
    }

    // ── User name in nav ──────────────────────────────────────────────
    const userName = sessionStorage.getItem('seekreap_user_name') || '';
    if (userName) {
        const avatar = document.getElementById('userAvatar');
        if (avatar) avatar.textContent = userName.slice(0, 2).toUpperCase();
    }

    console.log('Report populated ✅', { title, channel, riskScore, riskLevel, subId });
}

// ── Load data from API or sessionStorage ──────────────────────────────
async function loadReport() {
    // Prefer URL param, fall back to sessionStorage
    const params       = new URLSearchParams(window.location.search);
    const submissionId = params.get('id') || sessionStorage.getItem('last_submission_id');

    if (!submissionId) {
        const saved = sessionStorage.getItem('seekreap_results');
        if (saved) {
            try { populateReport(JSON.parse(saved)); } catch(e) { console.warn('parse err', e); }
        }
        return;
    }

    try {
        const resp = await fetch(`${TIER4_URL}/api/status/${submissionId}`);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        populateReport(data);
        sessionStorage.setItem('seekreap_results', JSON.stringify(data));
    } catch (err) {
        console.warn('Results fetch failed, falling back to sessionStorage:', err);
        const saved = sessionStorage.getItem('seekreap_results');
        if (saved) {
            try { populateReport(JSON.parse(saved)); } catch(e) { /* ignore */ }
        }
    }
}

// ── UI chrome ─────────────────────────────────────────────────────────
const userMenuBtn  = document.getElementById('userMenuBtn');
const userDropdown = document.getElementById('userDropdown');
if (userMenuBtn && userDropdown) {
    userMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        userDropdown.classList.toggle('active');
    });
    document.addEventListener('click', (e) => {
        if (!userMenuBtn.contains(e.target) && !userDropdown.contains(e.target))
            userDropdown.classList.remove('active');
    });
}

document.getElementById('userAvatar')?.addEventListener('click', () => {
    window.location.href = 'dashboard.html';
});

document.querySelectorAll('.fa-copy').forEach(icon => {
    icon.addEventListener('click', function() {
        const code = this.parentElement.innerText.trim();
        navigator.clipboard?.writeText(code);
        this.className = 'fas fa-check';
        setTimeout(() => this.className = 'fas fa-copy', 1500);
    });
});

function copyIntegrityHash() {
    const el = document.querySelector('.integrity-hash span:nth-child(2)');
    if (el) navigator.clipboard?.writeText(el.innerText.trim());
}

// ── Auth guard + boot ─────────────────────────────────────────────────
window.addEventListener('load', function () {
    if (typeof firebase !== 'undefined') {
        firebase.auth().onAuthStateChanged(function (user) {
            if (!user) {
                window.location.href = 'signup_signin.html';
                return;
            }
            const name = user.displayName || user.email || 'Creator';
            sessionStorage.setItem('seekreap_user_name', name);
            const avatar = document.getElementById('userAvatar');
            if (avatar) avatar.textContent = name.slice(0, 2).toUpperCase();
            loadReport();
        });
    } else {
        loadReport();
    }
});
