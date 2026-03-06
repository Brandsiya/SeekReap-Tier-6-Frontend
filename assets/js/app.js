// Configuration




const API_BASE_URL = "https://seekreap-backend-308655322607.us-central1.run.app";

// Logic to check Backend Health or Auth status
async function checkBackendStatus() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        const data = await response.json();
        console.log("Tier-5 Backend Status:", data.status);
    } catch (error) {
        console.error("Backend Connection Failed:", error);
    }
}

// Simple Redirect Guard (Optional)
function init() {
    console.log("SeekReap Landing Initialized");
    checkBackendStatus();
}

document.addEventListener('DOMContentLoaded', init);
