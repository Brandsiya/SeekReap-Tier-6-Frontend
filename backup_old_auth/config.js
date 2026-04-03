// SeekReap Frontend Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBNdtoanXZGwz7h1dHS4DzGAjjC6dUT-2c",
    authDomain: "seekreap-production.firebaseapp.com",
    projectId: "seekreap-production",
    storageBucket: "seekreap-production.firebasestorage.app",
    messagingSenderId: "308655322607",
    appId: "1:308655322607:web:2ae5a017c2ee112c50b21a",
    measurementId: "G-BBEW72XRCQ"
};

try { 
    firebase.app(); 
} catch(e) { 
    firebase.initializeApp(firebaseConfig); 
}

// API Configuration - Updated to use Fly.io endpoints
const API_CONFIG = {
    // Fly.io endpoints (production)
    TIER4_URL: "https://seekreap-tier-4-dev.fly.dev",
    TIER3_URL: "https://seekreap-tier-3-dev.fly.dev",
    TIER6_URL: "https://seekreap-backend-dev.fly.dev",
    
    // Legacy GCP endpoints (fallback)
    FALLBACK_TIER4_URL: "https://seekreap-tier4-tif2gmgi4q-uc.a.run.app",
    
    ENDPOINTS: {
        SUBMIT: "/api/submit",
        UPLOAD: "/api/upload",
        STATUS: "/api/status",
        VERIFY: "/verify",
        QRCODE: "/api/qrcode",
        QRCODE_RICH: "/api/qrcode-rich",
        CERTIFICATE: "/certificate",
        CERTIFICATE_PDF: "/certificate-pdf",
        HEALTH: "/health",
        READY: "/ready"
    },
    
    // Default creator ID for testing
    DEV_CREATOR_ID: "a8e4fbba-2627-4fbf-98e0-468a47bab8fc"
};

window.API_CONFIG = API_CONFIG;

// Helper function to get API URL
function getApiUrl(endpoint, useTier4 = true) {
    const baseUrl = useTier4 ? API_CONFIG.TIER4_URL : API_CONFIG.TIER6_URL;
    return `${baseUrl}${API_CONFIG.ENDPOINTS[endpoint] || endpoint}`;
}

// Helper function to get QR code URL
function getQrCodeUrl(submissionId, rich = false) {
    const endpoint = rich ? API_CONFIG.ENDPOINTS.QRCODE_RICH : API_CONFIG.ENDPOINTS.QRCODE;
    return `${API_CONFIG.TIER4_URL}${endpoint}/${submissionId}`;
}

console.log('SeekReap Frontend Configuration Loaded');
console.log('Tier4 URL:', API_CONFIG.TIER4_URL);
console.log('Tier6 URL:', API_CONFIG.TIER6_URL);
