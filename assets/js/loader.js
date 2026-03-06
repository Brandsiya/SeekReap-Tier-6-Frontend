const messages = ["Scanning video structure...", "Checking monetization policies...", "Analyzing visual elements...", "Evaluating audio patterns...", "Preparing analysis report..."];
let i = 0;
const statusElement = document.getElementById("status");

setInterval(() => {
    if (statusElement) {
        statusElement.innerText = messages[i];
        i = (i + 1) % messages.length;
    }
}, 1200);

// Smart Redirect
setTimeout(() => {
    const user = localStorage.getItem("seekreap_user");
    if (user) {
        window.location.href = "dashboard.html";
    } else {
        window.location.href = "index.html";
    }
}, 8500);
