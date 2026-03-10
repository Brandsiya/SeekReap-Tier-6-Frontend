const messages = [
    "Scanning video structure...",
    "Checking monetization policies...",
    "Analyzing visual elements...",
    "Evaluating audio patterns...",
    "Detecting copyright signals...",
    "Calculating monetization risk...",
    "Preparing analysis report..."
];

let i = 0;
const statusEl = document.getElementById("status");

const messageInterval = setInterval(() => {
    if (statusEl) {
        statusEl.innerText = messages[i];
        i++;
        if (i >= messages.length) i = 0;
    }
}, 1200);

// Redirect to dashboard (index.html) after 8 seconds
setTimeout(() => {
    clearInterval(messageInterval);
    window.location.href = "verification_portal.html";
}, 8000);
