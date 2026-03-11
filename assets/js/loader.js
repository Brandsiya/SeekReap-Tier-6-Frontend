// SeekReap Loader — polls Tier-4 for submission status

(function () {
    const TIER4_URL = (window.API_CONFIG && window.API_CONFIG.TIER4_URL)
        || 'https://seekreap-tier4-tif2gmgi4q-uc.a.run.app';

    const submissionId  = sessionStorage.getItem('last_submission_id');
    const statusEl      = document.getElementById('status');
    const progressEl    = document.querySelector('.progress');

    const TERMINAL_STATES = ['COMPLETED', 'DONE', 'COMPLETE', 'FAILED', 'ERROR'];
    const SUCCESS_STATES  = ['COMPLETED', 'DONE', 'COMPLETE'];

    let pollCount = 0;
    let intervalId = null;

    function setProgress(pct) {
        if (progressEl) progressEl.style.width = pct + '%';
    }

    function setStatus(msg) {
        if (statusEl) statusEl.textContent = msg;
    }

    function goToReport() {
        window.location.href = 'verification_report.html';
    }

    function goToPortal(msg) {
        sessionStorage.setItem('seekreap_error', msg || 'Analysis failed');
        window.location.href = 'verification_portal.html';
    }

    async function pollStatus() {
        pollCount++;
        const maxPolls = 60; // 3 min max (60 × 3s)

        if (pollCount > maxPolls) {
            clearInterval(intervalId);
            setStatus('Analysis is taking longer than expected. Proceeding...');
            setTimeout(goToReport, 2000);
            return;
        }

        // Animate progress up to 90% while waiting
        const pct = Math.min(15 + (pollCount / maxPolls) * 75, 90);
        setProgress(pct);

        const messages = [
            'Initializing AI Analysis...',
            'Extracting content metadata...',
            'Running monetization risk scan...',
            'Analyzing platform signals...',
            'Generating protection report...',
            'Finalizing results...'
        ];
        const msgIdx = Math.min(Math.floor(pollCount / 5), messages.length - 1);
        setStatus(messages[msgIdx]);

        if (!submissionId) {
            // No submission ID — just go straight through after a short delay
            clearInterval(intervalId);
            setProgress(100);
            setStatus('Ready.');
            setTimeout(goToReport, 1000);
            return;
        }

        try {
            const resp = await fetch(`${TIER4_URL}/api/status/${submissionId}`);
            if (!resp.ok) return; // keep polling on transient errors

            const data = await resp.json();
            const status = (data.status || '').toUpperCase();

            if (SUCCESS_STATES.includes(status)) {
                clearInterval(intervalId);
                setProgress(100);
                setStatus('Analysis complete! Loading your report...');
                setTimeout(goToReport, 800);
            } else if (status === 'FAILED' || status === 'ERROR') {
                clearInterval(intervalId);
                setStatus('Analysis encountered an issue. Loading report...');
                setTimeout(goToReport, 1500);
            }
            // QUEUED / PROCESSING → keep polling
        } catch (e) {
            console.warn('Poll error (will retry):', e);
        }
    }

    // Start polling immediately then every 3s
    pollStatus();
    intervalId = setInterval(pollStatus, 3000);
})();
