// SeekReap Authentication — Firebase Auth

function switchTab(tab) {
    const isSignin = tab === 'signin';
    document.getElementById('signin-tab').classList.toggle('active', isSignin);
    document.getElementById('signup-tab').classList.toggle('active', !isSignin);
    document.getElementById('signin-form').classList.toggle('hidden', !isSignin);
    document.getElementById('signup-form').classList.toggle('hidden', isSignin);
    clearMessages();
}

function togglePassword(inputId, icon) {
    const input = document.getElementById(inputId);
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    icon.classList.toggle('fa-eye', !isPassword);
    icon.classList.toggle('fa-eye-slash', isPassword);
}

function clearMessages() {
    const container = document.getElementById('message-container');
    if (container) container.innerHTML = '';
}

function showSuccess(msg) {
    const container = document.getElementById('message-container');
    if (container) {
        container.innerHTML = `<div class="success-message"><i class="fas fa-check-circle"></i> ${msg}</div>`;
        setTimeout(clearMessages, 5000);
    }
}

function showError(msg) {
    console.error('Auth Error:', msg);
    const container = document.getElementById('message-container');
    if (container) {
        container.innerHTML = `<div class="error-message"><i class="fas fa-exclamation-circle"></i> ${msg}</div>`;
        setTimeout(clearMessages, 5000);
    }
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function friendlyError(code, message) {
    const map = {
        'auth/user-not-found': 'No account found. Please sign up.',
        'auth/wrong-password': 'Incorrect password. Please try again.',
        'auth/invalid-credential': 'Incorrect email or password.',
        'auth/email-already-in-use': 'Email already in use. Please sign in.',
        'auth/weak-password': 'Password must be at least 6 characters.',
        'auth/invalid-email': 'Invalid email format.',
        'auth/network-request-failed': 'Network error. Check your connection.',
        'auth/too-many-requests': 'Too many attempts. Please wait.'
    };
    return map[code] || message || 'Authentication error. Please try again.';
}

async function onAuthSuccess(user) {
    console.log('✅ Auth success for:', user.email);
    sessionStorage.setItem('seekreap_auth', 'true');
    sessionStorage.setItem('seekreap_user_uid', user.uid);
    sessionStorage.setItem('seekreap_user_email', user.email);
    sessionStorage.setItem('seekreap_user_name', user.displayName || user.email?.split('@')[0] || 'Creator');
    
    const TIER6_URL = window.API_CONFIG?.TIER6_URL || 'https://seekreap-backend-dev.fly.dev';
    try {
        await fetch(TIER6_URL + '/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                uid: user.uid,
                email: user.email,
                display_name: user.displayName || user.email?.split('@')[0] || 'Creator'
            })
        });
        console.log('✅ Backend registration successful');
    } catch (e) { 
        console.warn('⚠️ Backend sync failed (non-critical):', e); 
    }

    showSuccess('Authentication successful! Redirecting...');
    setTimeout(() => { 
        window.location.href = 'certification_portal.html'; 
    }, 1000);
}

async function handleSignIn() {
    const email = document.getElementById('signin-email').value.trim();
    const password = document.getElementById('signin-password').value;
    
    if (!email || !password) {
        showError('Please enter both email and password.');
        return;
    }
    if (!isValidEmail(email)) {
        showError('Please enter a valid email address.');
        return;
    }
    
    const btn = document.querySelector('#signin-form .auth-btn');
    const origText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Signing in...';
    
    try {
        const result = await firebase.auth().signInWithEmailAndPassword(email, password);
        await onAuthSuccess(result.user);
    } catch (err) {
        console.error('Sign in error:', err);
        showError(friendlyError(err.code, err.message));
        btn.disabled = false;
        btn.innerHTML = origText;
    }
}

async function handleSignUp() {
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirm = document.getElementById('signup-confirm-password').value;
    const terms = document.getElementById('accept-terms')?.checked;
    
    if (!name || !email || !password || !confirm) {
        showError('Please fill in all fields.');
        return;
    }
    if (!isValidEmail(email)) {
        showError('Please enter a valid email address.');
        return;
    }
    if (password.length < 6) {
        showError('Password must be at least 6 characters.');
        return;
    }
    if (password !== confirm) {
        showError('Passwords do not match.');
        return;
    }
    if (!terms) {
        showError('Please accept the Terms of Service and Privacy Policy.');
        return;
    }
    
    const btn = document.querySelector('#signup-form .auth-btn');
    const origText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Creating account...';
    
    try {
        const result = await firebase.auth().createUserWithEmailAndPassword(email, password);
        await result.user.updateProfile({ displayName: name });
        await onAuthSuccess(result.user);
    } catch (err) {
        console.error('Sign up error:', err);
        showError(friendlyError(err.code, err.message));
        btn.disabled = false;
        btn.innerHTML = origText;
    }
}

async function handleSocialLogin(providerName) {
    let provider;
    switch(providerName) {
        case 'google':
            provider = new firebase.auth.GoogleAuthProvider();
            provider.addScope('profile');
            provider.addScope('email');
            break;
        case 'microsoft':
            provider = new firebase.auth.OAuthProvider('microsoft.com');
            break;
        default:
            showError('Provider not supported.');
            return;
    }
    
    try {
        const result = await firebase.auth().signInWithPopup(provider);
        await onAuthSuccess(result.user);
    } catch (err) {
        if (err.code !== 'auth/popup-closed-by-user') {
            console.error('Social login error:', err);
            showError(friendlyError(err.code, err.message));
        }
    }
}

async function handleForgotPassword() {
    const email = document.getElementById('signin-email').value.trim();
    if (!email) {
        showError('Please enter your email address.');
        return;
    }
    if (!isValidEmail(email)) {
        showError('Please enter a valid email address.');
        return;
    }
    
    try {
        await firebase.auth().sendPasswordResetEmail(email);
        showSuccess('Password reset email sent! Check your inbox.');
    } catch (err) {
        console.error('Password reset error:', err);
        showError(friendlyError(err.code, err.message));
    }
}

// Diagnostic function
function checkFirebaseStatus() {
    console.log('=== Firebase Diagnostic ===');
    console.log('Firebase apps:', firebase.apps.length);
    console.log('API_CONFIG:', window.API_CONFIG ? 'Loaded' : 'MISSING');
    console.log('Firebase auth:', firebase.auth() ? 'Available' : 'MISSING');
    
    if (!window.API_CONFIG) {
        console.error('❌ CRITICAL: API_CONFIG not loaded! Check config.js path.');
    }
    if (!firebase.apps.length) {
        console.error('❌ CRITICAL: Firebase not initialized!');
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Auth page loaded');
    
    // Wait for Firebase to be ready
    setTimeout(() => {
        checkFirebaseStatus();
    }, 100);
    
    // Load remembered email
    const remembered = localStorage.getItem('seekreap_remember');
    if (remembered) {
        const emailInput = document.getElementById('signin-email');
        if (emailInput) {
            emailInput.value = remembered;
            const rememberCheck = document.getElementById('remember-me');
            if (rememberCheck) rememberCheck.checked = true;
        }
    }
    
    // Check if already authenticated
    const isAuthed = sessionStorage.getItem('seekreap_auth') === 'true';
    if (isAuthed && window.location.pathname.includes('signup_signin.html')) {
        setTimeout(() => {
            window.location.href = 'certification_portal.html';
        }, 500);
    }
});

// Enter key support
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const activeForm = document.querySelector('.auth-form:not(.hidden)');
        if (activeForm) {
            if (activeForm.id === 'signin-form') {
                handleSignIn();
            } else if (activeForm.id === 'signup-form') {
                handleSignUp();
            }
        }
    }
});

// Check auth state on load
firebase.auth().onAuthStateChanged((user) => {
    if (user && window.location.pathname.includes('signup_signin.html')) {
        console.log('User already signed in, redirecting...');
        window.location.href = 'certification_portal.html';
    }
});
