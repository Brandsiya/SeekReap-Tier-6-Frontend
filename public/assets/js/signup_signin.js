async function handleSignIn() {
    console.log("🚀 Sign In Button Clicked");
    try {
        const email = document.getElementById('signin-email').value.trim();
        const password = document.getElementById('signin-password').value;

        const { data, error } = await window.supabaseClient.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;
        console.log("Auth Success:", data);
        window.location.href = 'certification_portal.html';
    } catch (err) {
        console.error("Sign In Error:", err);
        alert(err.message);
    }
}

async function handleSignUp() {
    console.log("🚀 Create Account Button Clicked");
    try {
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value;
        const name = document.getElementById('signup-name').value.trim();

        const { data, error } = await window.supabaseClient.auth.signUp({
            email,
            password,
            options: { data: { full_name: name } }
        });

        if (error) throw error;
        alert("Verification email sent! Check your inbox.");
    } catch (err) {
        console.error("Sign Up Error:", err);
        alert(err.message);
    }
}

// Re-include UI helpers
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
