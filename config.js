// Configuration for SeekReap Tier-6 Frontend
const API_CONFIG = {
    BASE_URL: "https://seekreap-backend-308655322607.us-central1.run.app",
    ENDPOINTS: {
        TASKS: "/api/tasks",           // New Tier-5 compatible endpoint
        SUBMISSIONS: "/api/submissions", // Cleaned up legacy endpoint
        HEALTH: "/health"
    }
};

// Make it globally available
window.API_CONFIG = API_CONFIG;
