const API_BASE_URL = "https://seekreap-backend-tif2gmgi4q-uc.a.run.app";

async function checkBackendStatus() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        const data = await response.json();
        console.log("✅ SeekReap Engine: Online (Tier " + data.tier + ")");
    } catch (error) {
        console.error("❌ Connection failed:", error);
    }
}

async function submitScan(videoUrl) {
    const statusEl = document.getElementById("scan-status");
    statusEl.innerText = "Initiating Tier-4 Worker...";
    
    try {
        const response = await fetch(`${API_BASE_URL}/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: videoUrl })
        });
        const data = await response.json();
        statusEl.innerText = "Scan Queued: " + data.job_id;
    } catch (error) {
        statusEl.innerText = "Error: Could not reach scanner.";
    }
}

document.addEventListener('DOMContentLoaded', checkBackendStatus);
