const fileInput = document.getElementById('video-file');
const urlInput = document.getElementById('video-url');
const verifyBtn = document.getElementById('verify-btn');
const overlay = document.getElementById('processing-overlay');
const statusText = overlay.querySelector('p');

async function startTier6Analysis(payload) {
    try {
        statusText.innerText = "Syncing with SeekReap Cloud (Tier-6)...";
        
        // POST to your Flask backend
        const response = await fetch('http://localhost:5000/api/submit-scan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (result.status === "success") {
            sessionStorage.setItem('last_submission_id', result.submission_id);
            sessionStorage.setItem('seekreap_results', JSON.stringify(payload));
            
            statusText.innerText = "Analysis Recorded. Ready for Audit.";
            showProceedButton();
        } else {
            throw new Error(result.message);
        }
    } catch (err) {
        statusText.innerText = "Error: " + err.message;
        console.error(err);
    }
}

function showProceedButton() {
    const proceedBtn = document.createElement('button');
    proceedBtn.innerText = 'View Real-Time Audit Report';
    proceedBtn.className = 'proceed-btn-style'; // Use existing CSS or inline
    proceedBtn.onclick = () => window.location.href = 'dashboard.html';
    
    const loaderBox = overlay.querySelector('.loader-box') || overlay;
    loaderBox.appendChild(proceedBtn);
}

verifyBtn.addEventListener('click', async () => {
    const file = fileInput.files[0];
    const url = urlInput.value.trim();
    const tier = document.querySelector('input[name="tier"]:checked')?.value || 6;

    if (!file && url.length <= 10) return alert('Source required.');

    overlay.style.display = 'flex';
    
    let payload = {
        timestamp: new Date().toISOString(),
        tier: tier,
        name: file ? file.name : "Remote URL",
        url: url || "local_upload"
    };

    await startTier6Analysis(payload);
});
