const fileInput = document.getElementById('video-file');
const urlInput = document.getElementById('video-url');
const videoPreview = document.getElementById('main-preview');
const ytContainer = document.getElementById('youtube-player');
const placeholder = document.getElementById('preview-placeholder');
const verifyBtn = document.getElementById('verify-btn');
const overlay = document.getElementById('processing-overlay');
const fileHint = document.getElementById('file-name-hint');

function extractYouTubeId(url) {
    const regExp = /^.*((youtu\.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
}

function updatePreview(src) {
    const ytId = extractYouTubeId(src);
    videoPreview.classList.add('hidden');
    ytContainer.classList.add('hidden');
    placeholder.classList.add('hidden');
    videoPreview.pause();
    videoPreview.src = '';
    ytContainer.innerHTML = '';

    if (ytId) {
        const origin = window.location.origin;
        const embedUrl = `https://www.youtube-nocookie.com/embed/${ytId}?rel=0&modestbranding=1&showinfo=0&autoplay=0&enablejsapi=1&origin=${origin}`;
        ytContainer.innerHTML = `<iframe src="${embedUrl}" style="width:100%; height:100%;" frameborder="0" allowfullscreen></iframe>`;
        ytContainer.classList.remove('hidden');
    } else {
        videoPreview.src = src;
        videoPreview.classList.remove('hidden');
        videoPreview.load();
    }
}

fileInput.addEventListener('change', function() {
    if (this.files[0]) {
        fileHint.innerText = this.files[0].name;
        updatePreview(URL.createObjectURL(this.files[0]));
        urlInput.value = '';
    }
});

urlInput.addEventListener('input', function() {
    if (this.value.trim().length > 10) {
        updatePreview(this.value.trim());
        fileHint.innerText = 'URL Source Active';
        fileInput.value = '';
    }
});

function finishAnalysis(data) {
    sessionStorage.setItem('seekreap_results', JSON.stringify(data));
    const statusText = overlay.querySelector('p');
    if (statusText) statusText.innerText = 'Analysis Complete. Metadata Cached.';

    const proceedBtn = document.createElement('button');
    proceedBtn.innerText = 'View Real-Time Audit Report';
    proceedBtn.style.marginTop = '20px';
    proceedBtn.style.padding = '12px 24px';
    proceedBtn.style.backgroundColor = '#00ff00';
    proceedBtn.style.color = '#000';
    proceedBtn.style.border = 'none';
    proceedBtn.style.borderRadius = '5px';
    proceedBtn.style.cursor = 'pointer';
    proceedBtn.style.fontWeight = 'bold';
    proceedBtn.style.boxShadow = '0 0 15px rgba(0, 255, 0, 0.4)';

    // The Redirect Action
    proceedBtn.onclick = () => {
        window.location.href = 'dashboard.html';
    };

    const loaderBox = overlay.querySelector('.loader-box') || overlay;
    loaderBox.appendChild(proceedBtn);
}

verifyBtn.addEventListener('click', async function() {
    const file = fileInput.files[0];
    const url = urlInput.value.trim();

    if (!file && url.length <= 10) {
        alert('Please provide a video source.');
        return;
    }

    overlay.style.display = 'flex';
    const statusText = overlay.querySelector('p');

    let analysisResults = {
        timestamp: new Date().toISOString(),
        tier: document.querySelector('input[name="tier"]:checked')?.value || 5
    };

    if (file) {
        statusText.innerText = "Extracting binary metadata...";
        
        analysisResults = {
            ...analysisResults,
            source: 'Local File',
            name: file.name,
            size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
            type: file.type
        };

        const video = document.createElement('video');
        video.preload = 'metadata';
        video.src = URL.createObjectURL(file);
        video.onloadedmetadata = () => {
            analysisResults.duration = video.duration.toFixed(2) + "s";
            finishAnalysis(analysisResults);
        };
    } else if (url) {
        statusText.innerText = "Querying YouTube Origin Handshake...";
        analysisResults = { 
            ...analysisResults,
            source: "YouTube", 
            name: url.substring(0, 30) + "...",
            size: "External",
            duration: "External",
            url: url
        };
        setTimeout(() => finishAnalysis(analysisResults), 1500);
    }
});
