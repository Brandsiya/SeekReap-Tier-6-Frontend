// Authentication Guard for protected pages
console.log('🔐 Auth guard loaded');

// Wait for Firebase to be ready
if (typeof firebase !== 'undefined' && firebase.apps.length) {
    console.log('✅ Firebase available, checking auth state...');
    
    firebase.auth().onAuthStateChanged((user) => {
        if (!user) {
            console.log('❌ User not authenticated, redirecting to sign in...');
            sessionStorage.removeItem('seekreap_auth');
            window.location.href = "signup_signin.html";
        } else {
            console.log('✅ User authenticated:', user.email);
            sessionStorage.setItem('seekreap_auth', 'true');
            sessionStorage.setItem('seekreap_user_uid', user.uid);
            sessionStorage.setItem('seekreap_user_email', user.email);
            sessionStorage.setItem('seekreap_user_name', user.displayName || user.email.split('@')[0]);
            
            // Set user email in form if present
            const primaryEmail = document.getElementById("primaryEmail");
            if (primaryEmail) {
                primaryEmail.textContent = user.email;
            }
        }
    });
} else {
    console.error('❌ Firebase not available! Check config.js loading.');
}
