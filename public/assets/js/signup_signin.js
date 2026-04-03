// SeekReap Authentication — Firebase Auth

// Initialize Firebase (already done in config.js)
// config.js is loaded before this script

// DOM Elements
let currentUser = null;

// Switch between Sign In and Sign Up tabs
function switchTab(tab) {
    const isSignin = tab === 'signin';
    
    // Update tab styles
    document.getElementById('signin-tab').classList.toggle('active', isSignin);
    document.getElementById('signup-tab').classList.toggle('active', !isSignin);
    
    // Show/hide forms
    document.getElementById('signin-form').classList.toggle('hidden', !isSignin);
    document.getElementById('signup-form').classList.toggle('hidden', isSignin);
    
    clearMessages();
}

// Toggle password visibility
function togglePassword(inputId, icon) {
    const input = document.getElementById(inputId);
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    icon.classList.toggle('fa-eye', !isPassword);
    icon.classList.toggle('fa-eye-slash', isPassword);
}

// Clear all messages
function clearMessages() {
    const container = document.getElementById('message-container');
    if (container) container.innerHTML = '';
}

// Show success message
function showSuccess(msg) {
    const container = document.getElementById('message-container');
    if (container) {
        container.innerHTML = `<div class="success-message"><i class="fas fa-check-circle"></i> ${msg}</div>`;
        setTimeout(clearMessages, 5000);
    }
}

// Show error message
function showError(msg) {
    const container = document.getElementById('message-container');
    if (container) {
        container.innerHTML = `<div class="error-message"><i class="fas fa-exclamation-circle"></i> ${msg}</div>`;
        setTimeout(clearMessages, 5000);
    }
}

// Validate email format
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Get friendly error message from Firebase error code
function friendlyError(code) {
    const map = {
        'auth/user-not-found': 'No account found with that email. Please sign up first.',
        'auth/wrong-password': 'Incorrect password. Please try again.',
        'auth/invalid-credential': 'Incorrect email or password.',
        'auth/email-already-in-use': 'An account already exists with this email. Please sign in instead.',
        'auth/weak-password': 'Password must be at least 6 characters.',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/popup-closed-by-user': 'Sign-in popup was closed. Please try again.',
        'auth/network-request-failed': 'Network error. Please check your connection.',
        'auth/too-many-requests': 'Too many failed attempts. Please wait a moment and try again.',
        'auth/user-disabled': 'This account has been disabled. Please contact support.',
        'auth/operation-not-allowed': 'This sign-in method is not enabled. Please use email/password.'
    };
    return map[code] || 'Authentication error. Please try again.';
}

// Handle successful authentication
async function onAuthSuccess(user) {
    // Store user data in session storage
    sessionStorage.setItem('seekreap_auth', 'true');
    sessionStorage.setItem('seekreap_user_uid', user.uid);
    sessionStorage.setItem('seekreap_user_email', user.email || '');
    sessionStorage.setItem('seekreap_user_name', user.displayName || user.email?.split('@')[0] || 'Creator');
    
    // Store in localStorage for persistence if "Remember me" was checked
    const rememberMe = document.getElementById('remember-me')?.checked;
    if (rememberMe) {
        localStorage.setItem('seekreap_user_uid', user.uid);
        localStorage.setItem('seekreap_user_email', user.email || '');
        localStorage.setItem('seekreap_user_name', user.displayName || user.email?.split('@')[0] || 'Creator');
    }
    
    // Register creator in backend (non-blocking)
    try {
        const TIER6_URL = window.API_CONFIG?.TIER6_URL || 'https://seekreap-backend-dev.fly.dev';
        await fetch(TIER6_URL + '/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                uid: user.uid,
                email: user.email,
                display_name: user.displayName || user.email?.split('@')[0] || 'Creator'
            })
        });
    } catch (e) {
        console.warn('Creator registration (non-critical):', e);
    }
    
    showSuccess('Authentication successful! Redirecting to certification portal...');
    
    // Redirect to certification portal after a short delay
    setTimeout(() => {
        window.location.href = 'certification_portal.html';
    }, 1500);
}

// Sign In with Email/Password
async function handleSignIn() {
    const email = document.getElementById('signin-email').value.trim();
    const password = document.getElementById('signin-password').value;
    const remember = document.getElementById('remember-me')?.checked;
    
    // Validation
    if (!email || !password) {
        showError('Please enter both email and password.');
        return;
    }
    if (!isValidEmail(email)) {
        showError('Please enter a valid email address.');
        return;
    }
    
    // Disable button during sign in
    const btn = document.querySelector('#signin-form .auth-btn');
    const origText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Signing in...';
    
    try {
        // Store remember preference
        if (remember) localStorage.setItem('seekreap_remember', email);
        else localStorage.removeItem('seekreap_remember');
        
        const result = await firebase.auth().signInWithEmailAndPassword(email, password);
        await onAuthSuccess(result.user);
    } catch (err) {
        showError(friendlyError(err.code));
        btn.disabled = false;
        btn.innerHTML = origText;
    }
}

// Sign Up with Email/Password
async function handleSignUp() {
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirm = document.getElementById('signup-confirm-password').value;
    const terms = document.getElementById('accept-terms')?.checked;
    
    // Validation
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
    
    // Disable button during sign up
    const btn = document.querySelector('#signup-form .auth-btn');
    const origText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Creating account...';
    
    try {
        const result = await firebase.auth().createUserWithEmailAndPassword(email, password);
        // Update profile with display name
        await result.user.updateProfile({ displayName: name });
        await onAuthSuccess(result.user);
    } catch (err) {
        showError(friendlyError(err.code));
        btn.disabled = false;
        btn.innerHTML = origText;
    }
}

// Social Login (Google, Microsoft, etc.)
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
            provider.addScope('user.read');
            break;
        default:
            showError('Provider not supported yet.');
            return;
    }
    
    const btn = document.querySelector(`.social-btn.${providerName.toLowerCase()}`);
    const origText = btn?.innerHTML;
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner"></span> Connecting...';
    }
    
    try {
        const result = await firebase.auth().signInWithPopup(provider);
        await onAuthSuccess(result.user);
    } catch (err) {
        if (err.code !== 'auth/popup-closed-by-user') {
            showError(friendlyError(err.code));
        }
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = origText;
        }
    }
}

// Forgot Password - Send reset email
async function handleForgotPassword() {
    const email = document.getElementById('signin-email').value.trim();
    
    if (!email) {
        showError('Please enter your email address first.');
        return;
    }
    if (!isValidEmail(email)) {
        showError('Please enter a valid email address.');
        return;
    }
    
    try {
        await firebase.auth().sendPasswordResetEmail(email);
        showSuccess('Password reset email sent! Please check your inbox.');
    } catch (err) {
        showError(friendlyError(err.code));
    }
}

// Check authentication state on page load
function checkAuthState() {
    firebase.auth().onAuthStateChanged(async (user) => {
        if (user) {
            // User is signed in, update UI
            currentUser = user;
            
            // Check if we're on the signup page and should redirect
            const isAuthPage = window.location.pathname.includes('signup_signin.html') ||
                              window.location.pathname.includes('signin') ||
                              window.location.pathname === '/';
            
            if (isAuthPage && !window.location.pathname.includes('certification_portal')) {
                // Redirect to certification portal if already signed in
                window.location.href = 'certification_portal.html';
            }
        } else {
            // User is signed out
            currentUser = null;
            
            // If we're on a protected page (like certification portal), redirect to sign in
            if (window.location.pathname.includes('certification_portal.html')) {
                window.location.href = 'signup_signin.html';
            }
        }
    });
}

// Load remembered email on page load
function loadRememberedEmail() {
    const remembered = localStorage.getItem('seekreap_remember');
    if (remembered) {
        const emailInput = document.getElementById('signin-email');
        if (emailInput) {
            emailInput.value = remembered;
            const rememberCheck = document.getElementById('remember-me');
            if (rememberCheck) rememberCheck.checked = true;
        }
    }
}

// Enter key support
function setupEnterKey() {
    document.addEventListener('keypress', (e) => {
        if (e.key !== 'Enter') return;
        
        const activeForm = document.querySelector('.auth-form:not(.hidden)');
        if (!activeForm) return;
        
        if (activeForm.id === 'signin-form') {
            handleSignIn();
        } else if (activeForm.id === 'signup-form') {
            handleSignUp();
        }
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadRememberedEmail();
    checkAuthState();
    setupEnterKey();
    
    // Check if user is already authenticated via session storage
    const isAuthed = sessionStorage.getItem('seekreap_auth') === 'true';
    const userUid = sessionStorage.getItem('seekreap_user_uid');
    
    if (isAuthed && userUid && window.location.pathname.includes('signup_signin.html')) {
        // If already authenticated on signin page, redirect to certification portal
        setTimeout(() => {
            window.location.href = 'certification_portal.html';
        }, 1000);
    }
});
