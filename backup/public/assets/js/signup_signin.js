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

function clearMessages() { document.getElementById('message-container').innerHTML = ''; }

function showSuccess(msg) {
    document.getElementById('message-container').innerHTML =
        `<div class="success-message"><i class="fas fa-check-circle"></i> ${msg}</div>`;
    setTimeout(clearMessages, 5000);
}

function showError(msg) {
    document.getElementById('message-container').innerHTML =
        `<div class="error-message"><i class="fas fa-exclamation-circle"></i> ${msg}</div>`;
    setTimeout(clearMessages, 5000);
}

function isValidEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }

function friendlyError(code) {
    const map = {
        'auth/user-not-found': 'No account found with that email.',
        'auth/wrong-password': 'Incorrect password. Please try again.',
        'auth/invalid-credential': 'Incorrect email or password.',
        'auth/email-already-in-use': 'An account already exists with this email.',
        'auth/weak-password': 'Password must be at least 6 characters.',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/popup-closed-by-user': 'Sign-in popup was closed. Please try again.',
        'auth/network-request-failed': 'Network error. Check your connection.',
        'auth/too-many-requests': 'Too many attempts. Please wait a moment.',
    };
    return map[code] || 'Authentication error. Please try again.';
}

async function onAuthSuccess(user) {
    sessionStorage.setItem('seekreap_auth', 'true');
    sessionStorage.setItem('seekreap_user_uid', user.uid);
    sessionStorage.setItem('seekreap_user_email', user.email || '');
    sessionStorage.setItem('seekreap_user_name', user.displayName || user.email || 'Creator');

    // Upsert creator in DB (non-blocking)
    try {
        const base = window.API_CONFIG ? window.API_CONFIG.BASE_URL
            : 'https://seekreap-backend-308655322607.us-central1.run.app';
        await fetch(base + '/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid: user.uid, email: user.email, display_name: user.displayName || '' })
        });
    } catch (e) { console.warn('Creator register (non-critical):', e); }

    showSuccess('Authenticated! Loading SeekReap...');
    setTimeout(() => { window.location.href = 'loader.html'; }, 1000);
}

async function handleSignIn() {
    const email = document.getElementById('signin-email').value.trim();
    const password = document.getElementById('signin-password').value;
    const remember = document.getElementById('remember-me').checked;
    if (!email || !password) { showError('Please enter both email and password.'); return; }
    if (!isValidEmail(email)) { showError('Please enter a valid email address.'); return; }
    const btn = document.querySelector('#signin-form .auth-btn');
    const orig = btn.innerHTML; btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Signing in...';
    try {
        if (remember) localStorage.setItem('seekreap_remember', email);
        const r = await firebase.auth().signInWithEmailAndPassword(email, password);
        await onAuthSuccess(r.user);
    } catch (err) { showError(friendlyError(err.code)); btn.disabled = false; btn.innerHTML = orig; }
}

async function handleSignUp() {
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirm = document.getElementById('signup-confirm-password').value;
    const terms = document.getElementById('accept-terms').checked;
    if (!name || !email || !password || !confirm) { showError('Please fill in all fields.'); return; }
    if (!isValidEmail(email)) { showError('Please enter a valid email address.'); return; }
    if (password.length < 8) { showError('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { showError('Passwords do not match.'); return; }
    if (!terms) { showError('Please accept the Terms of Service and Privacy Policy.'); return; }
    const btn = document.querySelector('#signup-form .auth-btn');
    const orig = btn.innerHTML; btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Creating account...';
    try {
        const r = await firebase.auth().createUserWithEmailAndPassword(email, password);
        await r.user.updateProfile({ displayName: name });
        await onAuthSuccess(r.user);
    } catch (err) { showError(friendlyError(err.code)); btn.disabled = false; btn.innerHTML = orig; }
}

async function handleSocialLogin(providerName) {
    let provider;
    if (providerName === 'google') provider = new firebase.auth.GoogleAuthProvider();
    else if (providerName === 'microsoft') provider = new firebase.auth.OAuthProvider('microsoft.com');
    else if (providerName === 'facebook') provider = new firebase.auth.FacebookAuthProvider();
    else { showError('TikTok login coming soon.'); return; }
    try {
        const r = await firebase.auth().signInWithPopup(provider);
        await onAuthSuccess(r.user);
    } catch (err) { showError(friendlyError(err.code)); }
}

async function handleForgotPassword() {
    const email = document.getElementById('signin-email').value.trim();
    if (!email) { showError('Enter your email address above first.'); return; }
    try {
        await firebase.auth().sendPasswordResetEmail(email);
        showSuccess('Password reset email sent! Check your inbox.');
    } catch (err) { showError(friendlyError(err.code)); }
}

window.addEventListener('load', function () {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) onAuthSuccess(user);
    });
    const remembered = localStorage.getItem('seekreap_remember');
    if (remembered) {
        document.getElementById('signin-email').value = remembered;
        document.getElementById('remember-me').checked = true;
    }
});

document.addEventListener('keypress', function (e) {
    if (e.key !== 'Enter') return;
    const active = document.querySelector('.auth-form:not(.hidden)');
    if (!active) return;
    active.id === 'signin-form' ? handleSignIn() : handleSignUp();
});
