// Dashboard JS - Connected to cleaned backend
const API_BASE = 'https://seekreap-backend-308655322607.us-central1.run.app';

async function submitTask() {
    const taskType = document.getElementById('taskType').value || 'smoke_test';
    const message = document.getElementById('message').value || 'Frontend test';
    
    try {
        const response = await fetch(`${API_BASE}/api/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                task_type: taskType,
                payload: { msg: message, source: 'frontend' }
            })
        });
        
        const result = await response.json();
        document.getElementById('result').innerHTML = 
            `<div class="success">✅ Task created! ID: ${result.task_id}</div>`;
    } catch (error) {
        document.getElementById('result').innerHTML = 
            `<div class="error">❌ Error: ${error.message}</div>`;
    }
}

async function loadSubmissions() {
    try {
        const response = await fetch(`${API_BASE}/api/submissions`);
        const submissions = await response.json();
        
        let html = '<h3>Recent Submissions</h3><ul>';
        submissions.forEach(sub => {
            html += `<li>Job ${sub.job_id}: ${sub.status} (${new Date(sub.created_at).toLocaleString()})</li>`;
        });
        html += '</ul>';
        
        document.getElementById('submissions').innerHTML = html;
    } catch (error) {
        console.error('Failed to load submissions:', error);
    }
}

// Check system health on load
async function checkHealth() {
    try {
        const response = await fetch(`${API_BASE}/health`);
        const health = await response.json();
        document.getElementById('health').innerHTML = 
            `<span class="healthy">✅ System Healthy (Tier ${health.tier})</span>`;
    } catch (error) {
        document.getElementById('health').innerHTML = 
            `<span class="unhealthy">❌ System Unreachable</span>`;
    }
}

// Load on page ready
document.addEventListener('DOMContentLoaded', () => {
    checkHealth();
    loadSubmissions();
    
    // Add event listener to submit button if it exists
    const submitBtn = document.getElementById('submitTask');
    if (submitBtn) submitBtn.addEventListener('click', submitTask);
});
