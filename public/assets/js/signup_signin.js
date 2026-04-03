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
    const container = document.getElementById('message-container');
    if (container) {
        container.innerHTML = `<div class="error-message"><i class="fas fa-exclamation-circle"></i> ${msg}</div>`;
        setTimeout(clearMessages, 5000);
    }
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function friendlyError(code) {
    const map = {
        'auth/user-not-found': 'No account found. Please sign up.',
        'auth/wrong-password': 'Incorrect password.',
        'auth/invalid-credential': 'Incorrect email or password.',
        'auth/email-already-in-use': 'Email already in use.',
        'auth/weak-password': 'Password must be at least 6 characters.',
        'auth/invalid-email': 'Invalid email format.'
    };
    return map[code] || 'Authentication error. Please try again.';
}

async function onAuthSuccess(user) {
    sessionStorage.setItem('seekreap_auth', 'true');
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
    } catch (e) { console.warn('Backend sync failed', e); }
    
    showSuccess('Redirecting...');
    setTimeout(() => { window.location.href = 'certification_portal.html'; }, 1000);
}

async function handleSignIn() {
    const email = document.getElementById('signin-email').value.trim();
    const password = document.getElementById('signin-password').value;
    if (!email || !password) return showError('Enter credentials');
    try {
        const result = await firebase.auth().signInWithEmailAndPassword(email, password);
        await onAuthSuccess(result.user);
    } catch (err) { showError(friendlyError(err.code)); }
}

async function handleSignUp() {
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirm = document.getElementById('signup-confirm-password').value;
    if (password !== confirm) return showError('Passwords mismatch');
    try {
        const result = await firebase.auth().createUserWithEmailAndPassword(email, password);
        await result.user.updateProfile({ displayName: name });
        await onAuthSuccess(result.user);
    } catch (err) { showError(friendlyError(err.code)); }
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const active = document.querySelector('.auth-form:not(.hidden)');
        active.id === 'signin-form' ? handleSignIn() : handleSignUp();
    }
});
