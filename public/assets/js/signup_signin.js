/**
 * UI & INTERACTION LOGIC
 */

function switchTab(tab) {
    const isSignin = tab === 'signin';
    
    // Toggle active state on tabs
    document.getElementById('signin-tab').classList.toggle('active', isSignin);
    document.getElementById('signup-tab').classList.toggle('active', !isSignin);
    
    // Toggle visibility of forms
    document.getElementById('signin-form').classList.toggle('hidden', !isSignin);
    document.getElementById('signup-form').classList.toggle('hidden', isSignin);
    
    console.log(`Switched to ${tab} view`);
}

function togglePassword(inputId, icon) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
}

/**
 * SUPABASE AUTHENTICATION LOGIC
 */

async function handleSignIn() {
    const email = document.getElementById('signin-email').value.trim();
    const password = document.getElementById('signin-password').value;

    if (!email || !password) return alert("Please enter both email and password.");

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        console.error("Login failed:", error.message);
        alert(error.message);
    } else {
        console.log("Login successful:", data);
        window.location.href = 'certification_portal.html';
    }
}

async function handleSignUp() {
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    const fullName = document.getElementById('signup-name').value.trim();

    if (password !== confirmPassword) return alert("Passwords do not match!");
    if (password.length < 6) return alert("Password must be at least 6 characters.");

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { full_name: fullName }
        }
    });

    if (error) {
        console.error("Signup failed:", error.message);
        alert(error.message);
    } else {
        alert("Registration successful! Please check your email for the confirmation link.");
    }
}

// Placeholder for social/forgot logic to prevent errors if clicked
function handleSocialLogin(provider) { alert(`${provider} login integration coming soon.`); }
function handleForgotPassword() { alert("Password reset link will be sent to your email."); }
