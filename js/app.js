// Main application logic
let currentJobId = null;
let pollInterval = null;

// DOM Elements
const fileInput = document.getElementById('fileInput');
const urlInput = document.getElementById('urlInput');
const fileName = document.getElementById('fileName');
const submitBtn = document.getElementById('submitBtn');
const statusDiv = document.getElementById('status');
const resultsDiv = document.getElementById('results');
const jobDetailsDiv = document.getElementById('jobDetails');
const progressContainer = document.getElementById('progress');
const progressBar = document.getElementById('progressBar');
const resultDataDiv = document.getElementById('resultData');

// File input handler
fileInput.addEventListener('change', (e) => {
    if (e.target.files[0]) {
        fileName.textContent = `Selected: ${e.target.files[0].name}`;
        urlInput.value = ''; // Clear URL when file is selected
    } else {
        fileName.textContent = '';
    }
});

// URL input handler
urlInput.addEventListener('input', (e) => {
    if (e.target.value) {
        fileInput.value = ''; // Clear file when URL is entered
        fileName.textContent = '';
    }
});

// Submit handler
submitBtn.addEventListener('click', async () => {
    const file = fileInput.files[0];
    const url = urlInput.value.trim();

    if (!file && !url) {
        showStatus('Please select a file or enter a YouTube URL', 'error');
        return;
    }

    submitBtn.disabled = true;
    showStatus('Submitting...', 'info');

    try {
        let response;
        const API_BASE = CONFIG.API_BASE;

        if (file) {
            // File upload
            const formData = new FormData();
            formData.append('video', file);
            response = await fetch(`${API_BASE}/api/submit`, {
                method: 'POST',
                body: formData
            });
        } else {
            // URL submission
            response = await fetch(`${API_BASE}/api/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    creator_id: 1,
                    url: url,
                    job_type: 'url'
                })
            });
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Submission failed');
        }

        const jobId = data.job_id || data.id;
        showStatus(`Job created! ID: ${jobId}`, 'success');
        
        // Show results section and start polling
        resultsDiv.style.display = 'block';
        currentJobId = jobId;
        startPolling(jobId);

    } catch (error) {
        console.error('Upload error:', error);
        showStatus(`Error: ${error.message}. Please try again.`, 'error');
        submitBtn.disabled = false;
    }
});

// Poll for job status
function startPolling(jobId) {
    if (pollInterval) {
        clearInterval(pollInterval);
    }

    pollInterval = setInterval(() => fetchJobStatus(jobId), CONFIG.POLL_INTERVAL);
    fetchJobStatus(jobId); // Immediate first fetch
}

async function fetchJobStatus(jobId) {
    try {
        const response = await fetch(`${CONFIG.API_BASE}/api/submissions/${jobId}`);
        const job = await response.json();

        if (!response.ok) {
            throw new Error(job.error || 'Failed to fetch job');
        }

        updateJobDisplay(job);

        // If job is completed or failed, stop polling
        if (job.status === 'completed' || job.status === 'failed') {
            stopPolling();
            submitBtn.disabled = false;
        }

    } catch (error) {
        console.error('Error fetching job:', error);
        showStatus(`Error fetching job: ${error.message}`, 'error');
    }
}

function updateJobDisplay(job) {
    // Update job details
    jobDetailsDiv.innerHTML = `
        <p><strong>Job ID:</strong> ${job.job_id}</p>
        <p><strong>Status:</strong> <span class="status-${job.status}">${job.status}</span></p>
        <p><strong>Type:</strong> ${job.job_type}</p>
        <p><strong>Created:</strong> ${new Date(job.created_at).toLocaleString()}</p>
        ${job.completed_at ? `<p><strong>Completed:</strong> ${new Date(job.completed_at).toLocaleString()}</p>` : ''}
        ${job.failure_reason ? `<p><strong>Failure:</strong> ${job.failure_reason}</p>` : ''}
    `;

    // Show/hide progress bar
    if (job.status === 'pending') {
        progressContainer.style.display = 'block';
        // Simulate progress (just for visual feedback)
        let progress = 0;
        const interval = setInterval(() => {
            progress = Math.min(progress + 5, 90);
            progressBar.style.width = `${progress}%`;
            if (progress >= 90) clearInterval(interval);
        }, 500);
    } else {
        progressContainer.style.display = 'none';
        progressBar.style.width = '0%';
    }

    // Show results if completed
    if (job.status === 'completed') {
        progressContainer.style.display = 'none';
        resultDataDiv.textContent = JSON.stringify(job.params || job.result || {}, null, 2);
    } else if (job.status === 'failed') {
        resultDataDiv.textContent = `Job failed: ${job.failure_reason}`;
    }
}

function stopPolling() {
    if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
    }
}

function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = `status-message ${type}`;
}

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    stopPolling();
});
