// --- CONFIGURATION ---
const API_BASE_URL = "https://seekreap-backend-tif2gmgi4q-uc.a.run.app";

// --- AUTHENTICATION & REDIRECTS ---
function checkAuth() {
    // For now, we simulate a session check. 
    // In a full Firebase setup, you'd use firebase.auth().onAuthStateChanged
    const user = localStorage.getItem("seekreap_user");
    return user ? JSON.parse(user) : null;
}

// --- API INTERACTIONS ---
async function checkBackendStatus() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        const data = await response.json();
        console.log("✅ SeekReap Engine: Online (Tier " + data.tier + ")");
    } catch (error) {
        console.error("❌ Connection failed:", error);
    }
}

async function submitScan() {
    const videoUrl = document.getElementById("video-url").value;
    const statusEl = document.getElementById("scan-status");
    const user = checkAuth();

    if (!videoUrl) return alert("Please enter a URL");
    
    statusEl.innerText = "📡 Routing to Tier-4 Worker...";
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ creator_id: "user_123", title: "Web Scan", content_type: "video", 
                url: videoUrl,
                user_id: user ? user.uid : "anonymous" 
            })
        });
        const data = await response.json();
        statusEl.innerText = "🚀 Scan Queued: ID " + data.job_id;
        // Refresh history after submission
        fetchScanHistory();
    } catch (error) {
        statusEl.innerText = "⚠️ Error: Scanner Unreachable.";
    }
}

// --- STEP 2: SCAN HISTORY ---
async function fetchScanHistory() {
    const historyList = document.getElementById("history-list");
    if (!historyList) return;

    try {
        const response = await fetch(`${API_BASE_URL}/api/submissions`);
        const data = await response.json(); // Assuming your backend returns a list
        
        historyList.innerHTML = data.map(item => `
            <div class="history-item">
                <span>${item.url.substring(0, 30)}...</span>
                <span class="status-pill ${item.status}">${item.status}</span>
            </div>
        `).join('');
    } catch (e) {
        historyList.innerHTML = "No recent scans found.";
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkBackendStatus();
    if (window.location.pathname.includes('dashboard')) {
        fetchScanHistory();
    }
});
