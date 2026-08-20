/**
 * notifications.js
 * Enhanced Notification Center for SeekReap
 * Handles filtering, grouping, actions, and UI state
 */

// ─── NOTIFICATION TYPES CONFIGURATION ───────────────────────────────────
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

// ─── STATE ───────────────────────────────────────────────────────────────
let notifications = [];
let currentFilter = 'all';
let displayedCount = 15;
const PAGE_SIZE = 15;

// ─── HELPER FUNCTIONS ───────────────────────────────────────────────────

function getCategory(type) {
    return NOTIFICATION_TYPES[type]?.category || 'system';
}

function getIcon(type) {
    return NOTIFICATION_TYPES[type]?.icon || 'fa-bell';
}

function getIconClass(type) {
    return NOTIFICATION_TYPES[type]?.iconClass || 'system';
}

function getTypeLabel(type) {
    return NOTIFICATION_TYPES[type]?.label || type;
}

function timeAgo(date) {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return minutes + 'm ago';
    if (hours < 24) return hours + 'h ago';
    if (days < 7) return days + 'd ago';
    return new Date(date).toLocaleDateString();
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
    let filtered = [...notifications];
    
    if (currentFilter === 'unread') {
        filtered = filtered.filter(n => !n.read_at);
    } else if (currentFilter === 'rights-assets') {
        filtered = filtered.filter(n => getCategory(n.type) === 'rights-assets');
    } else if (currentFilter === 'collaboration') {
        filtered = filtered.filter(n => getCategory(n.type) === 'collaboration');
    } else if (currentFilter === 'social') {
        filtered = filtered.filter(n => getCategory(n.type) === 'social');
    } else if (currentFilter === 'account') {
        filtered = filtered.filter(n => getCategory(n.type) === 'account');
    } else if (currentFilter === 'system') {
        filtered = filtered.filter(n => getCategory(n.type) === 'system');
    }
    
    return filtered;
}

// ─── RENDER ─────────────────────────────────────────────────────────────

function renderNotifications() {
    const container = document.getElementById('notificationsList');
    if (!container) return;
    
    const filtered = getFilteredNotifications();
    const displayItems = filtered.slice(0, displayedCount);
    
    // Update summary
    const unreadCount = notifications.filter(n => !n.read_at).length;
    const summaryEl = document.getElementById('summaryText');
    const unreadBadge = document.getElementById('unreadFilterBadge');
    const notifBadge = document.getElementById('notifBadge');
    
    if (summaryEl) summaryEl.textContent = `${unreadCount} unread · ${notifications.length} total`;
    if (unreadBadge) unreadBadge.textContent = unreadCount;
    if (notifBadge) notifBadge.textContent = unreadCount;
    
    // Show/hide load more
    const loadMore = document.getElementById('loadMoreContainer');
    if (loadMore) {
        loadMore.style.display = displayedCount >= filtered.length ? 'none' : 'block';
    }
    
    // Empty state
    if (displayItems.length === 0) {
        const isUnreadFilter = currentFilter === 'unread';
        container.innerHTML = `
            <div class="notifications-empty">
                <i class="fas ${isUnreadFilter ? 'fa-check-circle' : 'fa-bell-slash'}"></i>
                <p>${isUnreadFilter ? "You're all caught up!" : 'No notifications yet'}</p>
                <p class="sub">${isUnreadFilter ? 'You have no unread notifications.' : "We'll notify you when something happens."}</p>
            </div>
        `;
        return;
    }
    
    // Group by date
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
                const hasActions = n.action_label && n.action_url;
                const hasActionButtons = n.type === 'agreement_invited' || n.type === 'license_requested';
                
                html += `
                    <div class="notification-item ${isUnread ? 'unread' : ''}" data-id="${n.id}">
                        <div class="icon ${iconClass}">
                            <i class="fas ${icon}"></i>
                        </div>
                        <div class="content">
                            <div class="title">
                                ${typeLabel}
                                ${isUnread ? '<span class="unread-dot"></span>' : ''}
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
                            <button class="menu-btn" onclick="toggleMenu(event, '${n.id}')">
                                <i class="fas fa-ellipsis-v"></i>
                            </button>
                            <div class="menu-dropdown" id="menu-${n.id}">
                                <button onclick="markRead('${n.id}')"><i class="fas fa-check"></i> Mark as read</button>
                                <button onclick="markUnread('${n.id}')"><i class="fas fa-undo"></i> Mark as unread</button>
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

// ─── ACTIONS ─────────────────────────────────────────────────────────────

function setFilter(filter) {
    currentFilter = filter;
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    displayedCount = PAGE_SIZE;
    renderNotifications();
}

function loadMore() {
    const filtered = getFilteredNotifications();
    displayedCount = Math.min(displayedCount + PAGE_SIZE, filtered.length);
    renderNotifications();
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
    if (confirm('Delete this notification?')) {
        notifications = notifications.filter(n => n.id !== notificationId);
        renderNotifications();
        showToast('Notification deleted', 'info');
    }
}

function markAllRead() {
    notifications.forEach(n => {
        n.read_at = new Date().toISOString();
    });
    renderNotifications();
    showToast('All notifications marked as read', 'success');
}

function refreshNotifications() {
    // Simulate refresh by reordering
    notifications = [...notifications].sort(() => Math.random() - 0.5);
    renderNotifications();
    showToast('Refreshed', 'info');
}

function goBack() {
    window.history.back();
}

function toggleMenu(event, notificationId) {
    event.stopPropagation();
    const menu = document.getElementById(`menu-${notificationId}`);
    if (!menu) return;
    
    // Close all other menus
    document.querySelectorAll('.menu-dropdown.open').forEach(m => {
        if (m.id !== `menu-${notificationId}`) m.classList.remove('open');
    });
    menu.classList.toggle('open');
}

function handleAction(notificationId, url, label) {
    // Mark as read before navigating
    const n = notifications.find(x => x.id === notificationId);
    if (n && !n.read_at) {
        n.read_at = new Date().toISOString();
        renderNotifications();
    }
    
    if (label === 'Accept' || label === 'Decline') {
        showToast(`${label}ed successfully!`, 'success');
        // In a real app, this would call an API
    } else if (url) {
        window.location.href = url;
    }
}

// ─── SIDEBAR ─────────────────────────────────────────────────────────────

function toggleMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const hamburger = document.getElementById('hamburgerBtn');
    
    if (sidebar) {
        sidebar.classList.toggle('mobile-open');
        overlay.classList.toggle('active');
        hamburger.classList.toggle('hidden');
    }
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const hamburger = document.getElementById('hamburgerBtn');
    
    if (sidebar) {
        sidebar.classList.remove('mobile-open');
        overlay.classList.remove('active');
        hamburger.classList.remove('hidden');
    }
}

// ─── TOAST ───────────────────────────────────────────────────────────────

function showToast(msg, type) {
    type = type || 'success';
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    const t = document.createElement('div');
    t.className = 'toast';
    const icon = type === 'success' ? 'fa-check-circle' : type === 'info' ? 'fa-info-circle' : 'fa-exclamation-circle';
    const color = type === 'success' ? 'var(--primary)' : type === 'info' ? 'var(--info)' : 'var(--danger)';
    t.innerHTML = '<i class="fas ' + icon + '" style="margin-right:8px;color:' + color + ';"></i> ' + msg;
    document.body.appendChild(t);
    setTimeout(() => {
        t.style.opacity = '0';
        setTimeout(() => { if (t.parentNode) t.remove(); }, 300);
    }, 2800);
}

// ─── CLOSE MENUS ON OUTSIDE CLICK ──────────────────────────────────────

document.addEventListener('click', function(e) {
    document.querySelectorAll('.menu-dropdown.open').forEach(menu => {
        if (!menu.parentElement.contains(e.target)) {
            menu.classList.remove('open');
        }
    });
});

// ─── LOAD NOTIFICATIONS ─────────────────────────────────────────────────

function loadNotifications(notificationsData) {
    notifications = notificationsData || [];
    renderNotifications();
}

// ─── EXPOSE FUNCTIONS ──────────────────────────────────────────────────
window.loadNotifications = loadNotifications;
window.setFilter = setFilter;
window.loadMore = loadMore;
window.markRead = markRead;
window.markUnread = markUnread;
window.deleteNotification = deleteNotification;
window.markAllRead = markAllRead;
window.refreshNotifications = refreshNotifications;
window.handleAction = handleAction;
window.toggleMenu = toggleMenu;
window.toggleMobileSidebar = toggleMobileSidebar;
window.closeSidebar = closeSidebar;
window.goBack = goBack;
window.showToast = showToast;
