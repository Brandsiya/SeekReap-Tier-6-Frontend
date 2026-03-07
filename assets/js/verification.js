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
        const embedUrl = `https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1&showinfo=0&autoplay=0`;
        ytContainer.innerHTML = `<iframe
            src="${embedUrl}"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
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

verifyBtn.addEventListener('click', function () {
    const hasFile = fileInput.files.length > 0;
    const hasUrl = urlInput.value.trim().length > 10;

    if (!hasFile && !hasUrl) {
        alert('Please provide a valid video source (Upload or URL) to begin.');
        return;
    }

    overlay.style.display = 'flex';

    const tier = document.querySelector('input[name="tier"]:checked').value;
    const platform = document.querySelector('input[name="platform"]:checked').value;

    setTimeout(() => {
        window.location.href = `index.html?tier=${tier}&platform=${platform}`;
    }, 2500);
});
