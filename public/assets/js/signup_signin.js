// SeekReap Authentication - Supabase

// DOM Elements
let currentUser = null;

// Switch between Sign In and Sign Up tabs
function switchTab(tab) {
    const isSignin = tab === 'signin';
    document.getElementById('signin-tab').classList.toggle('active', isSignin);
    document.getElementById('signup-tab').classList.toggle('active', !isSignin);
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

// Sign In with Email/Password
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
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) throw error;
        
        showSuccess('Authentication successful! Redirecting...');
        setTimeout(() => {
            window.location.href = 'certification_portal.html';
        }, 1500);
    } catch (err) {
        showError(err.message);
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
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    full_name: name
                }
            }
        });
        
        if (error) throw error;
        
        showSuccess('Account created! Please check your email to confirm.');
        setTimeout(() => {
            switchTab('signin');
            document.getElementById('signin-email').value = email;
        }, 2000);
    } catch (err) {
        showError(err.message);
        btn.disabled = false;
        btn.innerHTML = origText;
    }
}

// Social Login (Google)
async function handleSocialLogin(providerName) {
    if (providerName !== 'google') {
        showError('Only Google login is supported at this time.');
        return;
    }
    
    showMessage('Redirecting to Google...', 'info');
    
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin + '/certification_portal.html'
            }
        });
        
        if (error) throw error;
    } catch (err) {
        showError(err.message);
    }
}

// Forgot Password
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
    
    showMessage('Sending reset email...', 'info');
    
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/reset-password.html'
        });
        
        if (error) throw error;
        
        showSuccess('Password reset email sent! Check your inbox.');
    } catch (err) {
        showError(err.message);
    }
}

// Load remembered email
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
    setupEnterKey();
    
    // Check if user is already authenticated
    supabase.auth.getSession().then(({ data: { session } }) => {
        if (session && window.location.pathname.includes('signup_signin.html')) {
            window.location.href = 'certification_portal.html';
        }
    });
});

// Check auth state on load
supabase.auth.onAuthStateChange((event, session) => {
    if (session && window.location.pathname.includes('signup_signin.html')) {
        console.log('User already signed in, redirecting...');
        window.location.href = 'certification_portal.html';
    }
});
