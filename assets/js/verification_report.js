// User Menu Toggle
const userMenuBtn = document.getElementById('userMenuBtn');
const userDropdown = document.getElementById('userDropdown');

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

// Copy badge code functionality
document.querySelectorAll('.fa-copy').forEach(icon => {
    icon.addEventListener('click', function() {
        const code = this.parentElement.innerText.trim();
        navigator.clipboard.writeText(code);
        alert('Badge code copied to clipboard!');
    });
});

// Copy integrity hash
function copyIntegrityHash() {
    const hash = document.querySelector('.integrity-hash span:last-child').innerText;
    navigator.clipboard.writeText(hash);
    alert('Report integrity hash copied to clipboard!');
}

// Load data from session storage if available
window.addEventListener('load', function() {
    const savedResults = sessionStorage.getItem('seekreap_results');
    const submissionId = sessionStorage.getItem('last_submission_id');
    
    if (savedResults) {
        try {
            const data = JSON.parse(savedResults);
            // Update UI with real data
            console.log('Loaded saved results:', data);
        } catch (e) {
            console.error('Error loading saved results:', e);
        }
    }
    
    if (submissionId) {
        // Update verification ID in the UI
        document.querySelectorAll('.detail-value').forEach(el => {
            if (el.innerText.includes('SR-8293FJ2')) {
                el.innerHTML = `${submissionId} <span class="verification-badge"><i class="fas fa-check"></i> Verified</span>`;
            }
        });
    }
});
