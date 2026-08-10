/**
 * profile.js - Profile page JavaScript for SeekReap Identity Center
 * Handles profile data loading, rendering, and interactions
 */

// ─── CONFIGURATION ──────────────────────────────────────────────────────────
const TIER4 = 'https://seekreap-tier-4-orchestrator-1.onrender.com';
let _cachedJwt = null;
let _profileData = null;
let _employmentData = null;
let _isEditMode = false;

// ─── API HELPERS ────────────────────────────────────────────────────────────
async function _getJwt() {
    if (_cachedJwt) return _cachedJwt;
    if (window.supabaseClient) {
        try {
            const { data: { session }, error } = await window.supabaseClient.auth.getSession();
            if (!error && session) {
                _cachedJwt = session.access_token;
                return _cachedJwt;
            }
        } catch (e) {
            console.error('[Auth]', e);
        }
    }
    return null;
}

async function apiFetch(path, opts = {}) {
    const jwt = await _getJwt();
    const headers = {
        'Content-Type': 'application/json',
        ...(opts.headers || {})
    };
    if (jwt) headers['Authorization'] = 'Bearer ' + jwt;
    const res = await fetch(TIER4 + path, { ...opts, headers });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || err.detail || 'HTTP ' + res.status);
    }
    return res.json();
}

// ─── FALLBACK DATA ──────────────────────────────────────────────────────────
function getFallbackData() {
    return {
        id: 'user-123',
        user_type: 'creator',
        verification_status: 'verified_creator',
        first_legal_name: 'John',
        middle_legal_name: 'David',
        last_legal_name: 'Smith',
        legal_full_name: 'John David Smith',
        display_name: 'NovaKai',
        title: 'Mr',
        gender: 'Male',
        date_of_birth: '1990-01-15',
        identity_number_last4: '7890',
        passport_number_last4: 'A1B2',
        seekreap_id: 'SR-2026-MR9KZW0B',
        artistic_slug: 'nova-kai',
        country_code: 'ZA',
        province_code: 'WC',
        recovery_email: 'nova@seekreap.io',
        primary_phone: '+27 82 123 4567',
        secondary_phone: '+27 82 123 4568',
        contact_preference: 'email',
        artistic_name: 'NovaKai',
        biography: 'Award-winning music producer and composer with 10+ years of experience creating genre-defying electronic music.',
        website_urls: [{ label: 'Official', url: 'https://novakai.com' }],
        social_links: {
            github: 'https://github.com/novakai',
            instagram: 'https://instagram.com/novakai',
            x: 'https://x.com/novakai',
            youtube: 'https://youtube.com/@novakai',
            linkedin: 'https://linkedin.com/in/novakai'
        },
        profile_roles: [
            { title: 'Producer', tier: 'Primary Role', period: '2016—Present', works: 143, collabs: 52, active: 18, rating: 5, expertise: ['Music Production', 'Mixing', 'Mastering'], industries: ['Music', 'Film', 'Gaming'], id_link: ['IPI', 'ISRC', 'ISWC'] },
            { title: 'Composer', tier: 'Secondary Role', period: '2014—Present', works: 89, collabs: 21, active: 4, rating: 4, expertise: ['Orchestral Arranging', 'Film Scoring'], industries: ['Film', 'Theatre'], id_link: ['ISWC', 'ISNI'] },
            { title: 'Educator', tier: 'Mentor', period: '2022—Present', works: 12, collabs: 18, active: 2, rating: 3, expertise: ['Cape Town Music Institute', 'Masterclasses'], industries: ['Education'], id_link: ['ORCID', 'ISNI'] }
        ],
        timeline: [
            { year: '2014', role: 'Musician', desc: 'Began professional stage operations' },
            { year: '2016', role: 'Producer', desc: 'Established Nova Studios' },
            { year: '2018', role: 'Composer', desc: 'Contracted sound scorer for cinematic releases' },
            { year: '2020', role: 'Founder', desc: 'Launched full-service production venture' },
            { year: '2022', role: 'Educator', desc: 'Appointed Guest Lecturer at CTMI' }
        ],
        country_of_residence: 'South Africa',
        province: 'Western Cape',
        city: 'Cape Town',
        nationality_code: 'ZA',
        preferred_language: 'en',
        preferred_timezone: 'Africa/Johannesburg',
        account_status: 'active',
        profile_version: 1,
        created_at: '2024-01-15T09:00:00Z',
        updated_at: '2026-07-10T14:30:00Z',
        pronouns: 'He/Him',
        languages: ['English', 'isiZulu'],
        company: 'Nova Studios',
        identifiers: [
            { type: 'ISNI', fullName: 'International Standard Name Identifier', value: '0000-0001-2345-6789', status: 'Active', issuer: 'ISNI International', date: '2026-03-11', purpose: 'Global creator identity', uses: ['Libraries', 'Publishers', 'Music databases', 'Rights organisations'], registry_link: 'https://isni.org', domain: 'Creative Identity' },
            { type: 'ORCID', fullName: 'Open Researcher and Contributor ID', value: '0000-0002-1234-5678', status: 'Active', issuer: 'ORCID Joint Registry', date: '2026-04-01', purpose: 'Academic & research contributor identification', uses: ['Universities', 'Research profiles', 'Scholarly databases'], registry_link: 'https://orcid.org', domain: 'Academic Identity' },
            { type: 'IPI', fullName: 'Interested Parties Information Name Number', value: '00123456789', status: 'Active', issuer: 'SAMRO / CISAC', date: '2025-09-18', purpose: 'Rightsholder identification', uses: ['CMOs', 'Publishers', 'Mechanical societies', 'DSP administration'], registry_link: '#', domain: 'Music Rights' },
            { type: 'ISRC', fullName: 'International Standard Recording Code', value: 'ZA-AAA-26-00001', status: 'Allocated', issuer: 'SAMPRA', date: '2026-01-10', purpose: 'Unique tracking identifier for sound recordings', uses: ['DSPs', 'Radio stations', 'Video platforms', 'Music metadata services'], registry_link: '#', domain: 'Music Rights' },
            { type: 'ISWC', fullName: 'International Standard Musical Work Code', value: 'T-000000000-1', status: 'Active', issuer: 'CISAC Universal', date: '2026-02-15', purpose: 'Unique identifier for musical works', uses: ['CMOs', 'Music publishers', 'Digital networks', 'Metadata systems'], registry_link: '#', domain: 'Music Rights' }
        ]
    };
}

function getFallbackEmployment() {
    return [
        { id: 'emp-1', user_id: 'user-123', organization_name: 'Nova Studios', organization_type: 'production_house', relationship_type: 'founder', job_title: 'Creative Director & Lead Producer', employment_type: 'full_time', start_date: '2020-01-01', end_date: null, is_current: true, description: 'Leading music production and creative strategy.', website: 'https://novastudios.co.za', logo_url: null, is_public: true, display_order: 0 },
        { id: 'emp-2', user_id: 'user-123', organization_name: 'AfroSonic Records', organization_type: 'record_label', relationship_type: 'employee', job_title: 'Senior Music Producer', employment_type: 'contract', start_date: '2018-06-01', end_date: '2019-12-31', is_current: false, description: 'Produced tracks for emerging African artists.', website: 'https://afrosonic.com', logo_url: null, is_public: true, display_order: 1 },
        { id: 'emp-3', user_id: 'user-123', organization_name: 'Cape Town Music Institute', organization_type: 'educational', relationship_type: 'freelancer', job_title: 'Guest Lecturer — Music Production', employment_type: 'part_time', start_date: '2022-09-01', end_date: null, is_current: true, description: 'Teaching music production techniques.', website: 'https://ctmi.edu.za', logo_url: null, is_public: true, display_order: 2 }
    ];
}

// ─── RENDER FUNCTIONS ──────────────────────────────────────────────────────
function renderProfile() {
    const p = _profileData || getFallbackData();

    // Header info
    document.getElementById('profileDisplayName').textContent = p.display_name || '—';
    document.getElementById('profileArtisticName').textContent = p.artistic_name || '—';
    document.getElementById('profileSeekReapID').textContent = p.seekreap_id || '—';
    document.getElementById('profilePronouns').textContent = p.pronouns || 'He/Him';

    // Location
    const country = p.country_of_residence || '—';
    const province = p.province || '—';
    const city = p.city || '—';
    document.getElementById('profileLocationText').textContent = country + ' • ' + province + ' • ' + city;

    // Verification badge
    const verifyMap = {
        'none': { class: 'badge-unverified', label: 'Unverified', icon: 'fa-circle' },
        'email': { class: 'badge-verified', label: 'Email Verified', icon: 'fa-envelope' },
        'phone': { class: 'badge-verified', label: 'Phone Verified', icon: 'fa-phone' },
        'identity': { class: 'badge-verified', label: 'Identity Verified', icon: 'fa-id-card' },
        'organization': { class: 'badge-verified', label: 'Organization Verified', icon: 'fa-building' },
        'verified_creator': { class: 'badge-verified', label: 'Verified Creator', icon: 'fa-star' }
    };
    const v = verifyMap[p.verification_status] || verifyMap['none'];
    document.getElementById('verifyBadge').className = 'badge-pill ' + v.class;
    document.getElementById('verifyBadge').innerHTML = '<i class="fas ' + v.icon + '"></i> ' + v.label;

    // Type badge
    const typeMap = { creator: { class: 'badge-creator', label: 'Creator' }, member: { class: 'badge-member', label: 'Member' } };
    const t = typeMap[p.user_type] || typeMap.member;
    document.getElementById('typeBadge').className = 'badge-pill ' + t.class;
    document.getElementById('typeBadge').innerHTML = '<i class="fas fa-user"></i> ' + t.label;

    // Bio
    document.getElementById('profileBioText').textContent = p.biography || '—';

    // Role tags
    const roleTags = (p.profile_roles || []).map(function(r) { return r.title; }).join(' • ');
    document.getElementById('profileRolesText').textContent = roleTags || 'No roles added';

    // Sidebar avatar
    const initial = (p.display_name || 'S')[0].toUpperCase();
    document.getElementById('sideAvatar').textContent = initial;
    document.getElementById('sideName').textContent = (p.display_name || 'User').split(' ')[0];

    // Member since
    const memberSince = p.created_at ? new Date(p.created_at).getFullYear() : '2012';
    document.getElementById('memberSinceBadge').innerHTML = '<i class="far fa-calendar-alt"></i> Member since ' + memberSince;

    // Identity Record
    renderIdentity(p);

    // Accomplishments
    renderAccomplishments();

    // Employment
    renderEmployment();

    // Identifiers (Passports)
    renderIdentifiers(p);

    // Roles
    renderRoles(p);

    // Timeline
    renderTimeline(p);

    // Networks
    renderNetworks(p.social_links, p.website_urls);
}

function renderIdentity(p) {
    const identityContainer = document.getElementById('identityContainer');
    if (!identityContainer) return;

    const categories = {
        'Personal Details': [
            { label: 'SeekReap ID', value: p.seekreap_id || '—', mono: true },
            { label: 'Legal Full Name', value: p.legal_full_name || '—' },
            { label: 'Title', value: p.title || '—' },
            { label: 'Gender', value: p.gender || '—' },
            { label: 'Date of Birth', value: p.date_of_birth || '—' },
            { label: 'Identity Number (Last 4)', value: p.identity_number_last4 || '—', mono: true },
            { label: 'Passport Number (Last 4)', value: p.passport_number_last4 || '—', mono: true },
            { label: 'Pronouns', value: p.pronouns || '—' },
            { label: 'Country Code', value: p.country_code || '—' },
            { label: 'Province Code', value: p.province_code || '—' },
            { label: 'Nationality Code', value: p.nationality_code || '—' }
        ],
        'Creative Details': [
            { label: 'Display Name', value: p.display_name || '—' },
            { label: 'Artistic Name', value: p.artistic_name || '—' },
            { label: 'Artistic Slug', value: p.artistic_slug ? '@' + p.artistic_slug : '—', mono: true },
            { label: 'Location', value: p.country_of_residence || '—' },
            { label: 'City', value: p.city || '—' },
            { label: 'Company', value: p.company || '—' },
            { label: 'Profile Version', value: p.profile_version || '—' }
        ],
        'Contact Details': [
            { label: 'Recovery Email', value: p.recovery_email ? '<a href="mailto:' + p.recovery_email + '">' + p.recovery_email + '</a>' : '—', html: true },
            { label: 'Primary Phone', value: p.primary_phone ? '<a href="tel:' + p.primary_phone.replace(/\s/g, '') + '">' + p.primary_phone + '</a>' : '—', html: true },
            { label: 'Secondary Phone', value: p.secondary_phone || '—' },
            { label: 'Contact Preference', value: p.contact_preference || '—' },
            { label: 'Preferred Language', value: p.preferred_language || '—' },
            { label: 'Preferred Timezone', value: p.preferred_timezone || '—' }
        ]
    };

    let html = '';
    const iconMap = { 'Personal Details': 'fa-user-shield', 'Creative Details': 'fa-paint-brush', 'Contact Details': 'fa-envelope-open-text' };
    for (const catName in categories) {
        const fields = categories[catName];
        if (fields.length === 0) continue;
        html += '<div class="identity-category"><div class="cat-title"><i class="fas ' + (iconMap[catName] || 'fa-tag') + '"></i> ' + catName + '</div>';
        for (const f of fields) {
            const editAttr = _isEditMode ? ' onclick="editField(\'' + f.label + '\', \'' + (f.value || '').replace(/'/g, "\\'") + '\')" style="cursor:pointer;"' : '';
            html += '<div class="identity-field"><span class="ilabel">' + f.label + '</span><span class="ivalue ' + (f.mono ? 'mono' : '') + '"' + editAttr + '>' + (f.html ? f.value : f.value) + '</span></div>';
        }
        html += '</div>';
    }
    identityContainer.innerHTML = html;
}

function renderAccomplishments() {
    const achievements = [
        { icon: 'fa-trophy', title: '2x South African Music Award Winner', category: 'Award', date: '2023, 2025' },
        { icon: 'fa-globe-africa', title: 'Featured artist at Afropunk Festival 2025', category: 'Festival', date: '2025' },
        { icon: 'fa-compact-disc', title: 'Album "Nova Dawn" — 5M+ streams', category: 'Release', date: '2024' },
        { icon: 'fa-star', title: 'Collaborated with 15+ international artists', category: 'Collaboration', date: '2016—Present' },
        { icon: 'fa-certificate', title: '311+ verified certificates issued', category: 'Credentials', date: '2020—Present' }
    ];
    document.getElementById('achievementsList').innerHTML = achievements.map(a =>
        '<div class="achievement-card"><div class="ach-icon"><i class="fas ' + a.icon + '"></i></div><div class="ach-details"><div class="ach-category">' + a.category + '</div><div class="ach-title">' + a.title + '</div></div><div class="ach-date">' + a.date + '</div></div>'
    ).join('');
}

function renderEmployment() {
    const container = document.getElementById('employmentContainer');
    const employment = _employmentData || [];
    if (!employment || employment.length === 0) {
        container.innerHTML = '<div class="employment-empty"><i class="fas fa-briefcase"></i>No employment history added yet</div>';
        return;
    }
    const sorted = employment.slice().sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    const orgTypeIcons = { 'production_house': 'fa-building', 'record_label': 'fa-music', 'educational': 'fa-graduation-cap', 'publishing': 'fa-book', 'management': 'fa-users', 'studio': 'fa-microphone', 'freelance': 'fa-user-tie', 'other': 'fa-briefcase' };
    const employmentTypeLabels = { 'full_time': 'Full-time', 'part_time': 'Part-time', 'contract': 'Contract', 'freelance': 'Freelance', 'internship': 'Internship', 'volunteer': 'Volunteer' };
    const relationshipLabels = { 'founder': 'Founder', 'co_founder': 'Co-Founder', 'employee': 'Employee', 'freelancer': 'Freelancer', 'contractor': 'Contractor', 'consultant': 'Consultant', 'board_member': 'Board Member', 'advisor': 'Advisor' };

    let html = '<div class="employment-list">';
    sorted.forEach(emp => {
        const icon = orgTypeIcons[emp.organization_type] || 'fa-building';
        const startDate = emp.start_date ? new Date(emp.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—';
        const endDate = emp.end_date ? new Date(emp.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Present';
        const dateStr = startDate + ' — ' + endDate;
        const empTypeLabel = employmentTypeLabels[emp.employment_type] || emp.employment_type || '';
        const relLabel = relationshipLabels[emp.relationship_type] || emp.relationship_type || '';

        html += '<div class="employment-item"><div class="org-icon ' + (emp.logo_url ? 'has-logo' : '') + '">' + (emp.logo_url ? '<img src="' + emp.logo_url + '" alt="' + emp.organization_name + '" onerror="this.style.display=\'none\';this.parentElement.classList.remove(\'has-logo\');this.parentElement.innerHTML=\'<i class=\\\'fas ' + icon + '\\\'></i>\';">' : '<i class="fas ' + icon + '"></i>') + '</div>' +
            '<div class="org-details"><div class="org-name">' + emp.organization_name + '</div><div class="job-title">' + (emp.job_title || '—') + '</div>' +
            '<div class="org-meta"><span><i class="far fa-calendar"></i> ' + dateStr + '</span>' + (emp.is_current ? '<span class="current-badge"><i class="fas fa-check-circle"></i> Current</span>' : '') + (emp.employment_type ? '<span><i class="fas fa-clock"></i> ' + empTypeLabel + '</span>' : '') + (emp.relationship_type ? '<span><i class="fas fa-user-tag"></i> ' + relLabel + '</span>' : '') + (emp.organization_type ? '<span><i class="fas fa-tag"></i> ' + emp.organization_type.replace('_', ' ').toUpperCase() + '</span>' : '') + '</div>' +
            (emp.description ? '<div class="org-description">' + emp.description + '</div>' : '') + (emp.website ? '<div class="org-website"><a href="' + emp.website + '" target="_blank"><i class="fas fa-globe"></i> ' + emp.website.replace(/^https?:\/\//, '') + '</a></div>' : '') + '</div></div>';
    });
    html += '</div>';
    container.innerHTML = html;
}

function renderIdentifiers(p) {
    const identifiersContainer = document.getElementById('identifiersContainer');
    if (!identifiersContainer) return;

    const domains = [];
    (p.identifiers || []).forEach(id => {
        if (domains.indexOf(id.domain) === -1) domains.push(id.domain);
    });

    let domainsHtml = '<div class="identifiers-layout">';
    domains.forEach(domain => {
        const list = (p.identifiers || []).filter(id => id.domain === domain);
        domainsHtml += '<div class="identifier-group"><div class="identifier-group-name">' + domain + '</div><div class="identifier-cards">';
        list.forEach(id => {
            domainsHtml += '<div class="passport-card" id="passport-card-' + id.type.toLowerCase() + '" onclick="highlightConnectedRoles(\'' + id.type + '\')">' +
                '<div class="passport-header"><div class="passport-meta"><span class="passport-type">' + id.type + '</span><span class="passport-full-name">' + id.fullName + '</span></div>' +
                '<span class="passport-status ' + (id.status === 'Active' ? 'status-verified' : 'status-allocated') + '"><i class="fas ' + (id.status === 'Active' ? 'fa-check-circle' : 'fa-clock') + '"></i> ' + id.status + '</span></div>' +
                '<div class="passport-value-container"><span class="passport-value">' + id.value + '</span><button class="passport-copy-btn" onclick="event.stopPropagation(); copyToClipboard(\'' + id.value + '\')"><i class="far fa-copy"></i></button></div>' +
                '<div class="passport-details"><div class="passport-detail-item"><span class="p-label">Purpose</span><span class="p-val">' + id.purpose + '</span></div>' +
                '<div class="passport-detail-item"><span class="p-label">Issued By</span><span class="p-val">' + id.issuer + '</span></div>' +
                '<div class="passport-detail-item"><span class="p-label">Issued Date</span><span class="p-val">' + id.date + '</span></div></div>' +
                '<div class="passport-ecosystem"><span class="ecosystem-label">Verified Uses</span><div class="ecosystem-tags">' + (id.uses || []).map(u => '<span class="eco-tag">✓ ' + u + '</span>').join('') + '</div></div>' +
                '<div class="passport-actions"><a class="passport-btn p-btn-secondary" onclick="event.stopPropagation(); copyToClipboard(\'' + id.value + '\')">Copy Code</a><a href="' + id.registry_link + '" target="_blank" class="passport-btn p-btn-primary" onclick="event.stopPropagation();">View Registry <i class="fas fa-external-link-alt"></i></a></div>' +
            '</div>';
        });
        domainsHtml += '</div></div>';
    });
    domainsHtml += '</div>';
    identifiersContainer.innerHTML = domainsHtml;
}

function renderRoles(p) {
    const rolesContainer = document.getElementById('rolesContainer');
    if (!rolesContainer) return;

    rolesContainer.innerHTML = (p.profile_roles || []).map(role => {
        const stars = '★'.repeat(role.rating) + '☆'.repeat(5 - role.rating);
        const badgeClass = role.tier === 'Primary Role' ? 'role-primary' : role.tier === 'Secondary Role' ? 'role-secondary' : 'role-mentor';
        return '<div class="role-card" id="role-card-' + role.title.toLowerCase() + '" onclick="highlightConnectedIdentifiers(\'' + role.title + '\')">' +
            '<div class="role-header"><div><span class="role-title">' + role.title + '</span><div class="role-proficiency"><span class="role-stars">' + stars + '</span><span>Level ' + role.rating + '/5</span></div></div>' +
            '<span class="role-badge ' + badgeClass + '">' + role.tier + '</span></div>' +
            '<div class="role-stats-grid"><div class="role-stat"><div class="role-stat-val">' + role.works + '</div><div class="role-stat-lbl">Works</div></div>' +
            '<div class="role-stat"><div class="role-stat-val">' + role.collabs + '</div><div class="role-stat-lbl">Collabs</div></div>' +
            '<div class="role-stat"><div class="role-stat-val">' + role.active + '</div><div class="role-stat-lbl">Active</div></div></div>' +
            '<div class="role-details-list"><div class="role-detail-row"><span class="r-lbl">Years Active:</span><span class="r-val">' + role.period + '</span></div>' +
            '<div class="role-detail-row"><span class="r-lbl">Key Expertise:</span><span class="r-val">' + (role.expertise || []).join(', ') + '</span></div>' +
            '<div class="role-detail-row"><span class="r-lbl">Industries:</span><span class="r-val">' + (role.industries || []).join(', ') + '</span></div></div></div>';
    }).join('');
}

function renderTimeline(p) {
    const timelineContainer = document.getElementById('timelineContainer');
    if (!timelineContainer) return;

    timelineContainer.innerHTML = (p.timeline || []).map(t =>
        '<div class="timeline-item"><div class="timeline-dot"></div><div class="timeline-year">' + t.year + '</div><div class="timeline-content">' + t.role + '</div><div class="timeline-desc">' + t.desc + '</div></div>'
    ).join('');
}

function renderNetworks(socials, websites) {
    const networksContainer = document.getElementById('networksContainer');
    if (!networksContainer) return;

    let html = '<div class="social-links">';
    if (websites && websites.length > 0) {
        html += '<a href="' + websites[0].url + '" target="_blank" class="social-link"><span><i class="fas fa-globe" style="margin-right:8px;color:var(--primary);"></i> Official Website</span><i class="fas fa-external-link-alt"></i></a>';
    }
    if (socials) {
        const icons = { github: 'fa-github', instagram: 'fa-instagram', x: 'fa-x-twitter', youtube: 'fa-youtube', linkedin: 'fa-linkedin' };
        const labels = { github: 'GitHub', instagram: 'Instagram', x: 'X', youtube: 'YouTube', linkedin: 'LinkedIn' };
        for (const key in socials) {
            if (socials.hasOwnProperty(key)) {
                const url = socials[key];
                html += '<a href="' + url + '" target="_blank" class="social-link"><span><i class="fab ' + (icons[key] || 'fa-link') + '" style="margin-right:8px;color:var(--text-dim);"></i> ' + (labels[key] || key) + '</span><i class="fas fa-external-link-alt"></i></a>';
            }
        }
    }
    html += '</div>';
    networksContainer.innerHTML = html;
}

// ─── HIGHLIGHT CONNECTIONS ──────────────────────────────────────────────────
function highlightConnectedRoles(idType) {
    document.querySelectorAll('.role-card').forEach(c => c.classList.remove('highlighted'));
    document.querySelectorAll('.passport-card').forEach(c => c.classList.remove('highlighted'));
    const roles = _profileData.profile_roles || [];
    roles.forEach(r => {
        if (r.id_link && r.id_link.includes(idType)) {
            const card = document.getElementById('role-card-' + r.title.toLowerCase());
            if (card) card.classList.add('highlighted');
        }
    });
}

function highlightConnectedIdentifiers(roleTitle) {
    document.querySelectorAll('.role-card').forEach(c => c.classList.remove('highlighted'));
    document.querySelectorAll('.passport-card').forEach(c => c.classList.remove('highlighted'));
    const role = (_profileData.profile_roles || []).find(r => r.title === roleTitle);
    if (role && role.id_link) {
        role.id_link.forEach(idType => {
            const card = document.getElementById('passport-card-' + idType.toLowerCase());
            if (card) card.classList.add('highlighted');
        });
    }
}

// ─── COPY TO CLIPBOARD ──────────────────────────────────────────────────────
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Copied: "' + text + '"', 'success');
    }).catch(() => {
        showToast('Unable to copy', 'error');
    });
}

// ─── LOAD PROFILE ────────────────────────────────────────────────────────────
async function loadProfile() {
    try {
        const data = await apiFetch('/api/creators/me');
        _profileData = data;
    } catch (e) {
        console.warn('Using fallback profile data:', e);
        _profileData = getFallbackData();
    }
    try {
        const employment = await apiFetch('/api/creators/me/employment');
        _employmentData = employment;
    } catch (e) {
        console.warn('Using fallback employment data:', e);
        _employmentData = getFallbackEmployment();
    }
    renderProfile();
    renderEmployment();
}

// ─── UPDATE PROFILE ──────────────────────────────────────────────────────────
async function updateProfile(field, value) {
    try {
        const result = await apiFetch('/api/creators/me', {
            method: 'PATCH',
            body: JSON.stringify({ [field]: value })
        });
        showToast('Profile updated successfully', 'success');
        await loadProfile();
        return result;
    } catch (e) {
        showToast('Failed to update: ' + e.message, 'error');
        return null;
    }
}

// ─── EDIT MODE ──────────────────────────────────────────────────────────────
function toggleEditMode() {
    _isEditMode = !_isEditMode;
    renderProfile();
    renderEmployment();
    showToast(_isEditMode ? 'Edit mode enabled — click any field to edit' : 'Edit mode disabled', 'info');
}

function refreshSimulation() {
    _profileData = getFallbackData();
    _employmentData = getFallbackEmployment();
    renderProfile();
    renderEmployment();
    showToast('Profile refreshed with simulation records', 'success');
}

async function editField(label, currentValue) {
    if (!_isEditMode) return;
    const newValue = prompt('Edit ' + label + ':', currentValue);
    if (newValue !== null && newValue !== currentValue) {
        const fieldMap = {
            'Display Name': 'display_name',
            'Artistic Name': 'artistic_name',
            'Legal Full Name': 'legal_full_name',
            'Title': 'title',
            'Gender': 'gender',
            'Date of Birth': 'date_of_birth',
            'Identity Number (Last 4)': 'identity_number_last4',
            'Passport Number (Last 4)': 'passport_number_last4',
            'Country Code': 'country_code',
            'Province Code': 'province_code',
            'Recovery Email': 'recovery_email',
            'Primary Phone': 'primary_phone',
            'Secondary Phone': 'secondary_phone',
            'Contact Preference': 'contact_preference',
            'Country of Residence': 'country_of_residence',
            'Province': 'province',
            'City': 'city',
            'Nationality Code': 'nationality_code',
            'Preferred Language': 'preferred_language',
            'Preferred Timezone': 'preferred_timezone',
            'Account Status': 'account_status',
            'Profile Version': 'profile_version',
            'Pronouns': 'pronouns'
        };
        const field = fieldMap[label];
        if (field) {
            await updateProfile(field, newValue);
        } else {
            showToast('Updated ' + label + ' to "' + newValue + '" (simulated)', 'success');
            renderProfile();
        }
    }
}

// ─── EXPOSE GLOBALLY ────────────────────────────────────────────────────────
window.loadProfile = loadProfile;
window.toggleEditMode = toggleEditMode;
window.refreshSimulation = refreshSimulation;
window.editField = editField;
window.copyToClipboard = copyToClipboard;
window.highlightConnectedRoles = highlightConnectedRoles;
window.highlightConnectedIdentifiers = highlightConnectedIdentifiers;
window.showToast = showToast;
