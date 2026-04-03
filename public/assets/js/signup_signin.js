function showError(msg) {
    console.error(msg);
    alert(msg);
}

function showSuccess(msg) {
    console.log(msg);
}

async function handleSignIn() {
    const email = document.getElementById('signin-email').value.trim();
    const password = document.getElementById('signin-password').value;

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) return showError(error.message);

    showSuccess("Signed in: " + data.user.email);
    window.location.href = 'certification_portal.html';
}

async function handleSignUp() {
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;

    const { data, error } = await supabase.auth.signUp({
        email,
        password
    });

    if (error) return showError(error.message);

    showSuccess("Check your email for confirmation!");
}
