// DEBUG: Confirm the script actually loaded
console.log("🚀 SeekReap Auth Script Loaded");

function switchTab(tab) {
    const isSignin = tab === 'signin';
    document.getElementById('signin-tab').classList.toggle('active', isSignin);
    document.getElementById('signup-tab').classList.toggle('active', !isSignin);
    document.getElementById('signin-form').classList.toggle('hidden', !isSignin);
    document.getElementById('signup-form').classList.toggle('hidden', isSignin);
}

async function handleSignIn() {
    console.log("Attempting Sign In...");
    
    // Check if Supabase is actually alive
    if (typeof supabase === 'undefined' || !window.supabase) {
        alert("CRITICAL ERROR: Supabase SDK is not initialized. Check your console (F12).");
        return;
    }

    const email = document.getElementById('signin-email').value.trim();
    const password = document.getElementById('signin-password').value;

    try {
        const { data, error } = await window.supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        console.log("Success!", data);
        window.location.href = 'certification_portal.html';
    } catch (err) {
        console.error("Auth Error:", err);
        alert("Sign In Failed: " + err.message);
    }
}

async function handleSignUp() {
    console.log("Attempting Sign Up...");
    
    if (typeof supabase === 'undefined' || !window.supabase) {
        alert("CRITICAL ERROR: Supabase SDK is not initialized.");
        return;
    }

    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const name = document.getElementById('signup-name').value.trim();

    try {
        const { data, error } = await window.supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: name } }
        });

        if (error) throw error;
        alert("Registration successful! Check your email for a confirmation link.");
    } catch (err) {
        console.error("Signup Error:", err);
        alert("Sign Up Failed: " + err.message);
    }
}
