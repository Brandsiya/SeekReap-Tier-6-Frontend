// ─── STATE ──────────────────────────────────────────────────────────────────
let appreciateState = 'appreciate';
let trustState = 'trust';
let isAppreciateDropdownOpen = false;
let isRequestDropdownOpen = false;
let isAccountDropdownOpen = false;
let appreciationTimeout = null;
let trustTimeout = null;

// ─── ACCOUNT SWITCHER ──────────────────────────────────────────────────────
function toggleAccountDropdown(event) {
    if (event) event.stopPropagation();
    const menu = document.getElementById('accountDropdownMenu');
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

    const trigger = document.getElementById('accountTrigger');
    trigger.innerHTML = `<img src="${account.avatar}" alt="${account.name}">`;

    // Update the new header profile photo (desktop + mobile)
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

    document.getElementById('accountDropdownMenu').classList.remove('open');
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

    var accountMenu = document.getElementById('accountDropdownMenu');
    var accountWrapper = document.querySelector('.account-dropdown-wrapper');
    if (accountWrapper && accountMenu && !accountWrapper.contains(e.target)) {
        accountMenu.classList.remove('open');
        isAccountDropdownOpen = false;
    }
});

// ─── SECTION TABS ──────────────────────────────────────────────────────────
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

    title.textContent = portfolioName;
    count.textContent = items.length;

    if (items.length === 0) {
        grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px 20px;color:var(--text-muted);">No works found in this category</div>';
        return;
    }

    grid.innerHTML = items.map(function(item) {
        return '<div class="portfolio-display-item">' +
            '<div class="item-thumb">' +
                '<img src="' + item.image + '" alt="' + item.title + '">' +
                '<div class="item-overlay">' +
                    '<button onclick="event.stopPropagation();showToast(\'Viewing: ' + item.title + '\', \'info\')" title="View Info"><i class="fas fa-info-circle"></i></button>' +
                    '<button onclick="event.stopPropagation();showToast(\'Opening ' + item.title + ' in Studio\', \'success\')" title="Open in Studio"><i class="fas fa-external-link-alt"></i></button>' +
                '</div>' +
            '</div>' +
            '<div class="item-info">' +
                '<span class="item-title">' + item.title + '</span>' +
                '<div class="item-actions">' +
                    '<button onclick="event.stopPropagation();showToast(\'Viewing: ' + item.title + '\', \'info\')" title="View Info"><i class="fas fa-info-circle"></i></button>' +
                    '<button onclick="event.stopPropagation();showToast(\'Opening ' + item.title + ' in Studio\', \'success\')" title="Open in Studio"><i class="fas fa-external-link-alt"></i></button>' +
                '</div>' +
            '</div>' +
        '</div>';
    }).join('');

    currentPortfolio = portfolioName;
    currentFilter = filter || 'all';
}

function filterPortfolioWorks(filter) {
    renderPortfolioDisplay(currentPortfolio, filter);
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
        ['Appreciate Booking Approval', 'Appreciate Endorsement Proposal Approval', 'Appreciate Feature Proposal Approval', 'Appreciate License Request Approval', 'Appreciate Collaboration Request Approval', 'Appreciate Interview Request Approval', 'Appreciate Certificate Verification Link'] :
        ['Depreciate Booking Approval', 'Depreciate Endorsement Proposal Approval', 'Depreciate Feature Proposal Approval', 'Depreciate License Request Approval', 'Depreciate Collaboration Request Approval', 'Depreciate Interview Request Approval', 'Depreciate Certificate Verification Link'];

    menu.innerHTML = items.map(function(item) {
        return '<button class="appreciate-dropdown-item" onclick="handleAppreciateItemClick(\'' + item + '\')"><i class="fas fa-' + (appreciateState === 'appreciate' ? 'heart' : 'frown') + '"></i> ' + item + '</button>';
    }).join('');
}

// Appreciate behaves like Trust: click item -> show appreciated -> permanently switch to depreciate
function handleAppreciateItemClick(action) {
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
    renderPortfolioDisplay('Portfolios', 'all');
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
