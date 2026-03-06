const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export const seekReapApi = {
    // New Task Queue Logic
    async submitTask(taskType, payload) {
        const response = await fetch(`${API_BASE}/api/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ task_type: taskType, payload })
        });
        return response.json();
    },

    // Submissions History
    async getSubmissions() {
        const response = await fetch(`${API_BASE}/api/submissions`);
        if (!response.ok) throw new Error('Failed to fetch submissions');
        return response.json();
    },

    // Health Check
    async checkSystem() {
        const response = await fetch(`${API_BASE}/health`);
        return response.json();
    }
};

export default seekReapApi;
