firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
        window.location.href = "signup_signin.html";
    } else {
        const el = document.getElementById("primaryEmail");
        if (el) el.textContent = user.email;
    }
});
