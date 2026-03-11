// SeekReap Verification Report — loads real data from Tier-4

(function () {
    const TIER4_URL = (window.API_CONFIG && window.API_CONFIG.TIER4_URL)
        || 'https://seekreap-tier4-tif2gmgi4q-uc.a.run.app';

    // ── User menu ──
    const userMenuBtn  = document.getElementById('userMenuBtn');
    const userDropdown = document.getElementById('userDropdown');
    if (userMenuBtn && userDropdown) {
        userMenuBtn.addEventListener('click', e => {
            e.stopPropagation();
            userDropdown.classList.toggle('active');
        });
        document.addEventListener('click', e => {
            if (!userMenuBtn.contains(e.target) && !userDropdown.contains(e.target))
                userDropdown.classList.remove('active');
        });
    }
    document.getElementById('userAvatar')?.addEventListener('click', () => {
        window.location.href = 'dashboard.html';
    });

    // ── Copy badge code ──
    document.querySelectorAll('.fa-copy').forEach(icon => {
        icon.addEventListener('click', function () {
            navigator.clipboard.writeText(this.parentElement.innerText.trim());
            alert('Badge code copied to clipboard!');
        });
    });

    // ── Populate helpers ──
    function setText(id, val) {
        const el = document.getElementById(id);
        if (el && val != null) el.textContent = val;
    }

    function fmtDate(iso) {
        if (!iso) return '—';
        try {
            return new Date(iso).toLocaleString('en-GB', {
                day: 'numeric', month: 'long', year: 'numeric',
                hour: '2-digit', minute: '2-digit', timeZone: 'UTC'
            }) + ' UTC';
        } catch { return iso; }
    }

    function applyRiskLevel(level) {
        if (!level) return;
        const upper = level.toUpperCase();
        const meter = document.getElementById('report-risk-meter');
        if (meter) {
            meter.className = meter.className.replace(/\b(low|medium|high|critical)\b/g, '');
            const cls = upper === 'LOW' ? 'low' : upper === 'MEDIUM' ? 'medium' : 'high';
            meter.classList.add(cls);
            meter.innerHTML = `<i class="fas fa-shield-alt"></i> Risk Level: ${level.charAt(0).toUpperCase() + level.slice(1).toLowerCase()}`;
        }
        const statusLabel = document.getElementById('report-status-label');
        if (statusLabel) {
            statusLabel.textContent = upper === 'LOW' ? 'Protected Session' :
                upper === 'MEDIUM' ? 'Moderate Risk Session' : 'High Risk — Review Needed';
        }
    }

    function applyScore(score) {
        const el = document.getElementById('report-score');
        if (!el || score == null) return;
        const rounded = Math.round(score);
        el.innerHTML = `${rounded} <span style="font-size:1.2rem;opacity:0.7;">/100</span>`;
        // Color the score container based on value
        const container = el.closest('.score-container');
        if (container) {
            container.style.background = rounded >= 90 ? 'linear-gradient(135deg,#10b981,#059669)' :
                rounded >= 70 ? 'linear-gradient(135deg,#f59e0b,#d97706)' :
                rounded >= 50 ? 'linear-gradient(135deg,#ef4444,#dc2626)' :
                'linear-gradient(135deg,#7f1d1d,#991b1b)';
        }
    }

    function applyMonetizationStatus(riskLevel, score) {
        const el = document.getElementById('report-monetization-status');
        if (!el) return;
        const upper = (riskLevel || '').toUpperCase();
        const s = score || 0;
        if (upper === 'LOW' || s >= 80) {
            el.className = 'status-badge-large success';
            el.innerHTML = '<i class="fas fa-check-circle"></i> Likely Eligible';
        } else if (upper === 'MEDIUM' || s >= 50) {
            el.className = 'status-badge-large warning';
            el.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Review Recommended';
        } else {
            el.className = 'status-badge-large danger';
            el.innerHTML = '<i class="fas fa-times-circle"></i> At Risk';
        }
    }

    function populateReport(data) {
        const meta = data.metadata || {};
        const ytId = meta.youtube_id || '';

        // Submission ID
        const idEl = document.getElementById('report-submission-id');
        if (idEl && data.submission_id) idEl.textContent = data.submission_id.slice(0, 12).toUpperCase();

        // Video ID / channel
        setText('report-video-id', ytId || data.content_hash?.slice(0, 8) || '—');
        setText('report-channel', meta.channel || meta.creator_name || '—');
        setText('report-date', fmtDate(data.submitted_at));

        // Score + risk
        applyScore(data.overall_risk_score);
        applyRiskLevel(data.risk_level);
        applyMonetizationStatus(data.risk_level, data.overall_risk_score);

        // Auth avatar
        const userName = sessionStorage.getItem('seekreap_user_name') || '';
        const avatar = document.getElementById('userAvatar');
        if (avatar && userName) avatar.textContent = userName.slice(0, 2).toUpperCase();

        // Status reflects analysis state
        if (data.status === 'QUEUED' || data.status === 'PROCESSING') {
            const statusLabel = document.getElementById('report-status-label');
            if (statusLabel) statusLabel.textContent = 'Analysis in progress…';
        }
    }

    // ── Load data ──
    async function loadReport() {
        const submissionId = sessionStorage.getItem('last_submission_id');

        if (!submissionId) {
            // No submission — show whatever is in sessionStorage (submit page data)
            const saved = sessionStorage.getItem('seekreap_results');
            if (saved) {
                try { populateReport(JSON.parse(saved)); } catch (e) { console.warn('parse error', e); }
            }
            return;
        }

        try {
            const resp = await fetch(`${TIER4_URL}/api/results/${submissionId}`);
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const data = await resp.json();
            populateReport(data);
            // Cache for back-nav
            sessionStorage.setItem('seekreap_results', JSON.stringify(data));
        } catch (err) {
            console.warn('Results fetch failed, falling back to sessionStorage:', err);
            const saved = sessionStorage.getItem('seekreap_results');
            if (saved) {
                try { populateReport(JSON.parse(saved)); } catch (e) { /* ignore */ }
            }
        }
    }

    // Auth guard + load
    window.addEventListener('load', function () {
        // Auth guard
        if (typeof firebase !== 'undefined') {
            firebase.auth().onAuthStateChanged(function (user) {
                if (!user) { window.location.href = 'signup_signin.html'; return; }
                const avatar = document.getElementById('userAvatar');
                const name = user.displayName || user.email || 'Creator';
                if (avatar) avatar.textContent = name.slice(0, 2).toUpperCase();
            });
        }
        loadReport();
    });
})();
