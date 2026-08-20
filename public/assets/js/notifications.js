// ─── SIMULATED NOTIFICATIONS DATABASE ──────────────────────────────────────
const NOTIFICATION_TYPES = {
    trust_received: { category: 'social', icon: 'fa-handshake', iconClass: 'trust', label: 'New Trust' },
    profile_share: { category: 'social', icon: 'fa-share-alt', iconClass: 'share', label: 'Profile Shared' },
    certificate_issued: { category: 'rights-assets', icon: 'fa-certificate', iconClass: 'certificate', label: 'Certificate Issued' },
    certificate_revoked: { category: 'rights-assets', icon: 'fa-certificate', iconClass: 'certificate', label: 'Certificate Revoked' },
    agreement_invited: { category: 'collaboration', icon: 'fa-file-signature', iconClass: 'agreement', label: 'Co-ownership Invitation' },
    agreement_signed: { category: 'collaboration', icon: 'fa-file-signature', iconClass: 'agreement', label: 'Agreement Signed' },
    agreement_declined: { category: 'collaboration', icon: 'fa-file-signature', iconClass: 'agreement', label: 'Agreement Declined' },
    license_requested: { category: 'rights-assets', icon: 'fa-file-contract', iconClass: 'license', label: 'License Request' },
    license_approved: { category: 'rights-assets', icon: 'fa-check', iconClass: 'license', label: 'License Approved' },
    license_rejected: { category: 'rights-assets', icon: 'fa-times', iconClass: 'license', label: 'License Rejected' },
    collaboration_invited: { category: 'collaboration', icon: 'fa-users', iconClass: 'collaboration', label: 'Collaboration Invitation' },
    collaboration_accepted: { category: 'collaboration', icon: 'fa-users', iconClass: 'collaboration', label: 'Collaboration Accepted' },
    follow_received: { category: 'social', icon: 'fa-user-plus', iconClass: 'follow', label: 'New Follower' },
    comment_received: { category: 'social', icon: 'fa-comment', iconClass: 'comment', label: 'New Comment' },
    plan_upgraded: { category: 'account', icon: 'fa-crown', iconClass: 'plan', label: 'Plan Upgraded' },
    plan_downgraded: { category: 'account', icon: 'fa-crown', iconClass: 'plan', label: 'Plan Downgraded' },
    payment_success: { category: 'account', icon: 'fa-check-circle', iconClass: 'payment', label: 'Payment Successful' },
    payment_failed: { category: 'account', icon: 'fa-exclamation-circle', iconClass: 'payment', label: 'Payment Failed' },
    system_announcement: { category: 'system', icon: 'fa-bullhorn', iconClass: 'system', label: 'Announcement' },
    security_alert: { category: 'system', icon: 'fa-shield-alt', iconClass: 'system', label: 'Security Alert' }
};

const SIMULATED_NOTIFICATIONS = [
    {
        id: '1',
        type: 'trust_received',
        title: 'New Trust',
        message: 'Luna Ray trusted you!',
        action_label: 'View Profile',
        action_url: '/profile/lunaray',
        actor_id: 'lunaray-id',
        entity_type: 'profile',
        entity_id: 'lunaray-id',
        read_at: null,
        created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString()
    },
    {
        id: '2',
        type: 'certificate_issued',
        title: 'Certificate Issued',
        message: '"Nova Dawn" has been certified. Certificate ID: SR-CERT-2026-001',
        action_label: 'View Certificate',
        action_url: '/certificates/SR-CERT-2026-001',
        entity_type: 'certificate',
        entity_id: 'SR-CERT-2026-001',
        read_at: null,
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString()
    },
    {
        id: '3',
        type: 'agreement_invited',
        title: 'Co-ownership Invitation',
        message: 'Kai Sterling invited you to co-own "Digital Horizon"',
        action_label: 'Review',
        action_url: '/agreements/invite/123',
        entity_type: 'agreement',
        entity_id: '123',
        read_at: null,
        created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString()
    },
    {
        id: '4',
        type: 'plan_upgraded',
        title: 'Plan Upgraded',
        message: 'Your plan has been upgraded to Studio. New certifications will receive High priority processing.',
        action_label: 'View Billing',
        action_url: '/billing',
        read_at: null,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
    },
    {
        id: '5',
        type: 'payment_success',
        title: 'Payment Successful',
        message: 'Your payment of R299.99 for Studio plan has been processed.',
        action_label: 'View Billing',
        action_url: '/billing',
        read_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString()
    },
    {
        id: '6',
        type: 'follow_received',
        title: 'New Follower',
        message: 'Maya Nova started following you!',
        action_label: 'View Profile',
        action_url: '/profile/mayanova',
        read_at: null,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString()
    },
    {
        id: '7',
        type: 'comment_received',
        title: 'New Comment',
        message: 'Eli Stone commented on your work "Electronic Explorations": "This is incredible!"',
        action_label: 'View Work',
        action_url: '/works/electronic-explorations',
        read_at: null,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString()
    },
    {
        id: '8',
        type: 'license_requested',
        title: 'License Request',
        message: 'Zara Blake requested a license for "Amapiano Sunset Horizon"',
        action_label: 'Review Request',
        action_url: '/licenses/requests/456',
        read_at: null,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString()
    },
    {
        id: '9',
        type: 'system_announcement',
        title: 'New Feature: Similar Creators',
        message: 'Discover creators who share your creative style with Similar Creators.',
        action_label: 'Learn More',
        action_url: '/discover',
        read_at: null,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
    },
    {
        id: '10',
        type: 'trust_received',
        title: 'New Trust',
        message: 'Marcus Cole trusted you!',
        action_label: 'View Profile',
        action_url: '/profile/marcuscole',
        read_at: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(),
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString()
    },
    {
        id: '11',
        type: 'collaboration_invited',
        title: 'Collaboration Invitation',
        message: 'Sofia Chen invited you to collaborate on a new project.',
        action_label: 'View Invitation',
        action_url: '/collaborations/invite/202',
        read_at: null,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString()
    },
    {
        id: '12',
        type: 'profile_share',
        title: 'Profile Shared',
        message: 'Your profile was shared 3 times today!',
        action_label: 'View Profile',
        action_url: '/profile/me',
        read_at: null,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString()
    },
    {
        id: '13',
        type: 'agreement_signed',
        title: 'Agreement Signed',
        message: 'Luna Ray has signed the co-ownership agreement for "Nova Dawn"',
        action_label: 'View Agreement',
        action_url: '/agreements/789',
        read_at: new Date(Date.now() - 1000 * 60 * 60 * 40).toISOString(),
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 40).toISOString()
    },
    {
        id: '14',
        type: 'payment_failed',
        title: 'Payment Failed',
        message: 'Your payment could not be processed. Please update your payment method.',
        action_label: 'Update Payment',
        action_url: '/billing',
        read_at: null,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
    },
    {
        id: '15',
        type: 'license_approved',
        title: 'License Approved',
        message: 'Your license request for "Cape Coast Low-Fi Ambience" has been approved.',
        action_label: 'View License',
        action_url: '/licenses/approved/101',
        read_at: null,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 60).toISOString()
    },
    {
        id: '16',
        type: 'plan_downgraded',
        title: 'Plan Downgraded',
        message: 'Your plan has been downgraded to Free. Upgrade to continue enjoying premium features.',
        action_label: 'View Plans',
        action_url: '/billing',
        read_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString()
    },
    {
        id: '17',
        type: 'trust_received',
        title: 'New Trust',
        message: 'Nina Simone trusted you!',
        action_label: 'View Profile',
        action_url: '/profile/ninasimone',
        read_at: null,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 84).toISOString()
    },
    {
        id: '18',
        type: 'system_announcement',
        title: 'Platform Update',
        message: 'We\'ve updated our terms of service. Please review the changes.',
        action_label: 'Review',
        action_url: '/legal/terms',
        read_at: null,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString()
    },
    {
        id: '19',
        type: 'certificate_issued',
        title: 'Certificate Issued',
        message: '"Urban Poly-Rhythm Drive" has been certified.',
        action_label: 'View Certificate',
        action_url: '/certificates/SR-CERT-2026-002',
        read_at: null,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 108).toISOString()
    },
    {
        id: '20',
        type: 'collaboration_accepted',
        title: 'Collaboration Accepted',
        message: 'James Park accepted your collaboration invitation.',
        action_label: 'View Project',
        action_url: '/collaborations/project/303',
        read_at: null,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString()
    }
];

// ─── STATE MANAGEMENT ──────────────────────────────────────────────────────
let currentFilter = 'all';
let searchQuery = '';
let notifications = [...SIMULATED_NOTIFICATIONS];
let selectedIds = new Set();
let displayedCount = 15;
const PAGE_SIZE = 15;

// ─── UTILITIES ─────────────────────────────────────────────────────────────
function getCategory(type) { return NOTIFICATION_TYPES[type]?.category || 'system'; }
function getIcon(type) { return NOTIFICATION_TYPES[type]?.icon || 'fa-bell'; }
function getIconClass(type) { return NOTIFICATION_TYPES[type]?.iconClass || 'system'; }
function getTypeLabel(type) { return NOTIFICATION_TYPES[type]?.label || type; }

function timeAgo(date) {
    const diff = new Date() - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return minutes + 'm ago';
    if (hours < 24) return hours + 'h ago';
    if (days < 7) return days + 'd ago';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getGroupKey(date) {
    const now = new Date();
    const then = new Date(date);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (then >= today) return 'Today';
    if (then >= yesterday) return 'Yesterday';
    return 'Earlier';
}

function getFilteredNotifications() {
    return notifications.filter(n => {
        const matchesFilter = (currentFilter === 'all') ? true :
            (currentFilter === 'unread') ? !n.read_at :
            getCategory(n.type) === currentFilter;

        const matchesSearch = searchQuery === '' || 
            n.message.toLowerCase().includes(searchQuery) ||
            getTypeLabel(n.type).toLowerCase().includes(searchQuery);

        return matchesFilter && matchesSearch;
    });
}

// ─── RENDER ENGINE ─────────────────────────────────────────────────────────
function renderNotifications() {
    const container = document.getElementById('notificationsList');
    const filtered = getFilteredNotifications();
    const displayItems = filtered.slice(0, displayedCount);
    
    // Update summary counts
    const unreadCount = notifications.filter(n => !n.read_at).length;
    document.getElementById('summaryText').textContent = `${unreadCount} unread · ${notifications.length} total`;
    document.getElementById('unreadFilterBadge').textContent = unreadCount;
    document.getElementById('notifBadge').textContent = unreadCount;
    
    // Load More visibility
    const loadMore = document.getElementById('loadMoreContainer');
    loadMore.style.display = (displayedCount >= filtered.length) ? 'none' : 'block';
    
    // Batch bar update
    const batchBar = document.getElementById('batchBar');
    if (selectedIds.size > 0) {
        batchBar.style.display = 'flex';
        document.getElementById('selectedCountText').textContent = `${selectedIds.size} selected`;
        document.getElementById('selectAllCheckbox').checked = (selectedIds.size === displayItems.length && displayItems.length > 0);
    } else {
        batchBar.style.display = 'none';
    }

    if (displayItems.length === 0) {
        const isUnreadFilter = currentFilter === 'unread';
        container.innerHTML = `
            <div class="notifications-empty">
                <i class="fas ${searchQuery ? 'fa-search' : isUnreadFilter ? 'fa-check-circle' : 'fa-bell-slash'}"></i>
                <p>${searchQuery ? 'No matching notifications found' : isUnreadFilter ? 'You\'re all caught up!' : 'No notifications yet'}</p>
                <div class="sub">${searchQuery ? 'Try searching with a different key phrase.' : isUnreadFilter ? 'You have cleared all unread alerts.' : 'We\'ll alert you when important activity occurs.'}</div>
            </div>
        `;
        return;
    }
    
    // Group items by date
    const groups = {};
    displayItems.forEach(n => {
        const key = getGroupKey(n.created_at);
        if (!groups[key]) groups[key] = [];
        groups[key].push(n);
    });
    
    const groupOrder = ['Today', 'Yesterday', 'Earlier'];
    let html = '';
    
    groupOrder.forEach(group => {
        if (groups[group]) {
            html += `<div class="notification-group">
                <div class="group-header">${group}</div>`;
            
            groups[group].forEach(n => {
                const isUnread = !n.read_at;
                const iconClass = getIconClass(n.type);
                const icon = getIcon(n.type);
                const typeLabel = getTypeLabel(n.type);
                const category = getCategory(n.type);
                const isChecked = selectedIds.has(n.id);
                const hasActions = n.action_label && n.action_url;
                const hasActionButtons = n.type === 'agreement_invited' || n.type === 'license_requested';
                
                html += `
                    <div class="notification-item ${isUnread ? 'unread' : ''}" data-id="${n.id}">
                        <input type="checkbox" class="notification-select" ${isChecked ? 'checked' : ''} onchange="toggleSelect('${n.id}', this.checked)" />
                        
                        <div class="icon ${iconClass}">
                            <i class="fas ${icon}"></i>
                        </div>
                        
                        <div class="content">
                            <div class="title-row">
                                <div class="title">
                                    ${typeLabel}
                                </div>
                                <span class="cat-tag">${category.replace('-', ' ')}</span>
                            </div>
                            <div class="message">${n.message}</div>
                            <div class="time"><i class="far fa-clock"></i> ${timeAgo(n.created_at)}</div>
                            
                            ${hasActions ? `<div class="actions">
                                <button class="btn-action primary" onclick="handleAction('${n.id}', '${n.action_url}', '${n.action_label}')">
                                    ${n.action_label || 'View'}
                                </button>
                                ${hasActionButtons ? `
                                    <button class="btn-action success" onclick="handleAction('${n.id}', '${n.action_url}', 'Accept')">Accept</button>
                                    <button class="btn-action danger" onclick="handleAction('${n.id}', '${n.action_url}', 'Decline')">Decline</button>
                                ` : ''}
                            </div>` : ''}
                        </div>
                        
                        <div class="menu-wrapper">
                            <button class="menu-btn" onclick="toggleMenu(event, '${n.id}')" title="Actions">
                                <i class="fas fa-ellipsis-v"></i>
                            </button>
                            <div class="menu-dropdown" id="menu-${n.id}">
                                ${isUnread ? 
                                    `<button onclick="markRead('${n.id}')"><i class="fas fa-check"></i> Mark as read</button>` :
                                    `<button onclick="markUnread('${n.id}')"><i class="fas fa-undo"></i> Mark as unread</button>`
                                }
                                <button class="danger" onclick="deleteNotification('${n.id}')"><i class="fas fa-trash"></i> Delete</button>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            html += `</div>`;
        }
    });
    
    container.innerHTML = html;
}

// ─── HANDLERS & ACTIONS ────────────────────────────────────────────────────
function setFilter(filter) {
    currentFilter = filter;
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    displayedCount = PAGE_SIZE;
    renderNotifications();
}

function handleSearch(val) {
    searchQuery = val.trim().toLowerCase();
    renderNotifications();
}

function loadMore() {
    displayedCount += PAGE_SIZE;
    renderNotifications();
}

function toggleSelect(id, checked) {
    if (checked) selectedIds.add(id);
    else selectedIds.delete(id);
    renderNotifications();
}

function toggleSelectAll(checked) {
    const filtered = getFilteredNotifications().slice(0, displayedCount);
    if (checked) {
        filtered.forEach(n => selectedIds.add(n.id));
    } else {
        selectedIds.clear();
    }
    renderNotifications();
}

function markSelectedRead() {
    notifications.forEach(n => {
        if (selectedIds.has(n.id)) n.read_at = new Date().toISOString();
    });
    selectedIds.clear();
    renderNotifications();
    showToast('Selected notifications marked as read', 'success');
}

function deleteSelected() {
    if (confirm('Delete selected notifications?')) {
        notifications = notifications.filter(n => !selectedIds.has(n.id));
        selectedIds.clear();
        renderNotifications();
        showToast('Selected notifications removed', 'info');
    }
}

function markRead(notificationId) {
    const n = notifications.find(x => x.id === notificationId);
    if (n) {
        n.read_at = new Date().toISOString();
        renderNotifications();
        showToast('Marked as read', 'success');
    }
}

function markUnread(notificationId) {
    const n = notifications.find(x => x.id === notificationId);
    if (n) {
        n.read_at = null;
        renderNotifications();
        showToast('Marked as unread', 'info');
    }
}

function deleteNotification(notificationId) {
    notifications = notifications.filter(n => n.id !== notificationId);
    selectedIds.delete(notificationId);
    renderNotifications();
    showToast('Notification deleted', 'info');
}

function markAllRead() {
    notifications.forEach(n => n.read_at = new Date().toISOString());
    renderNotifications();
    showToast('All notifications marked as read', 'success');
}

function refreshNotifications() {
    notifications = [...notifications].sort(() => Math.random() - 0.5);
    renderNotifications();
    showToast('Notifications synchronized', 'info');
}

function goBack() {
    if (document.referrer) window.history.back();
    else window.location.href = '/dashboard.html';
}

function toggleMenu(event, notificationId) {
    event.stopPropagation();
    const menu = document.getElementById(`menu-${notificationId}`);
    document.querySelectorAll('.menu-dropdown.open').forEach(m => {
        if (m.id !== `menu-${notificationId}`) m.classList.remove('open');
    });
    menu.classList.toggle('open');
}

function handleAction(notificationId, url, label) {
    const n = notifications.find(x => x.id === notificationId);
    if (n && !n.read_at) n.read_at = new Date().toISOString();
    
    if (label === 'Accept' || label === 'Decline') {
        showToast(`Request ${label.toLowerCase()}ed successfully`, 'success');
        renderNotifications();
    } else if (url) {
        window.location.href = url;
    }
}

// ─── SIDEBAR TOGGLES ────────────────────────────────────────────────────────
function toggleMobileSidebar() {
    document.getElementById('sidebar').classList.toggle('mobile-open');
    document.getElementById('sidebarOverlay').classList.toggle('active');
}

function closeSidebar() {
    document.getElementById('sidebar').classList.remove('mobile-open');
    document.getElementById('sidebarOverlay').classList.remove('active');
}

// ─── PREFERENCES MODAL ─────────────────────────────────────────────────────
function openPreferences() { document.getElementById('prefModal').classList.add('active'); }
function closePreferences() { document.getElementById('prefModal').classList.remove('active'); }

// ─── TOAST NOTIFICATION ────────────────────────────────────────────────────
function showToast(msg, type = 'success') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    
    const t = document.createElement('div');
    t.className = 'toast';
    const icon = type === 'success' ? 'fa-check-circle' : type === 'info' ? 'fa-info-circle' : 'fa-exclamation-circle';
    const color = type === 'success' ? 'var(--primary)' : type === 'info' ? 'var(--info)' : 'var(--danger)';
    
    t.innerHTML = `<i class="fas ${icon}" style="color:${color}; font-size:16px;"></i> <span>${msg}</span>`;
    document.body.appendChild(t);
    
    setTimeout(() => {
        t.style.opacity = '0';
        t.style.transform = 'translateY(10px)';
        t.style.transition = 'all 0.2s ease';
        setTimeout(() => { if (t.parentNode) t.remove(); }, 200);
    }, 2800);
}

// ─── GLOBAL EVENT LISTENERS ────────────────────────────────────────────────
document.addEventListener('click', function(e) {
    document.querySelectorAll('.menu-dropdown.open').forEach(menu => {
        if (!menu.parentElement.contains(e.target)) menu.classList.remove('open');
    });
});

document.addEventListener('DOMContentLoaded', function() {
    renderNotifications();
});
