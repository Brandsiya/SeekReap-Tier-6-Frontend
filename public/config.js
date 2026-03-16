const firebaseConfig = {
    apiKey: "AIzaSyBNdtoanXZGwz7h1dHS4DzGAjjC6dUT-2c",
    authDomain: "seekreap-production.firebaseapp.com",
    projectId: "seekreap-production",
    storageBucket: "seekreap-production.firebasestorage.app",
    messagingSenderId: "308655322607",
    appId: "1:308655322607:web:2ae5a017c2ee112c50b21a",
    measurementId: "G-BBEW72XRCQ"
};
try { firebase.app(); } catch(e) { firebase.initializeApp(firebaseConfig); }

window.API_CONFIG = {
    TIER4_URL: "https://seekreap-tier-4-orchestrator-nrn4.onrender.com",
    BASE_URL: "https://seekreap-backend-308655322607.us-central1.run.app",
    DEV_CREATOR_ID: "a8e4fbba-2627-4fbf-98e0-468a47bab8fc"
};
