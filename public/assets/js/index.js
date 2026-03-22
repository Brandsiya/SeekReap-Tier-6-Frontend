(function() {
    'use strict';

    // Update loading status messages
    const status = document.getElementById('status');
    const messages = [
        'Initializing AI Analysis...',
        'Loading secure environment...',
        'Checking authentication...',
        'Almost ready...'
    ];
    let i = 0;
    const msgInterval = setInterval(() => {
        i++;
        if (i < messages.length && status) {
            status.textContent = messages[i];
        }
    }, 600);

    // Wait for Firebase then check auth state
    let attempts = 0;
    const iv = setInterval(() => {
        attempts++;
        if (typeof firebase !== 'undefined' && firebase.auth) {
            clearInterval(iv);
            clearInterval(msgInterval);

            firebase.auth().onAuthStateChanged(function(user) {
                if (user) {
                    // Signed in — go to dashboard
                    window.location.href = 'dashboard.html';
                } else {
                    // Not signed in — go to home
                    window.location.href = 'home.html';
                }
            });
        } else if (attempts > 50) {
            // Firebase failed to load — fall back to home
            clearInterval(iv);
            clearInterval(msgInterval);
            window.location.href = 'home.html';
        }
    }, 100);
})();
