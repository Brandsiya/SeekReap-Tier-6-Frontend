// Main application logic for SeekReap Tier-6 Frontend

// Submit a new task to the queue
async function handleFormSubmit(event) {
    event.preventDefault();
    
    const taskType = document.getElementById('task-type').value;
    const inputUrl = document.getElementById('input-url').value;
    const userNotes = document.getElementById('notes').value;
    const submitBtn = document.getElementById('submit-btn');
    const resultDiv = document.getElementById('form-result');
    
    // Disable button during submission
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    resultDiv.innerHTML = '<span class="info">⏳ Submitting task...</span>';
    
    const taskData = {
        task_type: taskType,
        payload: {
            input_url: inputUrl,
            user_notes: userNotes,
            source: 'frontend-dashboard',
            timestamp: new Date().toISOString()
        }
    };

    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TASKS}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskData)
        });

        const result = await response.json();
        
        if (result.status === "success") {
            resultDiv.innerHTML = `<span class="success">✅ Task ${result.task_id} queued successfully!</span>`;
            // Clear form
            document.getElementById('input-url').value = '';
            document.getElementById('notes').value = '';
            fetchHistory(); // Refresh the history table
        } else {
            resultDiv.innerHTML = `<span class="error">❌ Error: ${result.message || 'Unknown error'}</span>`;
        }
    } catch (error) {
        console.error("Submission error:", error);
        resultDiv.innerHTML = `<span class="error">❌ Network error: ${error.message}</span>`;
    } finally {
        // Re-enable button
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit to Tier-6';
    }
}

// Fetch and render submission history
async function fetchHistory() {
    const tableBody = document.getElementById('history-body');
    if (!tableBody) return;
    
    tableBody.innerHTML = '<tr><td colspan="3" class="loading">Loading history...</td></tr>';

    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SUBMISSIONS}`);
        const data = await response.json();

        if (!data || data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="3" class="empty">No submissions yet</td></tr>';
            return;
        }

        tableBody.innerHTML = data.map(item => {
            const jobId = item.job_id || item.id || 'N/A';
            const status = item.status || 'unknown';
            const createdAt = item.created_at ? new Date(item.created_at).toLocaleString() : 'Unknown';
            
            return `
                <tr>
                    <td>${jobId}</td>
                    <td><span class="status-${status}">${status}</span></td>
                    <td>${createdAt}</td>
                </tr>
            `;
        }).join('');
        
    } catch (error) {
        console.error("Failed to fetch history:", error);
        tableBody.innerHTML = '<tr><td colspan="3" class="error">❌ Failed to load data. Please try again.</td></tr>';
    }
}

// Check system health
async function checkHealth() {
    const healthElement = document.getElementById('system-health');
    if (!healthElement) return;
    
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.HEALTH}`);
        const health = await response.json();
        
        if (health.status === 'healthy') {
            healthElement.innerHTML = `<span class="health-healthy">✅ System Healthy (Tier ${health.tier})</span>`;
        } else {
            healthElement.innerHTML = `<span class="health-degraded">⚠️ System Degraded</span>`;
        }
    } catch (error) {
        healthElement.innerHTML = `<span class="health-unhealthy">❌ System Unreachable</span>`;
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    checkHealth();
    fetchHistory();
    
    // Set up form submission
    const form = document.getElementById('task-form');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
});

// Make functions globally available
window.handleFormSubmit = handleFormSubmit;
window.fetchHistory = fetchHistory;
window.checkHealth = checkHealth;
