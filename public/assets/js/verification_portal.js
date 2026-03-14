    //==============================================
    //        ENHANCED VERIFICATION SCRIPT
    //        WITH YOUTUBE PLAYBACK SUPPORT
    //==============================================
    (function() {
    'use strict';
    
    // DOM Elements
    const fileInput = document.getElementById('video-file');
    const urlInput = document.getElementById('video-url');
    const verifyBtn = document.getElementById('verify-btn');
    const overlay = document.getElementById('processing-overlay');
    const statusText = overlay.querySelector('h2');
    const videoPreview = document.getElementById('main-preview');
    const ytContainer = document.getElementById('youtube-player');
    const placeholder = document.getElementById('preview-placeholder');
    const fileHint = document.getElementById('file-name-hint');
    
    // YouTube Player API variables
    let youtubePlayer = null;
    let youtubeApiReady = false;
    
    // Service cards
    const serviceCards = document.querySelectorAll('.service-card');
    const serviceRisk = document.getElementById('service-risk');
    const serviceAppeal = document.getElementById('service-appeal');
    const serviceProtection = document.getElementById('service-protection');
    
    // Progress trackers
    const progressSteps = {
    step1: document.getElementById('step1-progress'),
    step2: document.getElementById('step2-progress'),
    step3: document.getElementById('step3-progress'),
    step4: document.getElementById('step4-progress'),
    step5: document.getElementById('step5-progress')
    };
    
    const progressTracker = {
    step1: document.getElementById('step1'),
    step2: document.getElementById('step2'),
    step3: document.getElementById('step3'),
    step4: document.getElementById('step4'),
    step5: document.getElementById('step5')
    };
    
    // User Menu
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userDropdown = document.getElementById('userDropdown');
    
    // Selected service
    let selectedService = 'risk'; // Default
    
    //==============================================
    //        YOUTUBE PLAYER INTEGRATION
    //==============================================
    
    // Load YouTube IFrame API
    function loadYouTubeAPI() {
    if (window.YT && window.YT.Player) {
    youtubeApiReady = true;
    return;
    }
    
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
    
    // YouTube API ready callback
    window.onYouTubeIframeAPIReady = function() {
    youtubeApiReady = true;
    console.log('YouTube API ready');
    };
    
    // Initialize YouTube player using reliable nocookie iframe
    function initYouTubePlayer(videoId) {
    const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&showinfo=0&controls=1&autoplay=0`;
    ytContainer.innerHTML = `<iframe src="${embedUrl}" style="width:100%;height:100%;border:none;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    ytContainer.style.width = '100%';
    ytContainer.style.height = '100%';
    ytContainer.classList.remove('hidden');
    placeholder.classList.add('hidden');
    updateProgressStep(4, true);
    }
    
    // Extract YouTube ID (enhanced version)
    function extractYouTubeId(url) {
    if (!url || typeof url !== 'string') return null;
    
    // Handle different YouTube URL formats
    const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/watch\?.*?&v=)([^#&?]{11})/i,
    /^([a-zA-Z0-9_-]{11})$/, // Direct video ID
    /youtube\.com\/shorts\/([^#&?]{11})/i // YouTube Shorts
    ];
    
    for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
    }
    
    return null;
    }
    
    // Update Preview with YouTube support
    function updatePreview(src) {
    // Reset preview
    videoPreview.classList.add('hidden');
    ytContainer.classList.add('hidden');
    placeholder.classList.remove('hidden');
    
    // Stop any existing video
    if (videoPreview.src) {
    videoPreview.pause();
    videoPreview.src = '';
    }
    
    // Clear YouTube container
    ytContainer.innerHTML = '';
    youtubePlayer = null;
    
    const ytId = extractYouTubeId(src);
    
    if (ytId) {
    // YouTube video — always use nocookie iframe
    initYouTubePlayer(ytId);
    
    } else if (src && src !== '' && src.startsWith('blob:')) {
    // Local video file
    videoPreview.src = src;
    videoPreview.classList.remove('hidden');
    placeholder.classList.add('hidden');
    videoPreview.load();
    
    // Update progress tracker
    updateProgressStep(4, true);
    } else if (src && src !== '' && (src.includes('vimeo.com') || src.includes('dailymotion.com'))) {
    // Other video platforms
    const embedUrl = getOtherPlatformEmbedUrl(src);
    if (embedUrl) {
    ytContainer.innerHTML = `<iframe src="${embedUrl}" style="width:100%; height:100%;" frameborder="0" allowfullscreen></iframe>`;
    ytContainer.classList.remove('hidden');
    placeholder.classList.add('hidden');
    }
    }
    }
    
    // Helper for other platforms
    function getOtherPlatformEmbedUrl(url) {
    if (url.includes('vimeo.com')) {
    const vimeoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
    return vimeoId ? `https://player.vimeo.com/video/${vimeoId}` : null;
    }
    if (url.includes('dailymotion.com')) {
    const dmId = url.match(/dailymotion\.com\/video\/([^_?]+)/)?.[1];
    return dmId ? `https://www.dailymotion.com/embed/video/${dmId}` : null;
    }
    return null;
    }
    
    // Service Card Selection
    serviceCards.forEach(card => {
    card.addEventListener('click', function() {
    // Remove selected class from all cards
    serviceCards.forEach(c => c.classList.remove('selected'));
    
    // Add selected class to clicked card
    this.classList.add('selected');
    
    // Store selected service
    selectedService = this.dataset.service;
    
    // Update progress tracker
    updateProgressStep(2, true);
    
    // Log selection (for analytics)
    console.log(`Service selected: ${selectedService}`);
    });
    });
    
    // Set default selected service
    serviceRisk.classList.add('selected');
    
    // Update Progress Tracker (main steps)
    function updateProgressStep(step, completed = false) {
    for (let i = 1; i <= 5; i++) {
    if (progressTracker[`step${i}`]) {
    progressTracker[`step${i}`].classList.remove('active', 'completed');
    }
    }
    
    for (let i = 1; i < step; i++) {
    if (progressTracker[`step${i}`]) {
    progressTracker[`step${i}`].classList.add('completed');
    }
    }
    
    if (progressTracker[`step${step}`]) {
    progressTracker[`step${step}`].classList.add('active');
    }
    }
    
    // Update Processing Progress
    function updateProcessingProgress(step) {
    const steps = ['step1', 'step2', 'step3', 'step4', 'step5'];
    
    steps.forEach((s, index) => {
    if (progressSteps[s]) {
    progressSteps[s].classList.remove('active', 'completed');
    
    if (index + 1 < step) {
    progressSteps[s].classList.add('completed');
    progressSteps[s].querySelector('.step-indicator').innerHTML = '<i class="fas fa-check"></i>';
    } else if (index + 1 === step) {
    progressSteps[s].classList.add('active');
    progressSteps[s].querySelector('.step-indicator').innerHTML = '<i class="fas fa-circle"></i>';
    } else {
    progressSteps[s].querySelector('.step-indicator').innerHTML = '<i class="fas fa-circle"></i>';
    }
    }
    });
    }
    
    // Show Proceed Button
    function showProceedButton() {
    const proceedContainer = document.getElementById('proceed-container');
    proceedContainer.innerHTML = '';
    
    const certificateBadge = document.createElement('div');
    certificateBadge.className = 'certificate-result';
    certificateBadge.innerHTML = '<i class="fas fa-certificate"></i> Content Ownership Certified by SeekReap';
    proceedContainer.appendChild(certificateBadge);
    
    const proceedBtn = document.createElement('button');
    proceedBtn.className = 'proceed-btn';
    proceedBtn.innerHTML = '<i class="fas fa-chart-line"></i> View Protection Report';
    
    proceedBtn.onclick = () => {
    window.location.href = 'verification_report.html';
    };
    
    proceedContainer.appendChild(proceedBtn);
    
    // Update final progress step
    updateProcessingProgress(5);
    setTimeout(() => {
    document.querySelector('#processing-overlay h2').innerText = 'Protection Complete';
    statusText.innerText = 'Analysis Complete. Certificate generated.';
    }, 500);
    }
    
    // Simulate Processing Steps
    async function simulateProcessing() {
    updateProcessingProgress(1);
    document.querySelector('#processing-overlay h2').innerText = 'Extracting Metadata...';
    await new Promise(r => setTimeout(r, 800));
    
    updateProcessingProgress(2);
    document.querySelector('#processing-overlay h2').innerText = 'Generating Fingerprint...';
    await new Promise(r => setTimeout(r, 1200));
    
    updateProcessingProgress(3);
    document.querySelector('#processing-overlay h2').innerText = 'Analyzing Platform Risk...';
    await new Promise(r => setTimeout(r, 1500));
    
    updateProcessingProgress(4);
    document.querySelector('#processing-overlay h2').innerText = 'Creating Certificate...';
    await new Promise(r => setTimeout(r, 1000));
    
    showProceedButton();
    }
    
    // Generate a simple content hash from a string
    function hashContent(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(16, '0');
    }

    // Start Analysis — wired to Tier-4 /api/submit
    async function startTier6Analysis(payload) {
    try {
    document.querySelector('#processing-overlay h2').innerText = 'SeekReap AI Analysis';
    statusText.innerText = "Submitting to SeekReap pipeline...";
    updateProcessingProgress(1);

    const contentSource = payload.youtubeId || payload.url || payload.name || Date.now().toString();
    const contentHash = hashContent(contentSource + payload.timestamp);
    const creatorId = (window.API_CONFIG && window.API_CONFIG.DEV_CREATOR_ID)
    || "a8e4fbba-2627-4fbf-98e0-468a47bab8fc";
    const tier4Url = (window.API_CONFIG && window.API_CONFIG.TIER4_URL)
    || "https://seekreap-tier4-tif2gmgi4q-uc.a.run.app";

    const tier4Payload = {
    creator_id: creatorId,
    content_hash: contentHash,
    content_url: payload.url || null,
    content_type: "video",
    platform: payload.platform || "youtube",
    tier: payload.tier || "free",
    metadata: {
    youtube_id: payload.youtubeId || null,
    file_name: payload.name || null,
    file_size: payload.fileSize || null,
    submitted_at: payload.timestamp
    }
    };

    statusText.innerText = "Connecting to Tier-4 Orchestrator...";
    updateProcessingProgress(2);

    const response = await fetch(tier4Url + "/api/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(tier4Payload)
    });

    const result = await response.json();

    if (response.ok && result.submission_id) {
    sessionStorage.setItem("last_submission_id", result.submission_id);
    sessionStorage.setItem("seekreap_results", JSON.stringify({
    ...payload,
    submission_id: result.submission_id,
    status: result.status,
    tier5_dispatch: result.tier5_dispatch
    }));

    statusText.innerText = "Queued for analysis. Submission ID: " + result.submission_id.slice(0, 8) + "...";
    updateProcessingProgress(3);
    showProceedButton();
    } else {
    throw new Error(result.error || result.detail || "Submission failed");
    }

    } catch (err) {
    document.querySelector('#processing-overlay h2').innerText = 'Submission Error';
    statusText.innerText = "Error: " + err.message;
    console.error("Tier-4 submission error:", err);
    }
    }
    
    // Event Listeners
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
    
    // Tier selection updates progress
    document.querySelectorAll('input[name="tier"]').forEach(radio => {
    radio.addEventListener('change', () => updateProgressStep(1, true));
    });
    
    // Platform selection updates progress
    document.querySelectorAll('input[name="platform"]').forEach(radio => {
    radio.addEventListener('change', () => updateProgressStep(3, true));
    });
    
    // Verify button click (updated with backend integration)
    verifyBtn.addEventListener('click', async () => {
    const file = fileInput.files[0];
    const url = urlInput.value.trim();
    const tier = document.querySelector('input[name="tier"]:checked')?.value || 'free';
    const platform = document.querySelector('input[name="platform"]:checked')?.value || 'youtube';
    
    if (!file && url.length <= 10) {
    alert('Please provide a video file or URL to begin verification.');
    return;
    }
    
    // Update progress tracker
    updateProgressStep(5);
    
    overlay.style.display = 'flex';
    
    let payload = {
    timestamp: new Date().toISOString(),
    tier: tier,
    service: selectedService,
    platform: platform,
    name: file ? file.name : "Remote URL",
    url: url || "local_upload",
    fileSize: file ? (file.size / (1024 * 1024)).toFixed(2) + " MB" : null,
    fileType: file ? file.type : null,
    // Extract YouTube ID if present
    youtubeId: url ? extractYouTubeId(url) : null
    };
    
    await startTier6Analysis(payload);
    });
    
    // User Menu Toggle
    if (userMenuBtn && userDropdown) {
    userMenuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    userDropdown.classList.toggle('active');
    });
    
    document.addEventListener('click', (e) => {
    if (!userMenuBtn.contains(e.target) && !userDropdown.contains(e.target)) {
    userDropdown.classList.remove('active');
    }
    });
    }
    
    // User Avatar click
    document.getElementById('userAvatar')?.addEventListener('click', () => {
    window.location.href = '/creator-profile';
    });
    
    // Initialize YouTube API
    loadYouTubeAPI();
    
    // Initialize progress
    updateProgressStep(1);
    
    })();
    
