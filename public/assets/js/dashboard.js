//==============================================
        //        HEADER & SIDEBAR FUNCTIONALITY
        //==============================================
        (function() {
            'use strict';

            // DOM Elements
            const sideMenu = document.getElementById('side-menu');
            const overlay = document.getElementById('overlay');
            const desktopHamburger = document.getElementById('desktop-menu-open');
            const mobileHamburger = document.getElementById('mobile-menu-open');
            const closeBtn = document.getElementById('menu-close');
            const moreMenuBtn = document.getElementById('more-menu-btn');
            const moreMenuDropdown = document.getElementById('more-menu-dropdown');
            const shareBtn = document.getElementById('share-trigger');
            const userAvatar = document.getElementById('user-avatar');

            // Toggle menu function
            function toggleMenu() {
                const isMobile = window.innerWidth <= 820;
                
                if (sideMenu) {
                    sideMenu.classList.toggle('active');
                    
                    if (isMobile) {
                        if (overlay) overlay.classList.toggle('active');
                        if (mobileHamburger) mobileHamburger.classList.toggle('active');
                        document.body.classList.toggle('menu-open', sideMenu.classList.contains('active'));
                    }
                }
            }

            // Close menu function
            function closeMenu() {
                if (sideMenu) sideMenu.classList.remove('active');
                if (overlay) overlay.classList.remove('active');
                if (mobileHamburger) mobileHamburger.classList.remove('active');
                document.body.classList.remove('menu-open');
            }

            // Share handler
            async function handleShare() {
                const shareData = {
                    title: 'SeekReap - Creator Dashboard',
                    text: 'Check out my content protection dashboard',
                    url: window.location.href
                };

                if (navigator.share) {
                    try {
                        await navigator.share(shareData);
                    } catch (err) {
                        if (err.name !== 'AbortError') {
                            fallbackShare();
                        }
                    }
                } else {
                    fallbackShare();
                }
            }

            // Fallback share (copy link)
            function fallbackShare() {
                const url = window.location.href;
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(url).then(() => {
                        alert('Link copied to clipboard!');
                    });
                } else {
                    alert('Share URL: ' + url);
                }
            }

            // User avatar click - navigate to creator profile
            if (userAvatar) {
                userAvatar.addEventListener('click', function() {
                    window.location.href = '/creator-profile';
                });
            }

            // Event Listeners
            if (desktopHamburger) desktopHamburger.addEventListener('click', toggleMenu);
            if (mobileHamburger) mobileHamburger.addEventListener('click', toggleMenu);
            if (closeBtn) closeBtn.addEventListener('click', closeMenu);
            if (overlay) overlay.addEventListener('click', closeMenu);
            
            if (moreMenuBtn && moreMenuDropdown) {
                moreMenuBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    moreMenuDropdown.classList.toggle('active');
                });
            }
            
            if (shareBtn) {
                shareBtn.addEventListener('click', handleShare);
            }

            // Close more menu on outside click
            document.addEventListener('click', (e) => {
                if (moreMenuBtn && !moreMenuBtn.contains(e.target) && !moreMenuDropdown.contains(e.target)) {
                    moreMenuDropdown.classList.remove('active');
                }
            });

            // Escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && sideMenu && sideMenu.classList.contains('active')) {
                    closeMenu();
                }
            });

            // Responsive adjustments
            function handleResize() {
                const isMobile = window.innerWidth <= 820;
                
                if (mobileHamburger) {
                    mobileHamburger.style.display = isMobile ? 'flex' : 'none';
                }
                
                if (desktopHamburger) {
                    desktopHamburger.style.display = 'none'; // Always hidden on big screens
                }
                
                if (moreMenuBtn) {
                    moreMenuBtn.style.display = 'flex';
                }
                
                // Close menu when switching to desktop
                if (!isMobile && sideMenu && sideMenu.classList.contains('active')) {
                    closeMenu();
                }
            }

            window.addEventListener('resize', handleResize);
            handleResize(); // Initial call
        })();

        //==============================================
        //        DASHBOARD FUNCTIONALITY
        //==============================================
        document.addEventListener('DOMContentLoaded', function() {
            'use strict';

            // Initialize Charts
            initTrendChart();
            initPlatformChart();

            // Modal Handling
            setupModal();

            // Interactive Elements
            setupTabs();
            setupQuickActions();
            setupTableInteractions();

            // Real-time Updates (simulated)
            startSimulatedUpdates();

            // Period Selection
            setupPeriodSelector();

            // =============================================
            //  CHART INITIALIZATIONS
            // =============================================

            function initTrendChart() {
                const ctx = document.getElementById('trendChart')?.getContext('2d');
                if (!ctx) return;

                const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                gradient.addColorStop(0, 'rgba(102, 126, 234, 0.4)');
                gradient.addColorStop(1, 'rgba(102, 126, 234, 0)');

                new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: ['Jan 1', 'Jan 5', 'Jan 9', 'Jan 13', 'Jan 17', 'Jan 21', 'Jan 25', 'Jan 29'],
                        datasets: [
                            {
                                label: 'Detected Infringements',
                                data: [12, 19, 15, 24, 22, 28, 32, 27],
                                borderColor: '#ef4444',
                                backgroundColor: 'transparent',
                                tension: 0.4,
                                pointBackgroundColor: '#ef4444',
                                pointBorderColor: '#fff',
                                pointBorderWidth: 2,
                                pointRadius: 4,
                                pointHoverRadius: 6,
                                borderWidth: 3,
                            },
                            {
                                label: 'Successful Takedowns',
                                data: [8, 12, 10, 18, 16, 22, 24, 21],
                                borderColor: '#10b981',
                                backgroundColor: 'transparent',
                                tension: 0.4,
                                pointBackgroundColor: '#10b981',
                                pointBorderColor: '#fff',
                                pointBorderWidth: 2,
                                pointRadius: 4,
                                pointHoverRadius: 6,
                                borderWidth: 3,
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: true,
                                position: 'top',
                                labels: {
                                    usePointStyle: true,
                                    boxWidth: 6,
                                    font: {
                                        family: 'Inter',
                                        size: 12,
                                        weight: '500'
                                    }
                                }
                            },
                            tooltip: {
                                backgroundColor: 'rgba(17, 24, 39, 0.95)',
                                titleFont: {
                                    family: 'Inter',
                                    size: 13,
                                    weight: '600'
                                },
                                bodyFont: {
                                    family: 'Inter',
                                    size: 12
                                },
                                padding: 12,
                                cornerRadius: 8,
                                displayColors: true,
                                usePointStyle: true,
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                grid: {
                                    color: 'rgba(0, 0, 0, 0.05)',
                                    drawBorder: false
                                },
                                ticks: {
                                    font: {
                                        family: 'Inter',
                                        size: 11
                                    }
                                }
                            },
                            x: {
                                grid: {
                                    display: false
                                },
                                ticks: {
                                    font: {
                                        family: 'Inter',
                                        size: 11
                                    }
                                }
                            }
                        },
                        interaction: {
                            intersect: false,
                            mode: 'index'
                        }
                    }
                });
            }

            function initPlatformChart() {
                const ctx = document.getElementById('platformChart')?.getContext('2d');
                if (!ctx) return;

                new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: ['YouTube', 'TikTok', 'Instagram', 'Facebook', 'Other'],
                        datasets: [{
                            data: [45, 25, 15, 10, 5],
                            backgroundColor: [
                                '#ef4444',
                                '#000000',
                                '#e1306c',
                                '#4267B2',
                                '#9ca3af'
                            ],
                            borderWidth: 0,
                            hoverOffset: 8
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        cutout: '70%',
                        plugins: {
                            legend: {
                                position: 'bottom',
                                labels: {
                                    usePointStyle: true,
                                    boxWidth: 8,
                                    padding: 20,
                                    font: {
                                        family: 'Inter',
                                        size: 12
                                    }
                                }
                            },
                            tooltip: {
                                backgroundColor: 'rgba(17, 24, 39, 0.95)',
                                titleFont: { family: 'Inter', size: 13, weight: '600' },
                                bodyFont: { family: 'Inter', size: 12 },
                                padding: 12,
                                cornerRadius: 8,
                                callbacks: {
                                    label: function(context) {
                                        return `${context.label}: ${context.raw}%`;
                                    }
                                }
                            }
                        }
                    }
                });
            }

            // =============================================
            //  MODAL HANDLING
            // =============================================

            function setupModal() {
                const newScanBtn = document.getElementById('newScanBtn');
                const modal = document.getElementById('newScanModal');
                const closeBtn = modal?.querySelector('.close-modal');
                const cancelBtn = modal?.querySelector('.btn-secondary');

                if (!modal || !newScanBtn) return;

                function openModal() {
                    modal.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }

                function closeModal() {
                    modal.classList.remove('active');
                    document.body.style.overflow = '';
                }

                newScanBtn.addEventListener('click', openModal);
                if (closeBtn) closeBtn.addEventListener('click', closeModal);
                if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

                // Close on outside click
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) closeModal();
                });

                // Close on escape key
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape' && modal.classList.contains('active')) {
                        closeModal();
                    }
                });
            }

            // =============================================
            //  TAB HANDLING
            // =============================================

            function setupTabs() {
                const pills = document.querySelectorAll('.pill');
                
                pills.forEach(pill => {
                    pill.addEventListener('click', function() {
                        const parent = this.parentElement;
                        parent.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
                        this.classList.add('active');
                        
                        // Simulate data update based on period
                        const period = this.dataset.period;
                        updateRevenueData(period);
                    });
                });
            }

            function updateRevenueData(period) {
                const amountElement = document.querySelector('.revenue-total .amount');
                if (!amountElement) return;

                const data = {
                    week: { amount: '-$3,847', class: 'negative' },
                    month: { amount: '-$15,234', class: 'negative' },
                    year: { amount: '-$187,432', class: 'negative' }
                };

                if (data[period]) {
                    amountElement.textContent = data[period].amount;
                    amountElement.className = `amount ${data[period].class}`;
                }
            }

            // =============================================
            //  QUICK ACTIONS
            // =============================================

            function setupQuickActions() {
                const quickActions = document.querySelectorAll('.quick-action');
                
                quickActions.forEach(action => {
                    action.addEventListener('click', function(e) {
                        e.preventDefault();
                        const actionText = this.querySelector('span')?.textContent || 'action';
                        
                        // Show feedback
                        showToast(`Starting ${actionText}...`);
                        
                        // Simulate action based on type
                        if (actionText.includes('Scan')) {
                            document.getElementById('newScanBtn')?.click();
                        } else if (actionText.includes('Analytics')) {
                            alert('Analytics dashboard would open here');
                        }
                    });
                });
            }

            // =============================================
            //  TABLE INTERACTIONS
            // =============================================

            function setupTableInteractions() {
                const actionButtons = document.querySelectorAll('.table-action');
                
                actionButtons.forEach(btn => {
                    btn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        const icon = this.querySelector('i');
                        if (icon) {
                            if (icon.classList.contains('fa-eye')) {
                                showToast('Viewing content details...');
                            } else if (icon.classList.contains('fa-gavel')) {
                                showToast('Opening legal action panel...');
                            } else if (icon.classList.contains('fa-chart-simple')) {
                                showToast('Loading analytics...');
                            }
                        }
                    });
                });

                // Row hover effects
                const rows = document.querySelectorAll('.content-table tbody tr');
                rows.forEach(row => {
                    row.addEventListener('click', function() {
                        const title = this.querySelector('.title-cell')?.textContent.trim() || 'item';
                        showToast(`Viewing details for "${title}"`);
                    });
                });
            }

            // =============================================
            //  SIMULATED REAL-TIME UPDATES
            // =============================================

            function startSimulatedUpdates() {
                // Simulate new detection every 30 seconds
                setInterval(() => {
                    const detectionList = document.querySelector('.detection-list');
                    if (!detectionList || Math.random() > 0.3) return;

                    const newDetection = createMockDetection();
                    addDetectionToList(detectionList, newDetection);
                    showToast('🔔 New infringement detected!', 5000);
                    updateKPIValues();
                }, 30000);
            }

            function createMockDetection() {
                const platforms = [
                    { icon: 'fab fa-youtube', name: 'YouTube', color: '#ef4444' },
                    { icon: 'fab fa-tiktok', name: 'TikTok', color: '#000000' },
                    { icon: 'fab fa-instagram', name: 'Instagram', color: '#e1306c' }
                ];
                
                const risks = ['high', 'medium', 'low'];
                const platform = platforms[Math.floor(Math.random() * platforms.length)];
                const risk = risks[Math.floor(Math.random() * risks.length)];
                
                return {
                    platform,
                    risk,
                    title: `Content Detection ${Math.floor(Math.random() * 1000)}`,
                    user: `user_${Math.floor(Math.random() * 1000)}`,
                    views: `${Math.floor(Math.random() * 100)}K`,
                    time: 'just now'
                };
            }

            function addDetectionToList(list, detection) {
                const item = document.createElement('div');
                item.className = `detection-item ${detection.risk}-risk`;
                item.innerHTML = `
                    <div class="detection-icon">
                        <i class="${detection.platform.icon}" style="color: ${detection.platform.color}"></i>
                    </div>
                    <div class="detection-content">
                        <div class="detection-header">
                            <span class="detection-title">${detection.title}</span>
                            <span class="risk-badge ${detection.risk}">${detection.risk.toUpperCase()} Risk</span>
                        </div>
                        <div class="detection-meta">
                            <span><i class="fas fa-user"></i> ${detection.user}</span>
                            <span><i class="fas fa-eye"></i> ${detection.views} views</span>
                            <span><i class="fas fa-clock"></i> ${detection.time}</span>
                        </div>
                    </div>
                    <button class="action-icon"><i class="fas fa-gavel"></i></button>
                `;
                
                // Add to top of list
                list.insertBefore(item, list.firstChild);
                
                // Remove oldest if more than 5 items
                if (list.children.length > 5) {
                    list.removeChild(list.lastChild);
                }
                
                // Add click handler for new action button
                item.querySelector('.action-icon').addEventListener('click', (e) => {
                    e.stopPropagation();
                    showToast('Opening legal action panel...');
                });
            }

            function updateKPIValues() {
                const kpiValues = document.querySelectorAll('.kpi-value');
                if (kpiValues.length < 4) return;
                
                // Simulate small changes
                const infringements = parseInt(kpiValues[1].textContent) + 1;
                kpiValues[1].textContent = infringements;
                
                // Update trend indicators
                const trends = document.querySelectorAll('.kpi-trend');
                if (trends.length > 1) {
                    trends[1].innerHTML = '<i class="fas fa-arrow-up"></i> +2%';
                    trends[1].className = 'kpi-trend negative';
                }
            }

            // =============================================
            //  PERIOD SELECTOR
            // =============================================

            function setupPeriodSelector() {
                const selector = document.getElementById('trendPeriod');
                if (!selector) return;
                
                selector.addEventListener('change', function() {
                    const period = this.value;
                    showToast(`Loading data for last ${period} days...`);
                    
                    // Simulate data loading
                    setTimeout(() => {
                        showToast(`Data updated for last ${period} days`);
                    }, 1000);
                });
            }

            // =============================================
            //  TOAST NOTIFICATIONS
            // =============================================

            function showToast(message, duration = 3000) {
                const toast = document.createElement('div');
                toast.className = 'toast-notification';
                toast.textContent = message;

                document.body.appendChild(toast);

                setTimeout(() => {
                    toast.style.animation = 'fadeOut 0.3s ease';
                    setTimeout(() => {
                        toast.remove();
                    }, 300);
                }, duration);
            }

            // =============================================
            //  EXPORT FUNCTIONALITY
            // =============================================

            document.querySelector('.export-btn')?.addEventListener('click', function() {
                showToast('Preparing CSV export...');
                setTimeout(() => {
                    showToast('✅ CSV file ready');
                }, 1500);
            });

            // =============================================
            //  FILTER FUNCTIONALITY
            // =============================================

            document.querySelector('.filter-btn')?.addEventListener('click', function() {
                showToast('Opening filter panel...');
            });

            // =============================================
            //  SEARCH FUNCTIONALITY
            // =============================================

            document.querySelector('.search-box input')?.addEventListener('input', function(e) {
                const searchTerm = e.target.value.toLowerCase();
                const rows = document.querySelectorAll('.content-table tbody tr');
                
                rows.forEach(row => {
                    const text = row.textContent.toLowerCase();
                    row.style.display = text.includes(searchTerm) ? '' : 'none';
                });
                
                if (searchTerm.length > 2) {
                    showToast(`Filtered by "${searchTerm}"`);
                }
            });
        });

// ==============================================
//   LIVE DATA — Firebase Auth → Tier-6 Backend
// ==============================================
(function() {
    'use strict';

    const BACKEND_URL = (typeof API_CONFIG !== 'undefined' && API_CONFIG.BASE_URL)
        ? API_CONFIG.BASE_URL
        : 'https://seekreap-backend-tif2gmgi4q-uc.a.run.app';

    function riskClass(level) {
        if (!level) return 'low';
        const l = level.toLowerCase();
        if (l === 'high')   return 'high';
        if (l === 'medium') return 'medium';
        return 'low';
    }

    function formatDate(iso) {
        if (!iso) return '—';
        const d = new Date(iso);
        const now = new Date();
        const diff = Math.floor((now - d) / 1000);
        if (diff < 60)    return 'just now';
        if (diff < 3600)  return `${Math.floor(diff/60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    function scoreBar(score) {
        if (score === null || score === undefined) return '';
        const pct   = Math.round(score);
        const color = pct >= 70 ? '#ef4444' : pct >= 35 ? '#f59e0b' : '#10b981';
        return `<div style="display:flex;align-items:center;gap:6px;min-width:80px;">
            <div style="flex:1;height:4px;background:#f0f0f0;border-radius:2px;">
                <div style="width:${pct}%;height:100%;background:${color};border-radius:2px;"></div>
            </div>
            <span style="font-size:11px;font-weight:600;color:${color};">${pct}</span>
        </div>`;
    }

    function renderDetectionList(submissions) {
        const list = document.querySelector('.detection-list');
        if (!list) return;
        if (!submissions || submissions.length === 0) {
            list.innerHTML = `<div style="padding:24px;text-align:center;color:#9ca3af;font-size:13px;">
                No submissions yet. <a href="verification_portal.html" style="color:#667eea;">Run your first scan →</a>
            </div>`;
            return;
        }
        list.innerHTML = submissions.slice(0, 5).map(s => {
            const rc      = riskClass(s.risk_level);
            const title   = s.title || s.content_url || 'Untitled';
            const channel = s.channel || '';
            const date    = formatDate(s.submitted_at);
            const badge   = s.status === 'COMPLETED' ? (s.risk_level || 'Done') : s.status;
            return `<div class="detection-item ${rc}-risk" style="cursor:pointer;"
                        onclick="window.location.href='verification_report.html?id=${s.id}'">
                <div class="detection-icon">
                    <i class="fab fa-youtube" style="color:#ef4444;"></i>
                </div>
                <div class="detection-content" style="flex:1;min-width:0;">
                    <div class="detection-header">
                        <span class="detection-title"
                            style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:180px;"
                            title="${title}">${title}</span>
                        <span class="risk-badge ${rc}">${badge}</span>
                    </div>
                    <div class="detection-meta">
                        ${channel ? `<span><i class="fas fa-user"></i> ${channel}</span>` : ''}
                        <span><i class="fas fa-clock"></i> ${date}</span>
                        ${s.overall_risk_score !== null ? scoreBar(s.overall_risk_score) : ''}
                    </div>
                </div>
                <a href="verification_report.html?id=${s.id}"
                   class="action-icon" title="View Report" onclick="event.stopPropagation()">
                    <i class="fas fa-eye"></i>
                </a>
            </div>`;
        }).join('');
    }

    function updateKPIs(submissions) {
        const kpiValues = document.querySelectorAll('.kpi-value');
        const kpiLabels = document.querySelectorAll('.kpi-label');
        if (kpiValues.length < 4) return;
        const total     = submissions.length;
        const highRisk  = submissions.filter(s => (s.risk_level||'').toLowerCase() === 'high').length;
        const completed = submissions.filter(s => s.status === 'COMPLETED').length;
        const pending   = submissions.filter(s => s.status !== 'COMPLETED').length;
        kpiValues[0].textContent = total;
        kpiValues[1].textContent = highRisk;
        kpiValues[2].textContent = completed;
        kpiValues[3].textContent = pending;
        if (kpiLabels.length >= 4) {
            kpiLabels[0].textContent = 'Total Scans';
            kpiLabels[1].textContent = 'High Risk';
            kpiLabels[2].textContent = 'Completed';
            kpiLabels[3].textContent = 'Pending';
        }
    }

    function updateCreatorUI(profile) {
        const displayName = profile.name || profile.email.split('@')[0] || 'Creator';
        const initials    = displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) || 'CR';
        document.querySelectorAll('.creator-name').forEach(el => el.textContent = displayName);
        document.querySelectorAll('#user-avatar, .side-menu-avatar').forEach(el => el.textContent = initials);
        const sidebarName = document.querySelector('.side-menu-user-info h4');
        const sidebarMeta = document.querySelector('.side-menu-user-info p');
        if (sidebarName) sidebarName.textContent = displayName;
        if (sidebarMeta) sidebarMeta.textContent = `${profile.email} • ${profile.subscription_tier} tier`;
        const subtitle = document.querySelector('.welcome-subtitle');
        if (subtitle) subtitle.textContent =
            `${profile.credits_remaining} scan credits remaining • ${profile.subscription_tier} plan`;
        document.querySelectorAll('.tier-indicator span:first-of-type').forEach(el => {
            el.textContent = profile.subscription_tier.charAt(0).toUpperCase() + profile.subscription_tier.slice(1);
        });
    }

    async function loadDashboardData(uid) {
        const headers = { 'X-Creator-ID': uid };
        try {
            const [pRes, sRes] = await Promise.all([
                fetch(`${BACKEND_URL}/api/creator/profile`, { headers }),
                fetch(`${BACKEND_URL}/api/submissions`,     { headers }),
            ]);
            if (pRes.ok)  updateCreatorUI(await pRes.json());
            if (sRes.ok) {
                const data = await sRes.json();
                renderDetectionList(data.submissions || []);
                updateKPIs(data.submissions || []);
            }
        } catch (err) {
            console.warn('Dashboard live data failed:', err);
        }
    }

    function initLiveData() {
        let attempts = 0;
        const iv = setInterval(() => {
            attempts++;
            if (typeof firebase !== 'undefined' && firebase.auth) {
                clearInterval(iv);
                firebase.auth().onAuthStateChanged(user => {
                    if (user) {
                        loadDashboardData(user.uid);
                    } else {
                        window.location.href = 'signup_signin.html';
                    }
                });
            } else if (attempts > 50) {
                clearInterval(iv);
                console.warn('Firebase not ready on dashboard');
            }
        }, 100);
    }

    document.addEventListener('DOMContentLoaded', initLiveData);
})();
