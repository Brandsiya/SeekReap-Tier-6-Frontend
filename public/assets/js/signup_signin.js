// --- UI Helpers ---
function switchTab(tab) {
    const isSignin = tab === 'signin';
    document.getElementById('signin-tab').classList.toggle('active', isSignin);
    document.getElementById('signup-tab').classList.toggle('active', !isSignin);
    document.getElementById('signin-form').classList.toggle('hidden', !isSignin);
    document.getElementById('signup-form').classList.toggle('hidden', isSignin);
}

function togglePassword(inputId, icon) {
    const input = document.getElementById(inputId);
    input.type = input.type === 'password' ? 'text' : 'password';
    icon.classList.toggle('fa-eye');
    icon.classList.toggle('fa-eye-slash');
}

// --- Social Logins ---
function handleSocialLogin(provider) {
    alert(`${provider} integration coming soon to SeekReap.`);
}

function handleForgotPassword() {
    alert("Password reset functionality coming soon.");
}

// --- Core Auth Logic ---
async function handleSignIn() {
    console.log("Submit: Sign In Triggered");
    try {
        const emailEl = document.getElementById('signin-email');
        const passEl = document.getElementById('signin-password');
        
        if (!emailEl || !passEl) throw new Error("HTML Input IDs 'signin-email' or 'signin-password' are missing!");

        const { data, error } = await supabase.auth.signInWithPassword({
            email: emailEl.value.trim(),
            password: passEl.value
        });

        if (error) throw error;
        window.location.href = 'certification_portal.html';
    } catch (err) {
        console.error(err);
        alert("Sign In Error: " + err.message);
    }
}

async function handleSignUp() {
    console.log("Submit: Sign Up Triggered");
    try {
        const nameEl = document.getElementById('signup-name');
        const emailEl = document.getElementById('signup-email');
        const passEl = document.getElementById('signup-password');
        const confirmEl = document.getElementById('signup-confirm-password');

        if (!emailEl || !passEl) throw new Error("HTML Input IDs missing for signup!");
        if (passEl.value !== confirmEl.value) throw new Error("Passwords do not match!");

        const { data, error } = await supabase.auth.signUp({
            email: emailEl.value.trim(),
            password: passEl.value,
            options: { data: { full_name: nameEl.value } }
        });

        if (error) throw error;
        alert("Account created! Check your email for confirmation.");
    } catch (err) {
        console.error(err);
        alert("Sign Up Error: " + err.message);
    }
}
