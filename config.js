// Configuration for SeekReap Tier-6 Frontend
const API_CONFIG = {
    TIER4_URL: "https://seekreap-tier4-tif2gmgi4q-uc.a.run.app",
    BASE_URL: "https://seekreap-backend-308655322607.us-central1.run.app",
    ENDPOINTS: {
        SUBMIT: "/api/submit",
        TASKS: "/api/tasks",
        SUBMISSIONS: "/api/submissions",
        HEALTH: "/health"
    },
    // Temporary: replaced by Firebase Auth UID once auth is wired
    DEV_CREATOR_ID: "a8e4fbba-2627-4fbf-98e0-468a47bab8fc"
};
window.API_CONFIG = API_CONFIG;
