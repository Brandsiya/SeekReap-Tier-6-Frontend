// Dynamic status updates - matching home page sophistication
        const statusMessages = [
            { text: "Initializing Protection Engine...", progress: 0 },
            { text: "Loading Fingerprint Database...", progress: 15 },
            { text: "Establishing Secure Connection...", progress: 30 },
            { text: "Loading AI Detection Models...", progress: 50 },
            { text: "Scanning For Content Matches...", progress: 70 },
            { text: "Preparing Infrastructre...", progress: 85 },
            { text: "Almost Ready...", progress: 95 },
            { text: "Redirecting To Home...", progress: 100 }
        ];
        
        let currentIndex = 0;
        const statusElement = document.getElementById('status');
        const progressBar = document.querySelector('.progress');
        
        function updateStatus() {
            if (currentIndex < statusMessages.length) {
                const msg = statusMessages[currentIndex];
                statusElement.textContent = msg.text;
                
                // Update progress bar width with smooth transition
                if (progressBar) {
                    progressBar.style.width = msg.progress + '%';
                }
                
                currentIndex++;
                
                // Vary timing for more natural feel
                let delay = 800;
                if (msg.progress >= 85) delay = 600;
                if (msg.progress >= 95) delay = 400;
                if (msg.progress === 100) delay = 200;
                
                setTimeout(updateStatus, delay);
            } else {
                // Redirect to dashboard after loader completes
                setTimeout(() => {
                    window.location.href = 'home.html';
                }, 300);
            }
        }
        
        // Start the loader sequence
        setTimeout(updateStatus, 500);
        
        // Optional: Add a fallback in case the loader gets stuck
        setTimeout(() => {
            if (currentIndex < statusMessages.length) {
                console.warn('Loader taking too long, forcing redirect');
                window.location.href = 'home.html';
            }
        }, 10000);
