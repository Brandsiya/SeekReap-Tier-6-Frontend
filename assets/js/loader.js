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
const statusElement = document.getElementById("status");

setInterval(() => {
    if (statusElement) {
        statusElement.innerText = messages[i];
        i = (i + 1) % messages.length;
    }
}, 1200);

// Automatic redirect to index.html after 8.5 seconds
setTimeout(() => {
    window.location.href = "index.html";
}, 8500);
