/**
 * SeekReap · Enforcement Page - Production
 * 
 * Dedicated to infringement case management.
 * Does NOT manage assets, agreements, licenses, earnings, or profile.
 * 
 * Features:
 * - Case lifecycle (Open → Review → Resolved → Closed ↔ Reopen)
 * - Priority levels (Low, Medium, High, Critical)
 * - Assignment tracking
 * - Structured evidence (files + links)
 * - Structured timeline with event types
 * - Notes with author attribution
 * - Case outcome tracking
 * - Full-text search across all case fields
 * - Multi-step wizard for new cases
 * - Structured reporting (platform, party, URL)
 */

const TIER4 = 'https://seekreap-tier-4-orchestrator-1.onrender.com';
let _jwt = null;
let _cases = [];
let _currentFilter = 'all';
let _currentPriorityFilter = 'all';
let _currentSearch = '';
let _selectedCaseId = null;
let _pendingCloseCaseId = null;

// Wizard state
let _wizardStep = 1;
let _wizardData = {
    asset: '',
    assetId: '',
    platform: '',
    reportedName: '',
    reportedUrl: '',
    priority: 'medium',
    description: '',
    files: [],
    links: []
};
let _lastCaseId = 'ENF-0004';
let _newCaseId = null;

// ── Sample Data ──────────────────────────────────────────────────────────────

const SAMPLE_CASES = [
    {
        id: 'ENF-0001',
        asset: 'Summer Nights',
        assetId: 'SR-A-000012',
        platform: 'YouTube',
        reportedName: '@musicchannel',
        reportedUrl: 'https://youtube.com/watch?v=xxxx',
        priority: 'high',
        status: 'open',
        assignedTo: null,
        dateReported: '2026-06-15',
        lastUpdated: '2026-06-28',
        description: 'Unauthorized synchronization of "Summer Nights" in a commercial video without license.',
        outcome: null,
        evidence: [
            { name: 'Screenshot_01.png', type: 'image', uploaded: '2026-06-15' },
            { name: 'Video_Link.txt', type: 'url', uploaded: '2026-06-15' },
            { name: 'License_Comparison.pdf', type: 'document', uploaded: '2026-06-18' }
        ],
        timeline: [
            { type: 'CASE_CREATED', actor: 'System', timestamp: '2026-06-15 09:30' },
            { type: 'EVIDENCE_UPLOADED', actor: 'User', timestamp: '2026-06-15 10:15', metadata: { count: 3 } },
            { type: 'NOTICE_SENT', actor: 'System', timestamp: '2026-06-16 08:00' },
            { type: 'RESPONSE_RECEIVED', actor: 'Infringer', timestamp: '2026-06-20 14:30' },
            { type: 'STATUS_CHANGED', actor: 'Reviewer', timestamp: '2026-06-28 11:00', metadata: { from: 'open', to: 'review' } }
        ],
        notes: [
            { text: 'Initial review shows clear infringement. Notice sent.', author: 'System', timestamp: '2026-06-16' },
            { text: 'Response claims fair use. Need to evaluate.', author: 'Reviewer', timestamp: '2026-06-20' }
        ]
    },
    {
        id: 'ENF-0002',
        asset: 'Photograph Collection 2026',
        assetId: 'SR-A-000041',
        platform: 'Instagram',
        reportedName: '@artgallery',
        reportedUrl: 'https://instagram.com/p/xxxx',
        priority: 'medium',
        status: 'review',
        assignedTo: 'Reviewer',
        dateReported: '2026-06-20',
        lastUpdated: '2026-06-29',
        description: 'Unauthorized display of copyrighted photographs in an online gallery without attribution or license.',
        outcome: null,
        evidence: [
            { name: 'Screenshot_02.png', type: 'image', uploaded: '2026-06-20' },
            { name: 'URL_Evidence.txt', type: 'url', uploaded: '2026-06-20' }
        ],
        timeline: [
            { type: 'CASE_CREATED', actor: 'System', timestamp: '2026-06-20 11:00' },
            { type: 'EVIDENCE_UPLOADED', actor: 'User', timestamp: '2026-06-20 11:30', metadata: { count: 2 } },
            { type: 'STATUS_CHANGED', actor: 'Reviewer', timestamp: '2026-06-29 09:00', metadata: { from: 'open', to: 'review' } }
        ],
        notes: [
            { text: 'Reviewing attribution claims. No license found.', author: 'Reviewer', timestamp: '2026-06-29' }
        ]
    },
    {
        id: 'ENF-0003',
        asset: 'Code Symphony Library',
        assetId: 'SR-A-000073',
        platform: 'GitHub',
        reportedName: '@opensource-user',
        reportedUrl: 'https://github.com/xxxx',
        priority: 'critical',
        status: 'resolved',
        assignedTo: 'Legal Team',
        dateReported: '2026-06-01',
        lastUpdated: '2026-06-25',
        description: 'Unauthorized distribution of proprietary code under GPL without permission.',
        outcome: 'Removed by infringer',
        evidence: [
            { name: 'GitHub_Repo_Link.txt', type: 'url', uploaded: '2026-06-01' },
            { name: 'Code_Comparison.diff', type: 'document', uploaded: '2026-06-02' },
            { name: 'License_Agreement.pdf', type: 'document', uploaded: '2026-06-05' }
        ],
        timeline: [
            { type: 'CASE_CREATED', actor: 'System', timestamp: '2026-06-01 13:00' },
            { type: 'EVIDENCE_UPLOADED', actor: 'User', timestamp: '2026-06-02 10:00', metadata: { count: 3 } },
            { type: 'NOTICE_SENT', actor: 'System', timestamp: '2026-06-03 09:00' },
            { type: 'RESPONSE_RECEIVED', actor: 'Infringer', timestamp: '2026-06-10 16:00' },
            { type: 'STATUS_CHANGED', actor: 'System', timestamp: '2026-06-25 12:00', metadata: { from: 'review', to: 'resolved' } }
        ],
        notes: [
            { text: 'Infringer complied with removal request. Case resolved.', author: 'System', timestamp: '2026-06-25' }
        ]
    },
    {
        id: 'ENF-0004',
        asset: 'AI Training Dataset v2',
        assetId: 'SR-A-000089',
        platform: 'Kaggle',
        reportedName: '@datascientist',
        reportedUrl: 'https://kaggle.com/datasets/xxxx',
        priority: 'medium',
        status: 'closed',
        assignedTo: null,
        dateReported: '2026-05-10',
        lastUpdated: '2026-05-30',
        description: 'Unauthorized use of proprietary dataset for model training without license.',
        outcome: 'No response',
        evidence: [
            { name: 'Kaggle_Dataset_Link.txt', type: 'url', uploaded: '2026-05-10' },
            { name: 'Dataset_Comparison.csv', type: 'document', uploaded: '2026-05-12' }
        ],
        timeline: [
            { type: 'CASE_CREATED', actor: 'System', timestamp: '2026-05-10 08:30' },
            { type: 'EVIDENCE_UPLOADED', actor: 'User', timestamp: '2026-05-12 09:00', metadata: { count: 2 } },
            { type: 'NOTICE_SENT', actor: 'System', timestamp: '2026-05-14 10:00' },
            { type: 'RESPONSE_TIMEOUT', actor: 'System', timestamp: '2026-05-28 17:00' },
            { type: 'STATUS_CHANGED', actor: 'Reviewer', timestamp: '2026-05-30 16:00', metadata: { from: 'open', to: 'closed' } }
        ],
        notes: [
            { text: 'Repeated attempts to contact infringer. No response.', author: 'System', timestamp: '2026-05-28' },
            { text: 'Case closed due to lack of response and limited jurisdiction.', author: 'Reviewer', timestamp: '2026-05-30' }
        ]
    }
];

// ── JWT & API Helpers ─────────────────────────────────────────────────────────

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

// ── Initialization ─────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
    if (typeof window.waitForAuth === 'function') {
        const user = await window.waitForAuth();
        if (!user) { window.location.href = '/signup_signin.html'; return; }
        _setUserDisplay(user);
    }
    await loadCases();
});

function _setUserDisplay(user) {
    const name = user.user_metadata?.display_name || user.email?.split('@')[0] || 'Creator';
    const el = document.getElementById('userNameNav');
    const av = document.getElementById('userAvatarNav');
    if (el) el.textContent = name.slice(0, 14);
    if (av) av.textContent = name[0].toUpperCase();
}

async function loadCases() {
    try {
        const data = await _apiFetch('/api/enforcement/list').catch(() => null);
        const packages = (data && data.packages) || [];
        _cases = packages.length ? packages.map(function(p) {
            return {
                id:          p.package_id || p.id || 'ENF-0000',
                asset:       p.submission_id || '—',
                description: p.description || p.infringement_type || '—',
                status:      p.status || 'open',
                priority:    p.priority || 'medium',
                platform:    p.platform || '—',
                created:     p.created_at || new Date().toISOString(),
                evidence_hash: p.evidence_hash || '—',
            };
        }) : [];
        if (_cases.length) {
            const ids = _cases.map(c => parseInt(c.id.replace('ENF-', '')) || 0);
            _lastCaseId = 'ENF-' + String(Math.max(...ids) + 1).padStart(4, '0');
        }
    } catch (e) {
        console.warn('Using sample enforcement data:', e);
        _cases = JSON.parse(JSON.stringify(SAMPLE_CASES));
        if (_cases.length) {
            const ids = _cases.map(c => parseInt(c.id.replace('ENF-', '')) || 0);
            _lastCaseId = 'ENF-' + String(Math.max(...ids) + 1).padStart(4, '0');
        }
    }
    renderCases();
    updateSummary();
}

// ── Rendering ─────────────────────────────────────────────────────────────────

function updateSummary() {
    const open = _cases.filter(c => c.status === 'open').length;
    const review = _cases.filter(c => c.status === 'review').length;
    const resolved = _cases.filter(c => c.status === 'resolved').length;
    const closed = _cases.filter(c => c.status === 'closed').length;
    
    document.getElementById('sumOpen').textContent = open;
    document.getElementById('sumReview').textContent = review;
    document.getElementById('sumResolved').textContent = resolved;
    document.getElementById('sumClosed').textContent = closed;
}

function renderCases() {
    const tbody = document.getElementById('casesBody');
    if (!tbody) return;
    
    let filtered = _cases;
    
    if (_currentFilter !== 'all') {
        filtered = filtered.filter(c => c.status === _currentFilter);
    }
    
    if (_currentPriorityFilter !== 'all') {
        filtered = filtered.filter(c => c.priority === _currentPriorityFilter);
    }
    
    if (_currentSearch.trim()) {
        const search = _currentSearch.toLowerCase().trim();
        filtered = filtered.filter(c => {
            // Search across all relevant fields
            const searchable = [
                c.id,
                c.asset,
                c.platform,
                c.reportedName,
                c.reportedUrl,
                c.description,
                c.outcome,
                c.status,
                c.assignedTo,
                ...(c.evidence || []).map(e => e.name),
                ...(c.notes || []).map(n => n.text),
                ...(c.timeline || []).map(t => t.type.replace(/_/g, ' '))
            ].join(' ').toLowerCase();
            return searchable.includes(search);
        });
    }
    
    if (!filtered.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8">
                    <div class="empty-state">
                        <i class="fas fa-gavel"></i>
                        <p>No enforcement cases found</p>
                        <p class="empty-sub">Try adjusting your filters or create a new case</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = filtered.map(c => {
        const statusMap = {
            'open': { class: 'badge-open', label: 'Open' },
            'review': { class: 'badge-review', label: 'Under Review' },
            'resolved': { class: 'badge-resolved', label: 'Resolved' },
            'closed': { class: 'badge-closed', label: 'Closed' }
        };
        const st = statusMap[c.status] || statusMap.open;
        
        const priorityMap = {
            'low': { class: 'priority-low', label: 'Low' },
            'medium': { class: 'priority-medium', label: 'Medium' },
            'high': { class: 'priority-high', label: 'High' },
            'critical': { class: 'priority-critical', label: 'Critical' }
        };
        const pr = priorityMap[c.priority] || priorityMap.medium;
        
        const assigned = c.assignedTo || '—';
        
        return `
            <tr onclick="window.openDetail('${c.id}')" style="cursor:pointer;">
                <td class="case-id">${c.id}</td>
                <td class="case-title">${escapeHtml(c.asset)}</td>
                <td class="case-reported">${escapeHtml(c.reportedName)}</td>
                <td><span class="badge ${pr.class}">${pr.label}</span></td>
                <td><span class="badge ${st.class}">${st.label}</span></td>
                <td><span class="assignment-badge">${escapeHtml(assigned)}</span></td>
                <td>${c.dateReported}</td>
                <td style="text-align:right;">
                    <div class="case-actions" onclick="event.stopPropagation();">
                        <button class="btn btn-secondary btn-sm" onclick="window.openDetail('${c.id}')"><i class="fas fa-eye"></i></button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// ── Detail Panel ──────────────────────────────────────────────────────────────

window.openDetail = function(caseId) {
    _selectedCaseId = caseId;
    const c = _cases.find(x => x.id === caseId);
    if (!c) return;
    
    document.getElementById('detailTitle').textContent = `Case ${c.id}`;
    document.getElementById('detailOverlay').classList.add('open');
    document.getElementById('detailPanel').classList.add('open');
    document.body.style.overflow = 'hidden';
    
    const body = document.getElementById('detailBody');
    
    const statusMap = {
        'open': { class: 'badge-open', label: 'Open' },
        'review': { class: 'badge-review', label: 'Under Review' },
        'resolved': { class: 'badge-resolved', label: 'Resolved' },
        'closed': { class: 'badge-closed', label: 'Closed' }
    };
    const st = statusMap[c.status] || statusMap.open;
    
    const priorityMap = {
        'low': { class: 'priority-low', label: 'Low' },
        'medium': { class: 'priority-medium', label: 'Medium' },
        'high': { class: 'priority-high', label: 'High' },
        'critical': { class: 'priority-critical', label: 'Critical' }
    };
    const pr = priorityMap[c.priority] || priorityMap.medium;
    
    // Evidence
    const evidenceHtml = c.evidence && c.evidence.length ? c.evidence.map(e => `
        <div class="evidence-item">
            <div class="ev-icon"><i class="fas ${e.type === 'image' ? 'fa-image' : e.type === 'url' ? 'fa-link' : 'fa-file'}"></i></div>
            <div class="ev-info">
                <div class="ev-name">${escapeHtml(e.name)}</div>
                <div class="ev-meta">Uploaded ${e.uploaded}</div>
            </div>
            <div class="ev-actions">
                <button class="btn btn-secondary btn-sm" onclick="window.showToast('Viewing ${escapeHtml(e.name)}')"><i class="fas fa-eye"></i></button>
            </div>
        </div>
    `).join('') : '<div style="color:var(--text-dim);font-size:12px;">No evidence uploaded</div>';
    
    // Timeline - structured events
    const timelineHtml = c.timeline && c.timeline.length ? c.timeline.map(t => {
        const eventLabels = {
            'CASE_CREATED': 'Case created',
            'EVIDENCE_UPLOADED': `Evidence uploaded${t.metadata?.count ? ` (${t.metadata.count} items)` : ''}`,
            'NOTICE_SENT': 'Notice sent',
            'RESPONSE_RECEIVED': 'Response received',
            'RESPONSE_TIMEOUT': 'No response received',
            'STATUS_CHANGED': `Status changed${t.metadata?.from ? `: ${t.metadata.from} → ${t.metadata.to}` : ''}`,
            'NOTE_ADDED': 'Note added',
            'EVIDENCE_ADDED': 'Evidence added'
        };
        const label = eventLabels[t.type] || t.type.replace(/_/g, ' ');
        
        const dotColors = {
            'CASE_CREATED': 'primary',
            'EVIDENCE_UPLOADED': 'gold',
            'NOTICE_SENT': 'info',
            'RESPONSE_RECEIVED': 'warning',
            'RESPONSE_TIMEOUT': 'danger',
            'STATUS_CHANGED': 'warning',
            'NOTE_ADDED': 'gold',
            'EVIDENCE_ADDED': 'gold'
        };
        const dotColor = dotColors[t.type] || 'primary';
        
        return `
            <div class="timeline-item">
                <div class="tl-dot tl-dot-${dotColor}"></div>
                <div class="tl-text">${label}</div>
                <div class="tl-time">${t.timestamp}</div>
                <div class="tl-actor">— ${t.actor}</div>
            </div>
        `;
    }).join('') : '<div style="color:var(--text-dim);font-size:12px;">No timeline events</div>';
    
    // Notes
    const notesHtml = c.notes && c.notes.length ? c.notes.map(n => `
        <div class="note-item">
            <div class="note-text">${escapeHtml(n.text)}</div>
            <div class="note-meta">${n.author} · ${n.timestamp}</div>
        </div>
    `).join('') : '<div style="color:var(--text-dim);font-size:12px;">No notes</div>';
    
    // Outcome
    const outcomeHtml = (c.status === 'resolved' || c.status === 'closed') && c.outcome ? `
        <div class="detail-section">
            <div class="detail-section-title"><i class="fas fa-flag-checkered"></i> Case Outcome</div>
            <div class="outcome-box">
                <div class="outcome-label">How this case was resolved</div>
                <div class="outcome-value">${escapeHtml(c.outcome)}</div>
            </div>
        </div>
    ` : '';
    
    // Actions
    const canClose = c.status === 'open' || c.status === 'review';
    const canReopen = c.status === 'closed' || c.status === 'resolved';
    const canAssign = c.status !== 'closed';
    
    body.innerHTML = `
        <!-- Case Information -->
        <div class="detail-section">
            <div class="detail-section-title"><i class="fas fa-info-circle"></i> Case Information</div>
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Case ID</div>
                    <div class="info-value mono">${c.id}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Asset</div>
                    <div class="info-value"><a href="/assets.html?id=${c.assetId}" style="color:var(--primary);">${escapeHtml(c.asset)}</a></div>
                </div>
                <div class="info-item">
                    <div class="info-label">Platform</div>
                    <div class="info-value">${escapeHtml(c.platform)}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Reported Party</div>
                    <div class="info-value">${escapeHtml(c.reportedName)}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Priority</div>
                    <div class="info-value"><span class="badge ${pr.class}">${pr.label}</span></div>
                </div>
                <div class="info-item">
                    <div class="info-label">Current Status</div>
                    <div class="info-value"><span class="badge ${st.class}">${st.label}</span></div>
                </div>
                <div class="info-item">
                    <div class="info-label">Assigned To</div>
                    <div class="info-value">${c.assignedTo || '—'}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">URL</div>
                    <div class="info-value" style="font-size:12px;word-break:break-all;">${c.reportedUrl ? `<a href="${c.reportedUrl}" target="_blank" style="color:var(--info);">${escapeHtml(c.reportedUrl)}</a>` : '—'}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Date Reported</div>
                    <div class="info-value">${c.dateReported}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Last Updated</div>
                    <div class="info-value">${c.lastUpdated}</div>
                </div>
            </div>
        </div>
        
        ${outcomeHtml}
        
        <!-- Description -->
        <div class="detail-section">
            <div class="detail-section-title"><i class="fas fa-align-left"></i> Description</div>
            <div style="background:var(--bg3);padding:12px 14px;border-radius:10px;font-size:13px;color:var(--text-dim);">
                ${escapeHtml(c.description)}
            </div>
        </div>
        
        <!-- Evidence -->
        <div class="detail-section">
            <div class="detail-section-title"><i class="fas fa-paperclip"></i> Evidence</div>
            <div class="evidence-list">${evidenceHtml}</div>
        </div>
        
        <!-- Timeline -->
        <div class="detail-section">
            <div class="detail-section-title"><i class="fas fa-history"></i> Timeline</div>
            <div class="timeline">${timelineHtml}</div>
        </div>
        
        <!-- Notes -->
        <div class="detail-section">
            <div class="detail-section-title"><i class="fas fa-sticky-note"></i> Notes</div>
            <div class="notes-list">${notesHtml}</div>
        </div>
        
        <!-- Actions -->
        <div class="detail-section">
            <div class="detail-section-title"><i class="fas fa-tasks"></i> Actions</div>
            <div class="detail-actions">
                <button class="btn btn-secondary btn-sm" onclick="window.showToast('Add evidence feature coming soon')"><i class="fas fa-upload"></i> Add Evidence</button>
                <button class="btn btn-secondary btn-sm" onclick="window.showToast('Add note feature coming soon')"><i class="fas fa-plus"></i> Add Note</button>
                ${canAssign ? `<button class="btn btn-secondary btn-sm" onclick="window.showToast('Assignment feature coming soon')"><i class="fas fa-user-plus"></i> Assign</button>` : ''}
                ${canClose ? `<button class="btn btn-danger btn-sm" onclick="window.openCloseModal('${c.id}')"><i class="fas fa-times"></i> Close Case</button>` : ''}
                ${canReopen ? `<button class="btn btn-primary btn-sm" onclick="window.reopenCase('${c.id}')"><i class="fas fa-undo"></i> Reopen Case</button>` : ''}
            </div>
        </div>
    `;
};

window.closeDetail = function() {
    document.getElementById('detailOverlay').classList.remove('open');
    document.getElementById('detailPanel').classList.remove('open');
    document.body.style.overflow = '';
    _selectedCaseId = null;
};

// ── Close Case Modal ──────────────────────────────────────────────────────────

window.openCloseModal = function(caseId) {
    _pendingCloseCaseId = caseId;
    document.getElementById('closeOutcome').value = 'Removed by infringer';
    document.getElementById('closeNotes').value = '';
    document.getElementById('closeModalOverlay').classList.add('open');
};

window.closeCloseModal = function() {
    document.getElementById('closeModalOverlay').classList.remove('open');
    _pendingCloseCaseId = null;
};

window.confirmCloseCase = function() {
    const caseId = _pendingCloseCaseId;
    if (!caseId) return;
    
    const c = _cases.find(x => x.id === caseId);
    if (!c) return;
    
    const outcome = document.getElementById('closeOutcome').value;
    const notes = document.getElementById('closeNotes').value.trim();
    
    c.status = 'closed';
    c.outcome = outcome;
    c.lastUpdated = new Date().toISOString().slice(0, 10);
    c.timeline.push({
        type: 'STATUS_CHANGED',
        actor: 'System',
        timestamp: new Date().toISOString().slice(0, 10) + ' ' + new Date().toTimeString().slice(0, 5),
        metadata: { from: 'review', to: 'closed' }
    });
    
    if (notes) {
        c.notes.push({
            text: notes,
            author: 'System',
            timestamp: new Date().toISOString().slice(0, 10)
        });
        c.timeline.push({
            type: 'NOTE_ADDED',
            actor: 'System',
            timestamp: new Date().toISOString().slice(0, 10) + ' ' + new Date().toTimeString().slice(0, 5)
        });
    }
    
    renderCases();
    updateSummary();
    if (_selectedCaseId === caseId) openDetail(caseId);
    closeCloseModal();
    window.showToast(`Case ${caseId} closed with outcome: ${outcome}`, 'success');
};

// ── Case Actions ──────────────────────────────────────────────────────────────

window.reopenCase = function(caseId) {
    const c = _cases.find(x => x.id === caseId);
    if (!c) return;
    
    c.status = 'open';
    c.outcome = null;
    c.lastUpdated = new Date().toISOString().slice(0, 10);
    c.timeline.push({
        type: 'STATUS_CHANGED',
        actor: 'System',
        timestamp: new Date().toISOString().slice(0, 10) + ' ' + new Date().toTimeString().slice(0, 5),
        metadata: { from: 'closed', to: 'open' }
    });
    
    renderCases();
    updateSummary();
    if (_selectedCaseId === caseId) openDetail(caseId);
    window.showToast(`Case ${caseId} reopened`, 'info');
};

// ── Filters ─────────────────────────────────────────────────────────────────

window.applyFilters = function() {
    _currentFilter = document.getElementById('statusFilter').value;
    _currentPriorityFilter = document.getElementById('priorityFilter').value;
    _currentSearch = document.getElementById('searchInput').value;
    renderCases();
};

// ── New Case Wizard ──────────────────────────────────────────────────────────

window.openNewCaseWizard = function() {
    _wizardStep = 1;
    _wizardData = {
        asset: '',
        assetId: '',
        platform: '',
        reportedName: '',
        reportedUrl: '',
        priority: 'medium',
        description: '',
        files: [],
        links: []
    };
    document.getElementById('wizardAsset').value = '';
    document.getElementById('wizardReportedPlatform').value = '';
    document.getElementById('wizardReportedName').value = '';
    document.getElementById('wizardReportedUrl').value = '';
    document.getElementById('wizardPriority').value = 'medium';
    document.getElementById('wizardDescription').value = '';
    document.getElementById('uploadedFiles').innerHTML = '';
    document.getElementById('linksList').innerHTML = '';
    document.getElementById('fileInput').value = '';
    // Load real submissions into asset dropdown
    _apiFetch('/api/submissions').then(function(data) {
        const sel = document.getElementById('wizardAsset');
        if (!sel) return;
        const subs = data.submissions || data.assets || [];
        if (subs.length) {
            sel.innerHTML = '<option value="">Select a certified asset…</option>' +
                subs.map(function(s) {
                    return '<option value="' + (s.title||'').replace(/"/g,'') + '|' + (s.submission_id||s.id||'') + '">' +
                        (s.title || 'Untitled') + ' · ' + (s.submission_id||s.id||'').slice(0,8).toUpperCase() + '</option>';
                }).join('');
        }
    }).catch(function(){});
    document.getElementById('wizardOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
    updateWizard();
};

window.closeWizard = function() {
    document.getElementById('wizardOverlay').classList.remove('open');
    document.body.style.overflow = '';
};

function updateWizard() {
    document.querySelectorAll('.wizard-step').forEach(el => {
        el.classList.toggle('active', parseInt(el.dataset.step) === _wizardStep);
    });
    
    document.querySelectorAll('.step-dot').forEach(dot => {
        const step = parseInt(dot.dataset.step);
        dot.classList.toggle('active', step === _wizardStep);
        dot.classList.toggle('done', step < _wizardStep);
    });
    
    document.getElementById('wizardStepIndicator').textContent = `Step ${_wizardStep} of 4`;
    
    const isFirst = _wizardStep === 1;
    const isLast = _wizardStep === 4;
    const isReview = _wizardStep === 3;
    const isSuccess = _wizardStep === 4;
    
    document.getElementById('wizardBack').style.display = isFirst || isSuccess ? 'none' : 'inline-flex';
    document.getElementById('wizardNext').style.display = isLast || isSuccess ? 'none' : 'inline-flex';
    document.getElementById('wizardCreate').style.display = isReview ? 'inline-flex' : 'none';
    document.getElementById('wizardCancel').textContent = isSuccess ? 'Close' : 'Cancel';
    
    if (isReview) {
        const assetParts = _wizardData.asset.split('|');
        document.getElementById('reviewAsset').textContent = assetParts[0] || '—';
        document.getElementById('reviewPlatform').textContent = _wizardData.platform || '—';
        document.getElementById('reviewReported').textContent = _wizardData.reportedName || '—';
        const priorityLabels = { low: 'Low', medium: 'Medium', high: 'High', critical: 'Critical' };
        document.getElementById('reviewPriority').textContent = priorityLabels[_wizardData.priority] || 'Medium';
        document.getElementById('reviewDescription').textContent = _wizardData.description || '—';
        document.getElementById('reviewFiles').textContent = _wizardData.files.length + ' files';
        document.getElementById('reviewLinks').textContent = _wizardData.links.length + ' links';
    }
}

window.wizardNext = function() {
    if (_wizardStep === 1) {
        const asset = document.getElementById('wizardAsset').value;
        const platform = document.getElementById('wizardReportedPlatform').value.trim();
        const reportedName = document.getElementById('wizardReportedName').value.trim();
        const priority = document.getElementById('wizardPriority').value;
        const description = document.getElementById('wizardDescription').value.trim();
        
        if (!asset) { window.showToast('Please select an asset', 'error'); return; }
        if (!platform) { window.showToast('Please enter the platform', 'error'); return; }
        if (!reportedName) { window.showToast('Please enter who or what is being reported', 'error'); return; }
        if (!description) { window.showToast('Please describe what happened', 'error'); return; }
        
        const assetParts = asset.split('|');
        _wizardData.asset = asset;
        _wizardData.assetId = assetParts[1] || '';
        _wizardData.platform = platform;
        _wizardData.reportedName = reportedName;
        _wizardData.reportedUrl = document.getElementById('wizardReportedUrl').value.trim();
        _wizardData.priority = priority;
        _wizardData.description = description;
    }
    
    if (_wizardStep < 4) {
        _wizardStep++;
        updateWizard();
    }
};

window.wizardBack = function() {
    if (_wizardStep > 1) {
        _wizardStep--;
        updateWizard();
    }
};

window.wizardCreate = async function() {
    const btn = document.getElementById('wizardCreate');
    if (btn) { btn.disabled = true; btn.textContent = 'Submitting…'; }
    try {
        const assetParts = (_wizardData.asset || '').split('|');
        const submissionId = _wizardData.assetId || assetParts[1] || '';
        const result = await _apiFetch('/api/enforcement/evidence-package', {
            method: 'POST',
            body: JSON.stringify({
                submission_id:    submissionId,
                infringement_type: _wizardData.platform || 'unknown',
                platform:          _wizardData.platform || '',
                infringing_url:    _wizardData.reportedUrl || '',
                reported_party:    _wizardData.reportedName || '',
                description:       _wizardData.description || '',
                priority:          _wizardData.priority || 'medium',
                evidence_urls:     _wizardData.links || [],
            })
        });
        window.showToast('Enforcement package created: ' + (result.package_id || ''), 'success');
        window.closeWizard();
        await loadCases();
    } catch (e) {
        window.showToast('Failed: ' + e.message, 'error');
        if (btn) { btn.disabled = false; btn.textContent = 'Submit Case'; }
    }
};

// ── Evidence Handling ──────────────────────────────────────────────────────

window.handleFiles = function(files) {
    const container = document.getElementById('uploadedFiles');
    for (let f of files) {
        _wizardData.files.push({ name: f.name, size: f.size });
        const div = document.createElement('div');
        div.className = 'uploaded-file';
        div.innerHTML = `
            <i class="fas fa-file"></i>
            <span class="file-name">${escapeHtml(f.name)}</span>
            <span style="font-size:10px;color:var(--text-muted);">${(f.size / 1024).toFixed(1)} KB</span>
            <span class="file-remove" onclick="this.parentElement.remove(); window.removeFile('${escapeHtml(f.name)}')"><i class="fas fa-times"></i></span>
        `;
        container.appendChild(div);
    }
    document.getElementById('fileInput').value = '';
};

window.removeFile = function(name) {
    _wizardData.files = _wizardData.files.filter(f => f.name !== name);
};

window.addLink = function() {
    const input = document.getElementById('linkInput');
    const url = input.value.trim();
    if (!url) { window.showToast('Please enter a URL', 'error'); return; }
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        window.showToast('Please enter a valid URL starting with http:// or https://', 'error');
        return;
    }
    
    _wizardData.links.push(url);
    input.value = '';
    
    const container = document.getElementById('linksList');
    const div = document.createElement('div');
    div.className = 'link-item';
    div.innerHTML = `
        <i class="fas fa-link" style="color:var(--info);"></i>
        <span class="link-url">${escapeHtml(url)}</span>
        <span class="link-remove" onclick="this.parentElement.remove(); window.removeLink('${escapeHtml(url)}')"><i class="fas fa-times"></i></span>
    `;
    container.appendChild(div);
};

window.removeLink = function(url) {
    _wizardData.links = _wizardData.links.filter(l => l !== url);
};

// ── Create Case ──────────────────────────────────────────────────────────────

window.wizardCreate = function() {
    const num = parseInt(_lastCaseId.replace('ENF-', '')) || 1;
    const newId = 'ENF-' + String(num).padStart(4, '0');
    _lastCaseId = 'ENF-' + String(num + 1).padStart(4, '0');
    _newCaseId = newId;
    
    const today = new Date().toISOString().slice(0, 10);
    const now = new Date().toISOString().slice(0, 10) + ' ' + new Date().toTimeString().slice(0, 5);
    
    const assetParts = _wizardData.asset.split('|');
    const assetName = assetParts[0] || 'Unknown Asset';
    const assetId = assetParts[1] || 'SR-A-0000XX';
    
    const evidence = [
        ..._wizardData.files.map(f => ({ name: f.name, type: 'document', uploaded: today })),
        ..._wizardData.links.map(l => ({ name: l, type: 'url', uploaded: today }))
    ];
    
    const newCase = {
        id: newId,
        asset: assetName,
        assetId: assetId,
        platform: _wizardData.platform,
        reportedName: _wizardData.reportedName,
        reportedUrl: _wizardData.reportedUrl || '',
        priority: _wizardData.priority,
        status: 'open',
        assignedTo: null,
        dateReported: today,
        lastUpdated: today,
        description: _wizardData.description,
        outcome: null,
        evidence: evidence,
        timeline: [
            { type: 'CASE_CREATED', actor: 'System', timestamp: now }
        ],
        notes: [
            { text: 'Case opened by user.', author: 'System', timestamp: today }
        ]
    };
    
    if (evidence.length) {
        newCase.timeline.push({
            type: 'EVIDENCE_UPLOADED',
            actor: 'User',
            timestamp: now,
            metadata: { count: evidence.length }
        });
    }
    
    _cases.unshift(newCase);
    renderCases();
    updateSummary();
    
    // Show success
    document.getElementById('successCaseId').textContent = newId;
    document.getElementById('successDate').textContent = today;
    const priorityLabels = { low: 'Low', medium: 'Medium', high: 'High', critical: 'Critical' };
    document.getElementById('successPriority').textContent = priorityLabels[_wizardData.priority] || 'Medium';
    _wizardStep = 4;
    updateWizard();
    
    window.showToast(`Case ${newId} created successfully`, 'success');
};

window.viewNewCase = function() {
    if (_newCaseId) {
        closeWizard();
        setTimeout(() => openDetail(_newCaseId), 300);
    }
};

// ── Refresh ─────────────────────────────────────────────────────────────────

window.refreshCases = function() {
    loadCases();
    window.showToast('Cases refreshed', 'success');
};

// ── Toast System ─────────────────────────────────────────────────────────────

window.showToast = function(msg, type = 'success') {
    const t = document.createElement('div');
    t.className = 'toast';
    const icon = type === 'success' ? 'fa-check-circle' : type === 'info' ? 'fa-info-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-exclamation-circle';
    const color = type === 'success' ? 'var(--primary)' : type === 'info' ? 'var(--info)' : 'var(--danger)';
    t.innerHTML = `<i class="fas ${icon}" style="margin-right:8px;color:${color};"></i> ${escapeHtml(msg)}`;
    document.body.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 2800);
};

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ── Expose to window ─────────────────────────────────────────────────────────

window.loadCases = loadCases;
window.renderCases = renderCases;
window.updateSummary = updateSummary;
window.openDetail = openDetail;
window.closeDetail = closeDetail;
window.applyFilters = applyFilters;
window.openNewCaseWizard = openNewCaseWizard;
window.closeWizard = closeWizard;
window.wizardNext = wizardNext;
window.wizardBack = wizardBack;
window.wizardCreate = wizardCreate;
window.handleFiles = handleFiles;
window.removeFile = removeFile;
window.addLink = addLink;
window.removeLink = removeLink;
window.openCloseModal = openCloseModal;
window.closeCloseModal = closeCloseModal;
window.confirmCloseCase = confirmCloseCase;
window.reopenCase = reopenCase;
window.viewNewCase = viewNewCase;
window.refreshCases = refreshCases;
window.showToast = showToast;

console.log('[enforcement.js] Loaded — Enforcement Command Center ready');
