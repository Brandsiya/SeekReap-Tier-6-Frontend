// ─── STATE ──────────────────────────────────────────────────────────────────
let appreciateState = 'appreciate';

var REQUEST_TO_ACTION_KEY = {
    'Book Creator': 'Booking Approval',
    'Endorse Creator': 'Endorsement Proposal Approval',
    'Request License': 'License Request Approval',
    'Request Collaboration': 'Collaboration Request Approval',
    'Request Interview': 'Interview Request Approval',
    'Request Feature': 'Feature Proposal Approval',
    'Request Creator Service': 'Service Request Approval',
    'Offer Creator Employment': 'Employment Offer Acceptance'
};
var sentActionKeys = new Set();
let trustState = 'trust';
let isAppreciateDropdownOpen = false;
let isRequestDropdownOpen = false;
let isAccountDropdownOpen = false;
let appreciationTimeout = null;
let trustTimeout = null;

// ─── ACCOUNT SWITCHER ──────────────────────────────────────────────────────
function toggleAccountDropdown(event, menuId) {
    if (event) event.stopPropagation();
    menuId = menuId || 'accountDropdownMenu';
    const menu = document.getElementById(menuId);
    if (!menu) return;
    isAccountDropdownOpen = !isAccountDropdownOpen;
    menu.classList.toggle('open', isAccountDropdownOpen);
}

function switchAccount(index) {
    const accounts = [
        { name: 'NovaKai', email: 'nova@seekreap.io', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop' },
        { name: 'Kai Sterling', email: 'kai@seekreap.io', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop' },
        { name: 'Luna Ray', email: 'luna@seekreap.io', avatar: 'https://images.unsplash.com/photo-1494790108376-be9c24b9cf6c?q=80&w=100&auto=format&fit=crop' },
        { name: 'Eli Stone', email: 'eli@seekreap.io', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100&auto=format&fit=crop' }
    ];

    const account = accounts[index];
    if (!account) return;

    // Update the header profile photo (desktop + mobile)
    const desktopPhoto = document.getElementById('desktopHeaderProfilePhoto');
    const mobilePhoto = document.getElementById('mobileHeaderProfilePhoto');
    if (desktopPhoto) desktopPhoto.querySelector('img').src = account.avatar;
    if (mobilePhoto) mobilePhoto.querySelector('img').src = account.avatar;

    document.querySelectorAll('.account-menu-item').forEach((item, i) => {
        item.classList.toggle('active', i === index);
        const check = item.querySelector('.account-check');
        if (check) check.style.display = i === index ? 'inline-block' : 'none';
    });

    document.getElementById('profileDisplayName').innerHTML = account.name;
    document.getElementById('profileArtisticName').textContent = account.name;
    document.getElementById('profileAvatar').querySelector('img').src = account.avatar;

    document.getElementById('sideName').textContent = account.name;
    document.getElementById('sideAvatar').textContent = account.name.charAt(0);

    document.querySelectorAll('.account-dropdown-menu').forEach(function(menu) {
        menu.classList.remove('open');
    });
    isAccountDropdownOpen = false;

    showToast(`Switched to ${account.name}`, 'success');
}

// ─── SIDEBAR TOGGLE ────────────────────────────────────────────────────────
function toggleMobileSidebar() {
    var sidebar = document.getElementById('sidebar');
    var overlay = document.getElementById('sidebarOverlay');
    var hamburger = document.getElementById('hamburgerBtn');

    sidebar.classList.toggle('mobile-open');
    overlay.classList.toggle('active');

    if (sidebar.classList.contains('mobile-open')) {
        hamburger.classList.add('hidden');
    } else {
        hamburger.classList.remove('hidden');
    }
}

function closeSidebar() {
    var sidebar = document.getElementById('sidebar');
    var overlay = document.getElementById('sidebarOverlay');
    var hamburger = document.getElementById('hamburgerBtn');

    sidebar.classList.remove('mobile-open');
    overlay.classList.remove('active');
    hamburger.classList.remove('hidden');
}

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeSidebar();
        var container = document.getElementById('searchContainer');
        if (container && container.classList.contains('active')) { toggleSearch(); }
        var box = document.getElementById('morePopupBox');
        if (box) box.classList.remove('active');
        var boxMobile = document.getElementById('morePopupBoxMobile');
        if (boxMobile) boxMobile.classList.remove('active');
        closeImageViewer();
        document.getElementById('appreciateDropdownMenu').classList.remove('open');
        document.getElementById('requestDropdownMenu').classList.remove('open');
        document.getElementById('accountDropdownMenu').classList.remove('open');
        isAccountDropdownOpen = false;
    }
});

// ─── HEADER FUNCTIONS ──────────────────────────────────────────────────────
function toggleSearch() {
    var container = document.getElementById('searchContainer');
    var input = document.getElementById('headerSearch');
    container.classList.toggle('active');
    if (container.classList.contains('active')) {
        setTimeout(function() { input.focus(); }, 100);
    } else {
        input.value = '';
    }
}

function toggleMoreMenu(event) {
    if (event) event.stopPropagation();
    var box = document.getElementById('morePopupBox');
    if (box) box.classList.toggle('active');
}

function toggleMoreMenuMobile(event) {
    if (event) event.stopPropagation();
    var box = document.getElementById('morePopupBoxMobile');
    if (box) box.classList.toggle('active');
}

function handleMenuClick(action) {
    showToast('Opening: ' + action, 'info');
    document.getElementById('morePopupBox').classList.remove('active');
    document.getElementById('morePopupBoxMobile').classList.remove('active');
    document.getElementById('accountDropdownMenu').classList.remove('open');
    isAccountDropdownOpen = false;
}

function handleShare() {
    if (navigator.share) {
        navigator.share({
            title: 'NovaKai - SeekReap Profile',
            text: "Check out NovaKai's profile on SeekReap",
            url: window.location.href
        }).then(() => {
            showToast('Shared successfully!', 'success');
        }).catch(() => {
            showToast('Share cancelled', 'info');
        });
    } else {
        navigator.clipboard.writeText(window.location.href).then(function() {
            showToast('Profile link copied to clipboard!', 'success');
        }).catch(function() {
            showToast('Share: ' + window.location.href, 'info');
        });
    }
}

function openImageViewer(src, caption) {
    var modal = document.getElementById('imageViewerModal');
    var img = document.getElementById('imageViewerImg');
    var cap = document.getElementById('imageViewerCaption');
    if (modal && img) {
        img.src = src;
        cap.textContent = caption || 'Image';
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeImageViewer() {
    var modal = document.getElementById('imageViewerModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.addEventListener('scroll', function() {
    var btn = document.getElementById('scrollTopBtn');
    if (window.scrollY > 300) { btn.classList.add('visible'); }
    else { btn.classList.remove('visible'); }
});

document.addEventListener('click', function(e) {
    var box = document.getElementById('morePopupBox');
    if (box && !box.contains(e.target)) { box.classList.remove('active'); }
    var boxMobile = document.getElementById('morePopupBoxMobile');
    if (boxMobile && !boxMobile.contains(e.target)) { boxMobile.classList.remove('active'); }
    var menu = document.getElementById('portfolioDropdownMenu');
    var wrapper = document.querySelector('.portfolio-dropdown-wrapper');
    if (wrapper && menu && !wrapper.contains(e.target)) { menu.classList.remove('open'); }

    var appreciateMenu = document.getElementById('appreciateDropdownMenu');
    var appreciateWrapper = document.querySelector('.appreciate-dropdown-wrapper');
    if (appreciateWrapper && appreciateMenu && !appreciateWrapper.contains(e.target)) {
        appreciateMenu.classList.remove('open');
        isAppreciateDropdownOpen = false;
    }

    var requestMenu = document.getElementById('requestDropdownMenu');
    var requestWrapper = document.querySelector('.request-btn-wrapper');
    if (requestWrapper && requestMenu && !requestWrapper.contains(e.target)) {
        requestMenu.classList.remove('open');
        isRequestDropdownOpen = false;
    }

    document.querySelectorAll('.account-dropdown-wrapper').forEach(function(wrapper) {
        var menu = wrapper.querySelector('.account-dropdown-menu');
        if (menu && !wrapper.contains(e.target)) {
            menu.classList.remove('open');
        }
    });
    isAccountDropdownOpen = false;
});

// ─── SECTION TABS ──────────────────────────────────────────────────────────
function closeSectionCard() {
    var activeTab = document.querySelector('.section-tab.active');
    var activeSection = document.querySelector('.section-content.active');
    var zone = document.getElementById('contentOverlayZone');
    if (activeTab) { activeTab.classList.remove('active'); }
    if (activeSection) { activeSection.classList.remove('active'); }
    if (zone) { zone.classList.remove('has-active-card'); }
}

function toggleSectionTab(btn, sectionId) {
    var section = document.getElementById('section-' + sectionId);
    var isActive = btn.classList.contains('active');
    var zone = document.getElementById('contentOverlayZone');

    var allTabs = document.querySelectorAll('.section-tab:not(.view-portfolio-btn)');
    var allSections = document.querySelectorAll('.section-content');

    if (isActive) {
        btn.classList.remove('active');
        section.classList.remove('active');
        if (zone) { zone.classList.remove('has-active-card'); }
        return;
    }

    allTabs.forEach(function(t) { t.classList.remove('active'); });
    allSections.forEach(function(s) { s.classList.remove('active'); });

    btn.classList.add('active');
    section.classList.add('active');
    if (zone) { zone.classList.add('has-active-card'); }
}

// ─── PORTFOLIO ────────────────────────────────────────────────────────────
function togglePortfolioDropdown(event) {
    if (event) { event.stopPropagation(); event.preventDefault(); }
    var menu = document.getElementById('portfolioDropdownMenu');
    if (menu) { menu.classList.toggle('open'); }
}

var portfolioItems = {
    'Portfolios': [
        { id: 'p1', title: 'Studio Console Geometry', image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=400&auto=format&fit=crop', category: 'music' },
        { id: 'p2', title: 'Stage Flare Exposure', image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=400&auto=format&fit=crop', category: 'photo' },
        { id: 'p3', title: 'Vocal Isolation Profile', image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd6a?q=80&w=400&auto=format&fit=crop', category: 'music' },
        { id: 'p4', title: 'Modular Synthesizer Grid', image: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?q=80&w=400&auto=format&fit=crop', category: 'design' },
        { id: 'p5', title: 'Backstage Silhouette Study', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=400&auto=format&fit=crop', category: 'photo' },
        { id: 'p6', title: 'Acoustic Diffuser Shadows', image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=400&auto=format&fit=crop', category: 'design' }
    ],
    'Featured Portfolio': [
        { id: 'f1', title: 'Nova Dawn - Official Music Video', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400&auto=format&fit=crop', category: 'video' },
        { id: 'f2', title: 'Amapiano Sunset Horizon', image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=400&auto=format&fit=crop', category: 'music' },
        { id: 'f3', title: 'Cinematic Soundscapes - Trailer', image: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=400&auto=format&fit=crop', category: 'video' }
    ],
    'Collections': [
        { id: 'c1', title: 'Urban Poly-Rhythm Drive', image: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?q=80&w=400&auto=format&fit=crop', category: 'music' },
        { id: 'c2', title: 'Tribal Tech Resonance', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400&auto=format&fit=crop', category: 'music' },
        { id: 'c3', title: 'Cape Coast Low-Fi Ambience', image: 'https://images.unsplash.com/photo-1446057032654-9d8885b76c2a?q=80&w=400&auto=format&fit=crop', category: 'music' },
        { id: 'c4', title: 'Sub-Saharan Sub Bass Kick', image: 'https://images.unsplash.com/photo-1487180142328-0c4e37023af5?q=80&w=400&auto=format&fit=crop', category: 'music' }
    ],
    'Collaborative Works': [
        { id: 'co1', title: 'African Rhythms - Documentary Short', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=400&auto=format&fit=crop', category: 'video' },
        { id: 'co2', title: 'Deep Horizon - Structural Prose', image: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=400&auto=format&fit=crop', category: 'writing' },
        { id: 'co3', title: 'Behind the Scenes - Studio Session', image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=400&auto=format&fit=crop', category: 'video' }
    ],
    'Certified Works': [
        { id: 'ce1', title: 'Nova Dawn - Complete Verse System', image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=400&auto=format&fit=crop', category: 'writing' },
        { id: 'ce2', title: 'Polyphonic Echoes - Text Blueprint', image: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?q=80&w=400&auto=format&fit=crop', category: 'writing' },
        { id: 'ce3', title: 'Studio Console Geometry', image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=400&auto=format&fit=crop', category: 'design' }
    ],
    'Latest Works': [
        { id: 'l1', title: 'NovaKai - Artist Masterclass Intro', image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd6a?q=80&w=400&auto=format&fit=crop', category: 'video' },
        { id: 'l2', title: 'Acoustic Diffuser 3D Model', image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=400&auto=format&fit=crop', category: 'design' },
        { id: 'l3', title: 'Backstage Silhouette Study', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=400&auto=format&fit=crop', category: 'photo' }
    ],
    'Works for Licensing': [
        { id: 'li1', title: 'Electronic Explorations (Live Set)', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=400&auto=format&fit=crop', category: 'music' },
        { id: 'li2', title: 'Vocal Isolation Profile', image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd6a?q=80&w=400&auto=format&fit=crop', category: 'music' },
        { id: 'li3', title: 'Modular Synthesizer Grid 3D', image: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?q=80&w=400&auto=format&fit=crop', category: 'design' },
        { id: 'li4', title: 'Acoustic Diffuser Shadows', image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=400&auto=format&fit=crop', category: 'design' }
    ],
    'Works for Sale': [
        { id: 'sa1', title: 'Amapiano Sunset Horizon', image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=400&auto=format&fit=crop', category: 'music' },
        { id: 'sa2', title: 'Sub-Saharan Sub Bass Kick', image: 'https://images.unsplash.com/photo-1487180142328-0c4e37023af5?q=80&w=400&auto=format&fit=crop', category: 'music' },
        { id: 'sa3', title: 'Studio Console Geometry', image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=400&auto=format&fit=crop', category: 'design' }
    ],
    'Popular Works': [
        { id: 'po1', title: 'Nova Dawn - Official Music Video', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400&auto=format&fit=crop', category: 'video' },
        { id: 'po2', title: 'Amapiano Sunset Horizon', image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=400&auto=format&fit=crop', category: 'music' },
        { id: 'po3', title: 'Tribal Tech Resonance', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400&auto=format&fit=crop', category: 'music' },
        { id: 'po4', title: 'Studio Console Geometry', image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=400&auto=format&fit=crop', category: 'design' },
        { id: 'po5', title: 'Cinematic Soundscapes - Trailer', image: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=400&auto=format&fit=crop', category: 'video' }
    ],
    'Commission Portfolio': [
        { id: 'cm1', title: 'Stage Flare Exposure', image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=400&auto=format&fit=crop', category: 'photo' },
        { id: 'cm2', title: 'NovaKai - Artist Masterclass Intro', image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd6a?q=80&w=400&auto=format&fit=crop', category: 'video' },
        { id: 'cm3', title: 'Modular Synthesizer Grid 3D', image: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?q=80&w=400&auto=format&fit=crop', category: 'design' },
        { id: 'cm4', title: 'Electronic Explorations (Live Set)', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=400&auto=format&fit=crop', category: 'music' }
    ]
};

var currentPortfolio = 'Portfolios';
var currentFilter = 'all';

// ─── SHARE DIALOG ─────────────────────────────────────────────────────────
var shareDialogItemTitle = '';

function openShareDialog(itemTitle) {
    shareDialogItemTitle = itemTitle;
    var titleEl = document.getElementById('shareDialogItemTitle');
    if (titleEl) { titleEl.textContent = '"' + itemTitle + '"'; }
    showShareOptions();
    document.getElementById('shareDialogModal').classList.add('active');
}

function closeShareDialog() {
    document.getElementById('shareDialogModal').classList.remove('active');
}

function showShareOptions() {
    document.getElementById('shareDialogContent').classList.remove('show-users');
}

function showShareUserList() {
    var list = document.getElementById('shareUserListItems');
    list.innerHTML = collaborators.map(function(c, i) {
        return '<button class="share-user-row" onclick="shareToSeekReapUser(' + i + ')">' +
            '<img src="' + c.avatar + '" alt="' + c.name + '">' +
            '<div><div class="share-user-name">' + c.name + '</div>' +
            '<div class="share-user-handle">' + c.handle + '</div></div>' +
        '</button>';
    }).join('');
    document.getElementById('shareDialogContent').classList.add('show-users');
}

function shareToSeekReapUser(index) {
    var user = collaborators[index];
    if (!user) return;
    showToast('Shared "' + shareDialogItemTitle + '" with ' + user.name, 'success');
    closeShareDialog();
}

function shareToNonSeekReapUser() {
    var shareData = {
        title: shareDialogItemTitle,
        text: 'Check out "' + shareDialogItemTitle + '" on SeekReap',
        url: window.location.href
    };
    if (navigator.share) {
        navigator.share(shareData).catch(function() {});
    } else if (navigator.clipboard) {
        navigator.clipboard.writeText(shareData.url).then(function() {
            showToast('Sharing is not supported on this browser. Link copied instead.', 'info');
        });
    } else {
        showToast('Sharing is not supported on this browser.', 'info');
    }
    closeShareDialog();
}

// ─── COLLABORATORS DATA ──────────────────────────────────────────────────
var collaborators = [
    { name: 'Luna Ray', handle: '@lunaray', avatar: 'https://images.unsplash.com/photo-1494790108376-be9c24b9cf6c?q=80&w=100&auto=format&fit=crop', badge: 'Producer' },
    { name: 'Kai Sterling', handle: '@kaisterling', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop', badge: 'Videographer' },
    { name: 'Maya Nova', handle: '@mayanova', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&auto=format&fit=crop', badge: 'Photographer' },
    { name: 'Eli Stone', handle: '@elistone', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100&auto=format&fit=crop', badge: 'Composer' },
    { name: 'Zara Blake', handle: '@zarablake', avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?q=80&w=100&auto=format&fit=crop', badge: 'Designer' },
    { name: 'Marcus Cole', handle: '@marcuscole', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop', badge: 'Writer' },
    { name: 'Nina Simone', handle: '@ninasimone', avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=100&auto=format&fit=crop', badge: 'Producer' },
    { name: 'Alex Rivera', handle: '@alexrivera', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=100&auto=format&fit=crop', badge: 'Videographer' },
    { name: 'Sofia Chen', handle: '@sofiachen', avatar: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?q=80&w=100&auto=format&fit=crop', badge: 'Photographer' },
    { name: 'James Park', handle: '@jamespark', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop', badge: 'Designer' }
];

// ─── RENDER PORTFOLIO ──────────────────────────────────────────────────────
function renderPortfolioDisplay(portfolioName, filter) {
    var items = portfolioItems[portfolioName] || portfolioItems['Portfolios'];
    var grid = document.getElementById('portfolioGridDisplay');
    var title = document.getElementById('portfolioDisplayTitle');
    var count = document.getElementById('portfolioItemCount');

    if (filter && filter !== 'all') {
        items = items.filter(function(item) { return item.category === filter; });
    }

    if (currentSearch) {
        var query = currentSearch.toLowerCase();
        items = items.filter(function(item) { return item.title.toLowerCase().indexOf(query) !== -1; });
    }

    title.textContent = 'Portfolios';
    count.textContent = items.length;

    if (items.length === 0) {
        grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px 20px;color:var(--text-muted);">No works found in this category</div>';
        return;
    }

    grid.innerHTML = items.map(function(item) {
        var actionButtons =
            '<button onclick="event.stopPropagation();showToast(\'Playing: ' + item.title + '\', \'info\')" title="Play here"><i class="fas fa-play"></i></button>' +
            '<button onclick="event.stopPropagation();openShareDialog(\'' + item.title + '\')" title="Share this work"><i class="fas fa-share-alt"></i></button>' +
            '<button onclick="event.stopPropagation();showToast(\'Saved: ' + item.title + '\', \'success\')" title="Save this work"><i class="fas fa-bookmark"></i></button>' +
            '<button onclick="event.stopPropagation();showToast(\'Reported: ' + item.title + '\', \'info\')" title="Report this work"><i class="fas fa-flag"></i></button>' +
            '<button onclick="event.stopPropagation();showToast(\'Viewing: ' + item.title + '\', \'info\')" title="View Credits"><i class="fas fa-info-circle"></i></button>' +
            '<button onclick="event.stopPropagation();showToast(\'Opening ' + item.title + ' in Studio\', \'success\')" title="Open in studio"><i class="fas fa-external-link-alt"></i></button>';

        return '<div class="portfolio-display-item">' +
            '<div class="item-thumb">' +
                '<img src="' + item.image + '" alt="' + item.title + '">' +
                '<div class="item-overlay">' + actionButtons + '</div>' +
            '</div>' +
            '<div class="item-info">' +
                '<span class="item-title">' + item.title + '</span>' +
                '<div class="item-actions">' + actionButtons + '</div>' +
            '</div>' +
        '</div>';
    }).join('');

    currentPortfolio = portfolioName;
    currentFilter = filter || 'all';
}

function filterPortfolioWorks(filter) {
    currentFilter = filter || 'all';
    renderPortfolioCategory();
}

function renderCollaborators() {
    var container = document.getElementById('collaboratorsList');
    container.innerHTML = collaborators.map(function(collaborator) {
        return '<a href="/profile/' + collaborator.handle.replace('@', '') + '" class="collaborator-item" onclick="event.preventDefault();showToast(\'Redirecting to ' + collaborator.name + '\'s profile\', \'info\')">' +
            '<img src="' + collaborator.avatar + '" alt="' + collaborator.name + '" class="collaborator-avatar">' +
            '<div class="collaborator-info">' +
                '<div class="collaborator-name">' + collaborator.name + '</div>' +
                '<div class="collaborator-handle">' + collaborator.handle + ' <span class="collaborator-badge">' + collaborator.badge + '</span></div>' +
            '</div>' +
            '<i class="fas fa-chevron-right arrow-icon"></i>' +
        '</a>';
    }).join('');
}

function handlePortfolioClick(portfolioName) {
    showToast('Loading: ' + portfolioName, 'info');
    document.getElementById('portfolioDropdownMenu').classList.remove('open');
    document.getElementById('portfolioFilter').value = 'all';
    renderPortfolioDisplay(portfolioName, 'all');
}

// ─── APPRECIATE ──────────────────────────────────────────────────────────
function toggleAppreciateDropdown(event) {
    if (event) { event.stopPropagation(); event.preventDefault(); }
    var menu = document.getElementById('appreciateDropdownMenu');
    var btn = document.getElementById('appreciateBtn');
    var btnText = document.getElementById('appreciateBtnText');
    var btnIcon = document.getElementById('appreciateBtnIcon');

    if (isAppreciateDropdownOpen) {
        menu.classList.remove('open');
        isAppreciateDropdownOpen = false;
    } else {
        document.getElementById('requestDropdownMenu').classList.remove('open');
        isRequestDropdownOpen = false;

        if (appreciateState === 'appreciate') {
            btnText.textContent = 'Appreciate';
            btnIcon.className = 'fas fa-heart';
            btn.className = 'btn btn-secondary';
        } else {
            btnText.textContent = 'Depreciate';
            btnIcon.className = 'fas fa-frown';
            btn.className = 'btn btn-danger';
        }

        updateAppreciateDropdown();
        menu.classList.add('open');
        isAppreciateDropdownOpen = true;
    }
}

function updateAppreciateDropdown() {
    var menu = document.getElementById('appreciateDropdownMenu');
    var items = appreciateState === 'appreciate' ?
        ['Appreciate Booking Approval', 'Appreciate Endorsement Proposal Approval', 'Appreciate Feature Proposal Approval', 'Appreciate License Request Approval', 'Appreciate Collaboration Request Approval', 'Appreciate Interview Request Approval', 'Appreciate Service Request Approval', 'Appreciate Employment Offer Acceptance', 'Appreciate Certificate Verification Link'] :
        ['Depreciate Booking Approval', 'Depreciate Endorsement Proposal Approval', 'Depreciate Feature Proposal Approval', 'Depreciate License Request Approval', 'Depreciate Collaboration Request Approval', 'Depreciate Interview Request Approval', 'Depreciate Service Request Approval', 'Depreciate Employment Offer Acceptance', 'Depreciate Certificate Verification Link'];

    menu.innerHTML = items.map(function(item) {
        return '<button class="appreciate-dropdown-item" onclick="handleAppreciateItemClick(\'' + item + '\')"><i class="fas fa-' + (appreciateState === 'appreciate' ? 'heart' : 'frown') + '"></i> ' + item + '</button>';
    }).join('');
}

// Appreciate behaves like Trust: click item -> show appreciated -> permanently switch to depreciate
function handleAppreciateItemClick(action) {
    var actionKey = action.replace(/^(Appreciate|Depreciate) /, '');

    if (actionKey !== 'Certificate Verification Link' && !sentActionKeys.has(actionKey)) {
        var matchingRequest = Object.keys(REQUEST_TO_ACTION_KEY).find(function(k) {
            return REQUEST_TO_ACTION_KEY[k] === actionKey;
        });
        showToast(
            'You can only appreciate what you have requested. Send a "' +
            (matchingRequest || actionKey) + '" request first.',
            'error'
        );
        return;
    }

    document.getElementById('appreciateDropdownMenu').classList.remove('open');
    isAppreciateDropdownOpen = false;

    if (appreciationTimeout) {
        clearTimeout(appreciationTimeout);
        appreciationTimeout = null;
    }

    const btn = document.getElementById('appreciateBtn');
    const text = document.getElementById('appreciateBtnText');
    const icon = document.getElementById('appreciateBtnIcon');

    if (appreciateState === 'appreciate') {
        text.textContent = 'Appreciated!';
        btn.className = 'btn btn-success';
        icon.className = 'fas fa-check';
        btn.style.opacity = '0.8';

        showToast(action + ' ✓', 'success');

        appreciationTimeout = setTimeout(function() {
            appreciateState = 'depreciate';
            text.textContent = 'Depreciate';
            btn.className = 'btn btn-danger';
            icon.className = 'fas fa-frown';
            btn.style.opacity = '1';
            showToast('You now Appreciate this creator', 'success');
            updateAppreciateDropdown();
        }, 1500);
    } else {
        text.textContent = 'Depreciated!';
        btn.className = 'btn btn-danger';
        icon.className = 'fas fa-check';
        btn.style.opacity = '0.8';

        showToast(action + ' ✓', 'success');

        appreciationTimeout = setTimeout(function() {
            appreciateState = 'appreciate';
            text.textContent = 'Appreciate';
            btn.className = 'btn btn-secondary';
            icon.className = 'fas fa-heart';
            btn.style.opacity = '1';
            showToast('You now Depreciate this creator', 'info');
            updateAppreciateDropdown();
        }, 1500);
    }
}

// ─── TRUST ──────────────────────────────────────────────────────────────
function handleTrustClick() {
    if (trustTimeout) {
        clearTimeout(trustTimeout);
        trustTimeout = null;
    }

    const btn = document.getElementById('trustBtn');
    const text = document.getElementById('trustBtnText');
    const icon = btn.querySelector('i');

    if (trustState === 'trust') {
        text.textContent = 'Trusted!';
        btn.className = 'btn btn-success';
        icon.className = 'fas fa-check';
        btn.style.opacity = '0.8';

        trustTimeout = setTimeout(function() {
            trustState = 'distrust';
            text.textContent = 'Distrust';
            btn.className = 'btn btn-danger';
            icon.className = 'fas fa-times';
            btn.style.opacity = '1';
            showToast('You now Trust this creator', 'success');
        }, 1500);
    } else {
        text.textContent = 'Distrusted!';
        btn.className = 'btn btn-danger';
        icon.className = 'fas fa-check';
        btn.style.opacity = '0.8';

        trustTimeout = setTimeout(function() {
            trustState = 'trust';
            text.textContent = 'Trust';
            btn.className = 'btn btn-primary';
            icon.className = 'fas fa-shield-alt';
            btn.style.opacity = '1';
            showToast('You now Distrust this creator', 'info');
        }, 1500);
    }
}

// ─── REQUEST ──────────────────────────────────────────────────────────────
function toggleRequestDropdown(event) {
    if (event) { event.stopPropagation(); event.preventDefault(); }
    var menu = document.getElementById('requestDropdownMenu');

    if (isRequestDropdownOpen) {
        menu.classList.remove('open');
        isRequestDropdownOpen = false;
    } else {
        document.getElementById('appreciateDropdownMenu').classList.remove('open');
        isAppreciateDropdownOpen = false;
        menu.classList.add('open');
        isRequestDropdownOpen = true;
    }
}

function handleRequestClick(action) {
    showToast('Request: ' + action + ' sent!', 'success');
    var actionKey = REQUEST_TO_ACTION_KEY[action];
    if (actionKey) { sentActionKeys.add(actionKey); }
    document.getElementById('requestDropdownMenu').classList.remove('open');
    isRequestDropdownOpen = false;
}

// ─── COPY ──────────────────────────────────────────────────────────────────
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(function() {
        showToast('Copied: "' + text + '"', 'success');
    }).catch(function() {
        showToast('Unable to copy', 'error');
    });
}

// ─── TOAST ──────────────────────────────────────────────────────────────────
function showToast(msg, type) {
    type = type || 'success';
    var existing = document.querySelector('.toast');
    if (existing) existing.remove();
    var t = document.createElement('div');
    t.className = 'toast';
    var icon = type === 'success' ? 'fa-check-circle' : type === 'info' ? 'fa-info-circle' : 'fa-exclamation-circle';
    var color = type === 'success' ? 'var(--primary)' : type === 'info' ? 'var(--info)' : 'var(--danger)';
    t.innerHTML = '<i class="fas ' + icon + '" style="margin-right:8px;color:' + color + ';"></i> ' + msg;
    document.body.appendChild(t);
    setTimeout(function() {
        t.style.opacity = '0';
        setTimeout(function() { if (t.parentNode) t.remove(); }, 300);
    }, 2800);
}

// ─── INIT ──────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
    renderPortfolioCategory();
    renderCollaborators();
    updateAppreciateDropdown();

    document.getElementById('headerSearch').addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && this.value.trim()) {
            showToast('Searching: "' + this.value.trim() + '"', 'info');
            toggleSearch();
        }
    });
    document.getElementById('headerSearchMobile').addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && this.value.trim()) {
            showToast('Searching: "' + this.value.trim() + '"', 'info');
        }
    });
});

// ─── EXPOSE ──────────────────────────────────────────────────────────────────
window.toggleMobileSidebar = toggleMobileSidebar;
window.closeSidebar = closeSidebar;
window.toggleSearch = toggleSearch;
window.toggleMoreMenu = toggleMoreMenu;
window.toggleMoreMenuMobile = toggleMoreMenuMobile;
window.handleMenuClick = handleMenuClick;
window.handleShare = handleShare;
window.openImageViewer = openImageViewer;
window.closeImageViewer = closeImageViewer;
window.scrollToTop = scrollToTop;
window.toggleSectionTab = toggleSectionTab;
window.closeSectionCard = closeSectionCard;
window.openShareDialog = openShareDialog;
window.closeShareDialog = closeShareDialog;
window.showShareOptions = showShareOptions;
window.showShareUserList = showShareUserList;
window.shareToSeekReapUser = shareToSeekReapUser;
window.shareToNonSeekReapUser = shareToNonSeekReapUser;
window.togglePortfolioDropdown = togglePortfolioDropdown;
window.handlePortfolioClick = handlePortfolioClick;
window.filterPortfolioWorks = filterPortfolioWorks;
window.toggleAppreciateDropdown = toggleAppreciateDropdown;
window.handleAppreciateItemClick = handleAppreciateItemClick;
window.handleTrustClick = handleTrustClick;
window.toggleRequestDropdown = toggleRequestDropdown;
window.handleRequestClick = handleRequestClick;
window.toggleAccountDropdown = toggleAccountDropdown;
window.switchAccount = switchAccount;
window.copyToClipboard = copyToClipboard;
window.showToast = showToast;

/* ----------------------------------------------------------------------
   PORTFOLIO CATEGORIES: Assets, Gigs, Interviews, Community Works, Schedule
   All data below is simulated for demonstration purposes.
   ---------------------------------------------------------------------- */
var portfolioCategories = {
    assets:     { unit: 'works',      hasFilter: true,  placeholder: 'Search assets...' },
    gigs:       { unit: 'gigs',       hasFilter: false, placeholder: 'Search gigs...' },
    interviews: { unit: 'interviews', hasFilter: false, placeholder: 'Search interviews...' },
    community:  { unit: 'works',      hasFilter: true,  placeholder: 'Search community works...' },
    schedule:   { unit: 'events',     hasFilter: false, placeholder: 'Search events...' }
};
var currentCategory = 'assets';
var currentSearch = '';

function daysFromToday(n) {
    var d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + n);
    return d;
}

function portfolioMonthShort(d) {
    return d.toLocaleDateString('en-GB', { month: 'short' });
}

portfolioItems['Community Works'] = [
    { id: 'cw1', title: 'Cape Flats Youth Beat Project', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=400&auto=format&fit=crop', category: 'music' },
    { id: 'cw2', title: 'Community Radio Jingle Pack', image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd6a?q=80&w=400&auto=format&fit=crop', category: 'music' },
    { id: 'cw3', title: 'Heritage Day Mural Documentary', image: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=400&auto=format&fit=crop', category: 'video' },
    { id: 'cw4', title: 'Open Mic Night Live Recordings', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=400&auto=format&fit=crop', category: 'music' },
    { id: 'cw5', title: 'Township Stories Short Film', image: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=400&auto=format&fit=crop', category: 'video' },
    { id: 'cw6', title: 'Neighbourhood Poster Series', image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=400&auto=format&fit=crop', category: 'design' }
];

var portfolioGigs = [
    { id: 'g1', title: 'Afropunk Festival Main Stage', venue: 'Cape Town Stadium Park', city: 'Cape Town', type: 'Festival', time: '20:00', date: daysFromToday(6), status: 'Upcoming' },
    { id: 'g2', title: 'Nova Dawn Album Launch', venue: 'The Assembly', city: 'Cape Town', type: 'Headline show', time: '19:30', date: daysFromToday(13), status: 'Upcoming' },
    { id: 'g3', title: 'Sunset Sessions Live Set', venue: 'Camps Bay Beach Club', city: 'Cape Town', type: 'Live set', time: '17:00', date: daysFromToday(21), status: 'Upcoming' },
    { id: 'g4', title: 'Johannesburg Electronic Showcase', venue: 'Untitled Basement', city: 'Johannesburg', type: 'Showcase', time: '21:00', date: daysFromToday(-12), status: 'Completed' },
    { id: 'g5', title: 'Durban Beat Weekender', venue: 'Fan Park Stage', city: 'Durban', type: 'Festival', time: '16:00', date: daysFromToday(-40), status: 'Completed' },
    { id: 'g6', title: 'Studio Collaboration Night', venue: 'Nova Studios', city: 'Cape Town', type: 'Studio session', time: '18:00', date: daysFromToday(-75), status: 'Completed' }
];

var portfolioInterviews = [
    { id: 'i1', title: 'Album Launch Interview', outlet: 'YFM', format: 'Radio', duration: '30 min', time: '14:30', date: daysFromToday(8), status: 'Upcoming' },
    { id: 'i2', title: 'Drive Time Interview', outlet: 'Metro FM', format: 'Radio', duration: '24 min', time: '16:10', date: daysFromToday(-9), status: 'Published' },
    { id: 'i3', title: 'Behind the Beats: NovaKai on Production', outlet: 'Sonic Frequencies', format: 'Podcast', duration: '52 min', time: '11:00', date: daysFromToday(-30), status: 'Published' },
    { id: 'i4', title: 'The African Electronic Wave', outlet: 'Okay Africa', format: 'Article', duration: '8 min read', time: '09:00', date: daysFromToday(-58), status: 'Published' },
    { id: 'i5', title: 'Studio Tour with NovaKai', outlet: 'Creators Hub TV', format: 'Video', duration: '18 min', time: '13:00', date: daysFromToday(-90), status: 'Published' }
];

var portfolioScheduleExtras = [
    { title: 'Mixing session: Nova Dawn', date: daysFromToday(2), time: '10:00', kind: 'studio' },
    { title: 'Mastering review', date: daysFromToday(4), time: '15:00', kind: 'studio' },
    { title: 'Collab session with Luna Ray', date: daysFromToday(11), time: '12:00', kind: 'studio' },
    { title: 'Brand shoot booking', date: daysFromToday(16), time: '09:30', kind: 'booking' },
    { title: 'Rehearsal', date: daysFromToday(18), time: '17:00', kind: 'studio' },
    { title: 'Film scoring consultation', date: daysFromToday(24), time: '11:00', kind: 'booking' }
];

var scheduleKindLabels = { gig: 'Gig', interview: 'Interview', studio: 'Studio', booking: 'Booking' };
var scheduleMonth = (function() {
    var now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
})();

function matchesPortfolioSearch(fields) {
    if (!currentSearch) { return true; }
    return fields.join(' ').toLowerCase().indexOf(currentSearch.toLowerCase()) !== -1;
}

function setPortfolioCategory(category) {
    if (!portfolioCategories[category]) { return; }
    currentCategory = category;
    currentFilter = 'all';
    var filterSelect = document.getElementById('portfolioFilter');
    if (filterSelect) { filterSelect.value = 'all'; }
    renderPortfolioCategory();
}

function runPortfolioSearch() {
    var input = document.getElementById('portfolioSearchInput');
    currentSearch = input ? input.value.trim() : '';
    renderPortfolioCategory();
}

function renderPortfolioCategory() {
    var config = portfolioCategories[currentCategory];
    var grid = document.getElementById('portfolioGridDisplay');
    var filterSelect = document.getElementById('portfolioFilter');
    var label = document.getElementById('portfolioCountLabel');
    var input = document.getElementById('portfolioSearchInput');

    document.querySelectorAll('.portfolio-category-tab').forEach(function(tab) {
        var isActive = tab.getAttribute('data-category') === currentCategory;
        tab.classList.toggle('active', isActive);
        tab.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    if (filterSelect) { filterSelect.style.display = config.hasFilter ? '' : 'none'; }
    if (label) { label.textContent = config.unit; }
    if (input) { input.placeholder = config.placeholder; }

    var isWorkGrid = currentCategory === 'assets' || currentCategory === 'community';
    grid.className = 'portfolio-grid-display' + (isWorkGrid ? '' : ' list-mode');

    if (currentCategory === 'assets') {
        renderPortfolioDisplay('Portfolios', currentFilter);
    } else if (currentCategory === 'community') {
        renderPortfolioDisplay('Community Works', currentFilter);
    } else if (currentCategory === 'gigs') {
        renderGigsList();
    } else if (currentCategory === 'interviews') {
        renderInterviewsList();
    } else {
        renderSchedule();
    }
}

function portfolioListActionButtons(kind, id, withPlay) {
    var noun = kind === 'gigs' ? 'gig' : 'interview';
    var attrs = ' data-kind="' + kind + '" data-id="' + id + '" onclick="portfolioListActionFromButton(this)"';
    var html = '';
    if (withPlay) {
        html += '<button data-action="play"' + attrs + ' title="Play here"><i class="fas fa-play"></i></button>';
    }
    html += '<button data-action="share"' + attrs + ' title="Share this ' + noun + '"><i class="fas fa-share-alt"></i></button>';
    html += '<button data-action="save"' + attrs + ' title="Save this ' + noun + '"><i class="fas fa-bookmark"></i></button>';
    html += '<button data-action="report"' + attrs + ' title="Report this ' + noun + '"><i class="fas fa-flag"></i></button>';
    return html;
}

function portfolioListActionFromButton(btn) {
    portfolioListAction(btn.getAttribute('data-kind'), btn.getAttribute('data-action'), btn.getAttribute('data-id'));
}

function portfolioListAction(kind, action, id) {
    var list = kind === 'gigs' ? portfolioGigs : portfolioInterviews;
    var record = list.filter(function(r) { return r.id === id; })[0];
    if (!record) { return; }
    if (action === 'share') {
        openShareDialog(record.title);
    } else if (action === 'save') {
        showToast('Saved: ' + record.title, 'success');
    } else if (action === 'report') {
        showToast('Reported: ' + record.title, 'info');
    } else if (action === 'play') {
        showToast('Playing: ' + record.title, 'info');
    }
}

function renderGigsList() {
    var grid = document.getElementById('portfolioGridDisplay');
    var count = document.getElementById('portfolioItemCount');
    var gigs = portfolioGigs.filter(function(g) {
        return matchesPortfolioSearch([g.title, g.venue, g.city, g.type, g.status]);
    });
    count.textContent = gigs.length;
    if (gigs.length === 0) {
        grid.innerHTML = '<div class="portfolio-empty">No gigs found</div>';
        return;
    }
    grid.innerHTML = gigs.map(function(g) {
        var upcoming = g.status === 'Upcoming';
        return '<div class="portfolio-list-item">' +
            '<div class="list-item-date"><span class="list-item-day">' + g.date.getDate() + '</span><span class="list-item-month">' + portfolioMonthShort(g.date) + '</span></div>' +
            '<div class="list-item-body">' +
                '<div class="list-item-title">' + g.title + '</div>' +
                '<div class="list-item-meta">' +
                    '<span><i class="fas fa-map-marker-alt"></i>' + g.venue + ', ' + g.city + '</span>' +
                    '<span><i class="fas fa-clock"></i>' + g.time + '</span>' +
                    '<span class="list-item-tag">' + g.type + '</span>' +
                '</div>' +
            '</div>' +
            '<span class="list-item-status ' + (upcoming ? 'upcoming' : 'completed') + '">' + g.status + '</span>' +
            '<div class="list-item-actions">' + portfolioListActionButtons('gigs', g.id, false) + '</div>' +
        '</div>';
    }).join('');
}

function renderInterviewsList() {
    var grid = document.getElementById('portfolioGridDisplay');
    var count = document.getElementById('portfolioItemCount');
    var interviews = portfolioInterviews.filter(function(i) {
        return matchesPortfolioSearch([i.title, i.outlet, i.format, i.status]);
    });
    count.textContent = interviews.length;
    if (interviews.length === 0) {
        grid.innerHTML = '<div class="portfolio-empty">No interviews found</div>';
        return;
    }
    grid.innerHTML = interviews.map(function(i) {
        var upcoming = i.status === 'Upcoming';
        return '<div class="portfolio-list-item">' +
            '<div class="list-item-date"><span class="list-item-day">' + i.date.getDate() + '</span><span class="list-item-month">' + portfolioMonthShort(i.date) + '</span></div>' +
            '<div class="list-item-body">' +
                '<div class="list-item-title">' + i.title + '</div>' +
                '<div class="list-item-meta">' +
                    '<span><i class="fas fa-broadcast-tower"></i>' + i.outlet + '</span>' +
                    '<span><i class="fas fa-clock"></i>' + i.duration + '</span>' +
                    '<span class="list-item-tag">' + i.format + '</span>' +
                '</div>' +
            '</div>' +
            '<span class="list-item-status ' + (upcoming ? 'upcoming' : 'completed') + '">' + i.status + '</span>' +
            '<div class="list-item-actions">' + portfolioListActionButtons('interviews', i.id, !upcoming) + '</div>' +
        '</div>';
    }).join('');
}

function getScheduleEvents() {
    var events = portfolioScheduleExtras.slice();
    portfolioGigs.forEach(function(g) {
        events.push({ title: g.title, date: g.date, time: g.time, kind: 'gig' });
    });
    portfolioInterviews.forEach(function(i) {
        events.push({ title: i.title, date: i.date, time: i.time, kind: 'interview' });
    });
    events.sort(function(a, b) {
        if (a.date.getTime() !== b.date.getTime()) { return a.date - b.date; }
        return a.time < b.time ? -1 : (a.time > b.time ? 1 : 0);
    });
    return events;
}

function changeScheduleMonth(delta) {
    if (delta === 0) {
        var now = new Date();
        scheduleMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
        scheduleMonth = new Date(scheduleMonth.getFullYear(), scheduleMonth.getMonth() + delta, 1);
    }
    renderPortfolioCategory();
}

function renderSchedule() {
    var grid = document.getElementById('portfolioGridDisplay');
    var count = document.getElementById('portfolioItemCount');
    var year = scheduleMonth.getFullYear();
    var month = scheduleMonth.getMonth();

    var events = getScheduleEvents().filter(function(e) {
        return e.date.getFullYear() === year && e.date.getMonth() === month &&
            matchesPortfolioSearch([e.title, scheduleKindLabels[e.kind]]);
    });
    count.textContent = events.length;

    var firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
    var daysInMonth = new Date(year, month + 1, 0).getDate();
    var today = new Date();
    today.setHours(0, 0, 0, 0);

    var byDay = {};
    events.forEach(function(e) {
        var d = e.date.getDate();
        if (!byDay[d]) { byDay[d] = []; }
        byDay[d].push(e);
    });

    var cells = '';
    for (var blank = 0; blank < firstWeekday; blank++) {
        cells += '<div class="schedule-day empty"></div>';
    }
    for (var day = 1; day <= daysInMonth; day++) {
        var isToday = new Date(year, month, day).getTime() === today.getTime();
        var dayEvents = byDay[day] || [];
        var chips = dayEvents.slice(0, 2).map(function(e) {
            return '<span class="schedule-chip ' + e.kind + '" title="' + e.time + ' - ' + e.title + '">' + e.title + '</span>';
        }).join('');
        if (dayEvents.length > 2) {
            chips += '<span class="schedule-more">+' + (dayEvents.length - 2) + ' more</span>';
        }
        cells += '<div class="schedule-day' + (isToday ? ' today' : '') + '">' +
            '<span class="schedule-day-num">' + day + '</span>' + chips + '</div>';
    }

    var agenda;
    if (events.length === 0) {
        agenda = '<div class="portfolio-empty">No events scheduled this month</div>';
    } else {
        agenda = events.map(function(e) {
            return '<div class="schedule-agenda-row">' +
                '<span class="schedule-agenda-date">' + e.date.getDate() + ' ' + portfolioMonthShort(e.date) + '</span>' +
                '<span class="schedule-agenda-time">' + e.time + '</span>' +
                '<span class="schedule-agenda-name">' + e.title + '</span>' +
                '<span class="schedule-agenda-kind ' + e.kind + '">' + scheduleKindLabels[e.kind] + '</span>' +
            '</div>';
        }).join('');
    }

    var monthLabel = scheduleMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

    grid.innerHTML =
        '<div class="schedule-calendar">' +
            '<div class="schedule-toolbar">' +
                '<span class="schedule-month-label">' + monthLabel + '</span>' +
                '<div class="schedule-nav">' +
                    '<button onclick="changeScheduleMonth(-1)" aria-label="Previous month" title="Previous month"><i class="fas fa-chevron-left"></i></button>' +
                    '<button onclick="changeScheduleMonth(0)" title="Go to the current month">Today</button>' +
                    '<button onclick="changeScheduleMonth(1)" aria-label="Next month" title="Next month"><i class="fas fa-chevron-right"></i></button>' +
                '</div>' +
            '</div>' +
            '<div class="schedule-weekdays"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div>' +
            '<div class="schedule-days">' + cells + '</div>' +
            '<div class="schedule-agenda"><div class="schedule-agenda-title">Events this month</div>' + agenda + '</div>' +
        '</div>';
}

window.setPortfolioCategory = setPortfolioCategory;
window.runPortfolioSearch = runPortfolioSearch;
window.changeScheduleMonth = changeScheduleMonth;
window.portfolioListActionFromButton = portfolioListActionFromButton;
