// Loading messages to cycle through
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

// Update status message every 1.2 seconds
setInterval(() => {
    document.getElementById("status").innerText = messages[i];
    i++;
    if (i >= messages.length) {
        i = 0;
    }
}, 1200);

// Redirect to existing index.html after animation completes
// The animation is 8 seconds (from progressMove keyframes)
setTimeout(() => {
    window.location.href = '/home.html';
}, 8000); // Redirect after 8 seconds
