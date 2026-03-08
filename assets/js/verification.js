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

        ytContainer.innerHTML = `<iframe
            src="${embedUrl}"
            style="width:100%; height:100%;"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen>
        </iframe>`;
        ytContainer.classList.remove('hidden');
    } else {
        videoPreview.src = src;
        videoPreview.classList.remove('hidden');
        videoPreview.load();
    }
}

fileInput.addEventListener('change', function () {
    const file = this.files[0];
    if (file) {
        fileHint.innerText = file.name;
        updatePreview(URL.createObjectURL(file));
        urlInput.value = '';
    }
});

urlInput.addEventListener('input', function () {
    const val = this.value.trim();
    if (val.length > 10) {
        updatePreview(val);
        fileHint.innerText = 'URL Source Active';
        fileInput.value = '';
    }
});

// FIXED: Removed automatic redirect. 
// The overlay now triggers a "completion" state where a link must be clicked.
verifyBtn.addEventListener('click', function () {
    const hasFile = fileInput.files.length > 0;
    const hasUrl = urlInput.value.trim().length > 10;

    if (!hasFile && !hasUrl) {
        alert('Please provide a valid video source to begin.');
        return;
    }

    overlay.style.display = 'flex';
    
    // Logic for Tier-5 Analysis would go here.
    // We will leave the overlay visible so the user sees the "Processing" 
    // messages we built into the HTML earlier.
    console.log("Analysis started. Manual exit required.");
});
