function showError(msg) {
    console.error(msg);
    alert(msg);
}

function showSuccess(msg) {
    console.log(msg);
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function handleSignIn() {
    const email = document.getElementById('signin-email').value.trim();
    const password = document.getElementById('signin-password').value;

    if (!email || !password) {
        return showError('Missing credentials');
    }

    try {
        const result = await firebase.auth().signInWithEmailAndPassword(email, password);
        showSuccess("Signed in: " + result.user.email);
    } catch (err) {
        showError(err.message);
    }
}

async function handleSignUp() {
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;

    try {
        const result = await firebase.auth().createUserWithEmailAndPassword(email, password);
        showSuccess("Signed up: " + result.user.email);
    } catch (err) {
        showError(err.message);
    }
}
