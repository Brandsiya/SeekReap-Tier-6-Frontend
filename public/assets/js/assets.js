/**
 * SeekReap · Assets Page - Final
 * Asset Command Center with full Tier-4 integration readiness
 * Updated: Clickable cards, fixed connected assets navigation, badge CSS
 */

const TIER4 = 'https://seekreap-tier-4-orchestrator-1.onrender.com';
let _assets = [];
let _selectedAssets = new Set();
let _currentView = 'grid';
let _jwt = null;

// ── Sample Data with Connected Records ──────────────────────────────────────

const SAMPLE_ASSETS = [
    { 
        id: 'SR-A-000012', 
        title: 'Summer Nights', 
        type: 'music', 
        status: 'certified', 
        ownership: 100, 
        rights: 8, 
        agreements: 3, 
        licenses: 4, 
        delegations: 2, 
        revenue: 12400,
        health: 'excellent',
        certified: true,
        certDate: '2026-06-12',
        certScore: 98,
        connectedAssets: [
            { id: 'SR-AGR-0051', type: 'agreement', title: 'Podcast Distribution Agreement' },
            { id: 'SR-LIC-0044', type: 'license', title: 'Commercial Use License' },
            { id: 'SR-LIC-0048', type: 'license', title: 'Broadcast License' }
        ],
        timeline: [
            { event: 'Registered', date: '2026-01-15', type: 'registered' },
            { event: 'Certified', date: '2026-01-20', type: 'certified' },
            { event: 'Agreement Created', date: '2026-02-01', type: 'agreement' },
            { event: 'License Issued', date: '2026-03-01', type: 'license' },
            { event: 'Revenue Received', date: '2026-06-01', type: 'revenue' }
        ],
        linkedObjects: {
            agreements: [
                { id: 'SR-AGR-0051', title: 'Podcast Distribution Agreement', status: 'active' },
                { id: 'SR-AGR-0052', title: 'Sync Licensing Agreement', status: 'pending' }
            ],
            licenses: [
                { id: 'SR-LIC-0044', title: 'Commercial Use License', status: 'active' },
                { id: 'SR-LIC-0048', title: 'Broadcast License', status: 'active' }
            ],
            delegations: [
                { id: 'SR-DEL-0012', title: 'Distribution Delegation', status: 'active' }
            ]
        }
    },
    { 
        id: 'SR-A-000041', 
        title: 'Photograph Collection 2026', 
        type: 'image', 
        status: 'licensed', 
        ownership: 50, 
        rights: 12, 
        agreements: 5, 
        licenses: 9, 
        delegations: 1, 
        revenue: 8500,
        health: 'healthy',
        certified: true,
        certDate: '2026-02-10',
        certScore: 92,
        connectedAssets: [
            { id: 'SR-AGR-0053', type: 'agreement', title: 'Photography Rights Agreement' },
            { id: 'SR-LIC-0050', type: 'license', title: 'Print License' }
        ],
        timeline: [
            { event: 'Registered', date: '2026-02-01', type: 'registered' },
            { event: 'Certified', date: '2026-02-10', type: 'certified' },
            { event: 'Agreement Created', date: '2026-02-15', type: 'agreement' },
            { event: 'License Issued', date: '2026-03-15', type: 'license' }
        ],
        linkedObjects: {
            agreements: [
                { id: 'SR-AGR-0053', title: 'Photography Rights Agreement', status: 'active' }
            ],
            licenses: [
                { id: 'SR-LIC-0050', title: 'Print License', status: 'active' }
            ],
            delegations: [
                { id: 'SR-DEL-0015', title: 'Print Rights Delegation', status: 'active' }
            ]
        }
    },
    { 
        id: 'SR-A-000073', 
        title: 'Code Symphony Library', 
        type: 'software', 
        status: 'delegated', 
        ownership: 100, 
        rights: 6, 
        agreements: 2, 
        licenses: 7, 
        delegations: 3, 
        revenue: 32000,
        health: 'excellent',
        certified: true,
        certDate: '2026-01-05',
        certScore: 95,
        connectedAssets: [],
        timeline: [
            { event: 'Registered', date: '2026-01-01', type: 'registered' },
            { event: 'Certified', date: '2026-01-05', type: 'certified' },
            { event: 'Delegation Created', date: '2026-02-01', type: 'delegation' },
            { event: 'License Issued', date: '2026-03-01', type: 'license' }
        ],
        linkedObjects: {
            agreements: [
                { id: 'SR-AGR-0048', title: 'Software License Agreement', status: 'active' }
            ],
            licenses: [
                { id: 'SR-LIC-0032', title: 'Enterprise License', status: 'active' }
            ],
            delegations: [
                { id: 'SR-DEL-0018', title: 'Support Delegation', status: 'active' }
            ]
        }
    },
    { 
        id: 'SR-A-000089', 
        title: 'AI Training Dataset v2', 
        type: 'dataset', 
        status: 'registered', 
        ownership: 100, 
        rights: 4, 
        agreements: 1, 
        licenses: 2, 
        delegations: 0, 
        revenue: 0,
        health: 'healthy',
        certified: false,
        certDate: null,
        certScore: 0,
        connectedAssets: [],
        timeline: [
            { event: 'Registered', date: '2026-06-01', type: 'registered' }
        ],
        linkedObjects: {
            agreements: [],
            licenses: [],
            delegations: []
        }
    }
];

const TYPE_ICONS = {
    music: 'fa-headphones',
    video: 'fa-video',
    image: 'fa-image',
    document: 'fa-file-alt',
    software: 'fa-code',
    dataset: 'fa-database',
    trademark: 'fa-trademark',
    patent: 'fa-gavel',
    nft: 'fa-cube',
    other: 'fa-file'
};

// ── Core Functions ───────────────────────────────────────────────────────────

function _getJwt() {
    if (_jwt) return _jwt;
    if (window.supabaseClient) {
        try {
            const sessionPromise = window.supabaseClient.auth.getSession();
            if (sessionPromise && typeof sessionPromise.then === 'function') {
                sessionPromise.then(({ data: { session } }) => {
                    _jwt = session?.access_token || null;
                });
            }
        } catch (e) { /* ignore */ }
        window.supabaseClient.auth.onAuthStateChange((_, s) => { _jwt = s?.access_token || null; });
    }
    return _jwt;
}

async function _apiFetch(path, opts = {}) {
    const jwt = await _getJwt();
    const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
    if (jwt) headers['Authorization'] = 'Bearer ' + jwt;
    const res = await fetch(TIER4 + path, { ...opts, headers });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || err.detail || 'HTTP ' + res.status);
    }
    return res.json();
}

document.addEventListener('DOMContentLoaded', async () => {
    if (typeof window.waitForAuth === 'function') {
        const user = await window.waitForAuth();
        if (!user) { window.location.href = '/signup_signin.html'; return; }
        _setUserDisplay(user);
    }
    await loadAssets();
    _bindEvents();
});

function _setUserDisplay(user) {
    const name = user.user_metadata?.display_name || user.email?.split('@')[0] || 'Creator';
    const el = document.getElementById('userNameNav');
    const av = document.getElementById('userAvatarNav');
    if (el) el.textContent = name.slice(0, 14);
    if (av) av.textContent = name[0].toUpperCase();
}

async function loadAssets() {
    try {
        _assets = JSON.parse(JSON.stringify(SAMPLE_ASSETS));
        renderSummary();
        renderAssets();
    } catch (e) {
        console.warn('Using sample data:', e);
        _assets = JSON.parse(JSON.stringify(SAMPLE_ASSETS));
        renderSummary();
        renderAssets();
    }
}

// ── Render Functions ─────────────────────────────────────────────────────────

function renderSummary() {
    const total = _assets.length;
    const licenses = _assets.reduce((s, a) => s + a.licenses, 0);
    const agreements = _assets.reduce((s, a) => s + a.agreements, 0);
    const revenue = _assets.reduce((s, a) => s + a.revenue, 0);
    setText('totalAssets', total);
    setText('activeLicenses', licenses);
    setText('totalAgreements', agreements);
    setText('revenueYTD', '$' + revenue.toLocaleString());
}

function renderAssets() {
    const container = document.getElementById('assetsGrid');
    if (!container) return;
    
    const filtered = _getFilteredAssets();
    if (!filtered.length) {
        container.innerHTML = `<div class="empty-state" style="grid-column:1/-1; text-align:center; padding:60px; color:var(--text-dim);">
            <i class="fas fa-folder-open" style="font-size:48px; opacity:0.3; margin-bottom:16px;"></i>
            <p>No assets found matching your filters</p>
        </div>`;
        return;
    }
    
    container.className = 'assets-grid' + (_currentView === 'list' ? ' list' : '');
    
    container.innerHTML = filtered.map(asset => {
        const healthClass = asset.health || 'healthy';
        const healthLabel = healthClass.charAt(0).toUpperCase() + healthClass.slice(1);
        
        return `
        <div class="asset-card ${_selectedAssets.has(asset.id) ? 'selected' : ''}" data-id="${asset.id}" onclick="handleCardClick('${asset.id}', event)">
            <input type="checkbox" class="checkbox" ${_selectedAssets.has(asset.id) ? 'checked' : ''} 
                   onclick="event.stopPropagation(); toggleSelect('${asset.id}')">
            <div class="asset-type"><i class="fas ${TYPE_ICONS[asset.type] || 'fa-file'}"></i> ${asset.type.toUpperCase()}</div>
            <div class="asset-title">${escapeHtml(asset.title)}</div>
            <div class="asset-id">${asset.id}</div>
            
            <div class="asset-health health-${healthClass}">
                <i class="fas ${healthClass === 'excellent' ? 'fa-check-circle' : healthClass === 'healthy' ? 'fa-circle' : healthClass === 'atrisk' ? 'fa-exclamation-triangle' : 'fa-times-circle'}"></i>
                ${healthLabel}
            </div>
            
            ${asset.certified ? `
                <div class="cert-badge">
                    <i class="fas fa-certificate"></i> Certified ${asset.certDate ? '· ' + asset.certDate : ''}
                    ${asset.certScore ? '· ' + asset.certScore + '%' : ''}
                </div>
            ` : ''}
            
            <div style="margin-bottom:8px;">
                <span class="status-badge status-${asset.status}">${asset.status.toUpperCase()}</span>
            </div>
            
            <div class="asset-meta">
                <div class="meta-item">
                    <div class="meta-value">${asset.ownership}%</div>
                    <div class="meta-label">Owner</div>
                </div>
                <div class="meta-item">
                    <div class="meta-value">${asset.rights}</div>
                    <div class="meta-label">Rights</div>
                </div>
                <div class="meta-item">
                    <div class="meta-value">${asset.agreements}</div>
                    <div class="meta-label">Agreements</div>
                </div>
                <div class="meta-item">
                    <div class="meta-value">${asset.licenses}</div>
                    <div class="meta-label">Licenses</div>
                </div>
            </div>
            
            <div class="rights-indicator">
                ${Array.from({length: Math.min(asset.rights, 10)}, (_, i) => `<span class="rights-dot active" title="${i+1} of ${asset.rights} rights"></span>`)}
                ${asset.rights > 10 ? `<span style="font-size:9px;color:var(--text-dim);">+${asset.rights-10}</span>` : ''}
            </div>
            
            <div class="asset-relationship">
                <span><i class="fas fa-users"></i> ${asset.delegations} delegations</span>
                <span><i class="fas fa-dollar-sign"></i> $${asset.revenue.toLocaleString()}</span>
                ${asset.connectedAssets && asset.connectedAssets.length > 0 ? 
                    `<span class="connected-assets" onclick="event.stopPropagation(); showConnectedAssets('${asset.id}')"><i class="fas fa-link"></i> ${asset.connectedAssets.length} connected</span>` : ''}
                <span onclick="event.stopPropagation(); showAssetDetail('${asset.id}')" style="cursor:pointer;color:var(--primary);font-weight:600;">Details →</span>
            </div>
            
            <div class="asset-actions" onclick="event.stopPropagation();">
                <button class="btn btn-primary-action btn-sm" onclick="openAsset('${asset.id}')"><i class="fas fa-external-link-alt"></i> Open Asset</button>
                <button class="btn btn-secondary btn-sm" onclick="viewRights('${asset.id}')"><i class="fas fa-gavel"></i> Rights</button>
                <button class="btn btn-secondary btn-sm" onclick="assetMore('${asset.id}')"><i class="fas fa-ellipsis-h"></i></button>
            </div>
        </div>
        `;
    }).join('');
}

function handleCardClick(id, event) {
    // Prevent click if clicking on interactive elements
    const target = event.target;
    if (target.closest('.checkbox') || target.closest('.btn') || target.closest('.connected-assets') || target.closest('[onclick*="showAssetDetail"]')) {
        return;
    }
    showAssetDetail(id);
}

function _getFilteredAssets() {
    const search = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const type = document.getElementById('typeFilter')?.value || 'all';
    const status = document.getElementById('statusFilter')?.value || 'all';
    const ownership = document.getElementById('ownershipFilter')?.value || 'all';
    const health = document.getElementById('healthFilter')?.value || 'all';
    
    return _assets.filter(a => {
        const matchSearch = a.title.toLowerCase().includes(search) || a.id.toLowerCase().includes(search);
        const matchType = type === 'all' || a.type === type;
        const matchStatus = status === 'all' || a.status === status;
        const matchOwnership = ownership === 'all' || (ownership === 'full' ? a.ownership === 100 : a.ownership < 100);
        const matchHealth = health === 'all' || a.health === health;
        return matchSearch && matchType && matchStatus && matchOwnership && matchHealth;
    });
}

// ── User Actions ─────────────────────────────────────────────────────────────

function toggleSelect(id) {
    if (_selectedAssets.has(id)) _selectedAssets.delete(id);
    else _selectedAssets.add(id);
    renderAssets();
    updateBulkBar();
}

function updateBulkBar() {
    const bar = document.getElementById('bulkBar');
    const count = document.getElementById('bulkCount');
    if (_selectedAssets.size > 0) {
        bar.classList.add('visible');
        count.textContent = _selectedAssets.size + ' selected';
    } else {
        bar.classList.remove('visible');
    }
}

function clearBulk() {
    _selectedAssets.clear();
    renderAssets();
    updateBulkBar();
}

function setView(view) {
    _currentView = view;
    document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`.view-btn[data-view="${view}"]`)?.classList.add('active');
    renderAssets();
}

function bulkAction(action) {
    const ids = Array.from(_selectedAssets);
    const assets = _assets.filter(a => ids.includes(a.id));
    if (!assets.length) return;
    const names = assets.map(a => a.title).join(', ');
    showToast(`${action} action on ${assets.length} asset(s): ${names}`);
    clearBulk();
}

// ── Asset Detail ─────────────────────────────────────────────────────────────

function showAssetDetail(id) {
    const asset = _assets.find(a => a.id === id);
    if (!asset) return;
    document.getElementById('modalAssetTitle').textContent = asset.title;
    
    const timelineHtml = asset.timeline ? asset.timeline.map(t => `
        <div class="timeline-item">
            <div class="tl-dot ${t.type}"></div>
            <div>
                <div style="font-weight:600;font-size:13px;">${t.event}</div>
                <div style="font-size:11px;color:var(--text-dim);">${t.date}</div>
            </div>
        </div>
    `).join('') : '<div style="color:var(--text-dim);">No timeline events</div>';
    
    // Show connected records
    const linkedObjectsHtml = asset.linkedObjects ? `
        <div style="margin-top:16px;">
            <div style="font-size:11px;color:var(--text-dim);margin-bottom:8px;">Connected Records</div>
            ${asset.linkedObjects.agreements && asset.linkedObjects.agreements.length ? `
                <div style="margin-bottom:8px;">
                    <div style="font-size:11px;color:var(--text-dim);">Agreements (${asset.linkedObjects.agreements.length})</div>
                    ${asset.linkedObjects.agreements.map(a => `
                        <div class="connected-item">
                            <span>${a.title}</span>
                            <span class="badge ${a.status === 'active' ? 'badge-active' : 'badge-pending'}">${a.status}</span>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            ${asset.linkedObjects.licenses && asset.linkedObjects.licenses.length ? `
                <div style="margin-bottom:8px;">
                    <div style="font-size:11px;color:var(--text-dim);">Licenses (${asset.linkedObjects.licenses.length})</div>
                    ${asset.linkedObjects.licenses.map(l => `
                        <div class="connected-item">
                            <span>${l.title}</span>
                            <span class="badge ${l.status === 'active' ? 'badge-active' : 'badge-pending'}">${l.status}</span>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            ${asset.linkedObjects.delegations && asset.linkedObjects.delegations.length ? `
                <div style="margin-bottom:8px;">
                    <div style="font-size:11px;color:var(--text-dim);">Delegations (${asset.linkedObjects.delegations.length})</div>
                    ${asset.linkedObjects.delegations.map(d => `
                        <div class="connected-item">
                            <span>${d.title}</span>
                            <span class="badge ${d.status === 'active' ? 'badge-active' : 'badge-pending'}">${d.status}</span>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        </div>
    ` : '';
    
    document.getElementById('modalAssetBody').innerHTML = `
        <div style="display:grid;gap:16px;">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                <div style="background:var(--bg3);padding:14px;border-radius:12px;">
                    <div style="font-size:11px;color:var(--text-dim);">Asset ID</div>
                    <div style="font-family:monospace;font-size:13px;">${asset.id}</div>
                </div>
                <div style="background:var(--bg3);padding:14px;border-radius:12px;">
                    <div style="font-size:11px;color:var(--text-dim);">Type</div>
                    <div style="font-weight:600;">${asset.type.toUpperCase()}</div>
                </div>
                <div style="background:var(--bg3);padding:14px;border-radius:12px;">
                    <div style="font-size:11px;color:var(--text-dim);">Status</div>
                    <div><span class="status-badge status-${asset.status}">${asset.status.toUpperCase()}</span></div>
                </div>
                <div style="background:var(--bg3);padding:14px;border-radius:12px;">
                    <div style="font-size:11px;color:var(--text-dim);">Health</div>
                    <div class="asset-health health-${asset.health}">${asset.health.toUpperCase()}</div>
                </div>
                <div style="background:var(--bg3);padding:14px;border-radius:12px;">
                    <div style="font-size:11px;color:var(--text-dim);">Ownership</div>
                    <div style="font-size:18px;font-weight:700;color:var(--primary);">${asset.ownership}%</div>
                </div>
                <div style="background:var(--bg3);padding:14px;border-radius:12px;">
                    <div style="font-size:11px;color:var(--text-dim);">Certification</div>
                    <div>${asset.certified ? '✅ Certified ' + (asset.certScore ? asset.certScore + '%' : '') : '❌ Not Certified'}</div>
                </div>
            </div>
            
            <div style="background:var(--bg3);padding:16px;border-radius:12px;">
                <div style="font-size:11px;color:var(--text-dim);margin-bottom:8px;">Asset Relationships</div>
                <div style="display:flex;gap:12px;flex-wrap:wrap;">
                    <div style="background:var(--bg2);padding:8px 14px;border-radius:8px;"><i class="fas fa-file-signature"></i> ${asset.agreements} Agreements</div>
                    <div style="background:var(--bg2);padding:8px 14px;border-radius:8px;"><i class="fas fa-file-contract"></i> ${asset.licenses} Licenses</div>
                    <div style="background:var(--bg2);padding:8px 14px;border-radius:8px;"><i class="fas fa-user-shield"></i> ${asset.delegations} Delegations</div>
                    <div style="background:var(--bg2);padding:8px 14px;border-radius:8px;"><i class="fas fa-dollar-sign"></i> $${asset.revenue.toLocaleString()} Revenue</div>
                    ${asset.connectedAssets && asset.connectedAssets.length > 0 ? 
                        `<div style="background:var(--bg2);padding:8px 14px;border-radius:8px;"><i class="fas fa-link"></i> ${asset.connectedAssets.length} Connected Records</div>` : ''}
                </div>
            </div>
            
            <div style="background:var(--bg3);padding:16px;border-radius:12px;">
                <div style="font-size:11px;color:var(--text-dim);margin-bottom:8px;">Rights: ${asset.rights} active</div>
                <div class="rights-indicator">
                    ${Array.from({length: asset.rights}, (_, i) => `<span class="rights-dot active" title="${i+1} of ${asset.rights} rights"></span>`).join('')}
                </div>
            </div>
            
            ${linkedObjectsHtml}
            
            <div style="background:var(--bg3);padding:16px;border-radius:12px;">
                <div style="font-size:11px;color:var(--text-dim);margin-bottom:12px;">Asset Timeline</div>
                <div class="asset-timeline">${timelineHtml}</div>
            </div>
            
            <div style="display:flex;gap:8px;margin-top:8px;">
                <button class="btn btn-primary" onclick="showToast('Opening ${asset.id}')"><i class="fas fa-external-link-alt"></i> Open Asset</button>
                <button class="btn btn-secondary" onclick="closeModal('assetModal')">Close</button>
            </div>
        </div>
    `;
    document.getElementById('assetModal').classList.add('open');
}

function showConnectedAssets(id) {
    const asset = _assets.find(a => a.id === id);
    if (!asset || !asset.connectedAssets) return;
    
    document.getElementById('connectedModalTitle').textContent = `Connected Records: ${asset.title}`;
    document.getElementById('connectedModalBody').innerHTML = asset.connectedAssets.map(c => {
        // Route to appropriate detail view based on type
        let clickAction = `showToast('Viewing ${c.type}: ${c.id}')`;
        if (c.type === 'agreement') {
            clickAction = `window.location.href='/agreements.html?id=${c.id}'`;
        } else if (c.type === 'license') {
            clickAction = `window.location.href='/license_generator.html?id=${c.id}'`;
        }
        return `
            <div class="connected-item" onclick="closeModal('connectedModal'); ${clickAction}" style="cursor:pointer;">
                <div>
                    <div style="font-weight:600;">${c.title}</div>
                    <div style="font-size:11px;color:var(--text-dim);">${c.type.toUpperCase()} · ${c.id}</div>
                </div>
                <div style="font-size:11px;color:var(--text-dim);">
                    <i class="fas fa-arrow-right"></i>
                </div>
            </div>
        `;
    }).join('') || '<div style="color:var(--text-dim);">No connected records</div>';
    document.getElementById('connectedModal').classList.add('open');
}

// ── Simulations ──────────────────────────────────────────────────────────────

function simulateNewAsset() {
    const types = ['music', 'video', 'image', 'document', 'software', 'dataset', 'trademark', 'patent', 'nft'];
    const titles = ['Summer Breeze', 'Urban Lights', 'Digital Canvas', 'Cloud Symphony', 'Neon Dreams', 'Crimson Tide'];
    const healths = ['excellent', 'healthy', 'atrisk'];
    const statuses = ['registered', 'pending', 'certified', 'licensed'];
    
    const newAsset = {
        id: 'SR-A-' + String(Date.now()).slice(-6),
        title: titles[Math.floor(Math.random() * titles.length)] + ' ' + (Math.floor(Math.random() * 100) + 1),
        type: types[Math.floor(Math.random() * types.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        ownership: [100, 75, 60, 50][Math.floor(Math.random() * 4)],
        rights: Math.floor(Math.random() * 12) + 2,
        agreements: Math.floor(Math.random() * 5),
        licenses: Math.floor(Math.random() * 8),
        delegations: Math.floor(Math.random() * 3),
        revenue: Math.floor(Math.random() * 15000),
        health: healths[Math.floor(Math.random() * healths.length)],
        certified: Math.random() > 0.4,
        certDate: Math.random() > 0.4 ? new Date().toISOString().split('T')[0] : null,
        certScore: Math.floor(Math.random() * 30) + 70,
        connectedAssets: [],
        timeline: [
            { event: 'Registered', date: new Date().toISOString().split('T')[0], type: 'registered' }
        ],
        linkedObjects: {
            agreements: [],
            licenses: [],
            delegations: []
        }
    };
    _assets.unshift(newAsset);
    renderSummary();
    renderAssets();
    showToast(`New asset registered: ${newAsset.title}`);
}

function simulateImportAsset() {
    showToast('Import asset feature simulated', 'info');
}

function refreshAssets() {
    loadAssets();
    showToast('Assets refreshed');
}

function openAsset(id) {
    const asset = _assets.find(a => a.id === id);
    if (asset) {
        showToast(`Opening ${asset.title}...`, 'info');
        setTimeout(() => showAssetDetail(id), 500);
    }
}

function viewRights(id) {
    const asset = _assets.find(a => a.id === id);
    if (asset) showToast(`${asset.title}: ${asset.rights} rights active`);
}

function assetMore(id) {
    showAssetDetail(id);
}

// ── Modal Helpers ────────────────────────────────────────────────────────────

function closeModal(id) {
    document.getElementById(id).classList.remove('open');
}

function setText(id, v) { const el = document.getElementById(id); if (el) el.textContent = v; }

// ── Event Bindings ───────────────────────────────────────────────────────────

function _bindEvents() {
    document.getElementById('searchInput')?.addEventListener('input', renderAssets);
    document.getElementById('typeFilter')?.addEventListener('change', renderAssets);
    document.getElementById('statusFilter')?.addEventListener('change', renderAssets);
    document.getElementById('ownershipFilter')?.addEventListener('change', renderAssets);
    document.getElementById('healthFilter')?.addEventListener('change', renderAssets);
}

// ── Toast System ─────────────────────────────────────────────────────────────

function showToast(msg, type = 'success') {
    const t = document.createElement('div');
    t.className = 'toast';
    const icon = type === 'success' ? 'fa-check-circle' : type === 'info' ? 'fa-info-circle' : 'fa-exclamation-circle';
    const color = type === 'success' ? 'var(--primary)' : type === 'info' ? 'var(--info)' : 'var(--warning)';
    t.innerHTML = `<i class="fas ${icon}" style="margin-right:8px;color:${color};"></i> ${escapeHtml(msg)}`;
    document.body.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 2800);
}

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ── Exports ──────────────────────────────────────────────────────────────────

window.toggleSelect = toggleSelect;
window.clearBulk = clearBulk;
window.bulkAction = bulkAction;
window.setView = setView;
window.simulateNewAsset = simulateNewAsset;
window.simulateImportAsset = simulateImportAsset;
window.refreshAssets = refreshAssets;
window.openAsset = openAsset;
window.viewRights = viewRights;
window.assetMore = assetMore;
window.showAssetDetail = showAssetDetail;
window.showConnectedAssets = showConnectedAssets;
window.closeModal = closeModal;
window.handleCardClick = handleCardClick;

console.log('[assets.js] Final version loaded — Asset Command Center ready');
