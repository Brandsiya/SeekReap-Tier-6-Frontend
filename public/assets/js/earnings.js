/**
 * SeekReap · Earnings Page (Rights-Native)
 * Financial Command Center with Rights Ledger, Pipeline, and full simulations
 */

const TIER4 = 'https://seekreap-tier-4-orchestrator-1.onrender.com';
let _jwt = null;
let _chart = null;

// ── Sample Data ───────────────────────────────────────────────────────────────

const rightsLedgerData = [
    {
        asset: 'Midnight Dreams',
        agreement: 'AGR-0051',
        license: 'LIC-0044',
        right: 'Commercial Rights',
        territory: 'Worldwide',
        duration: '2 years',
        revenue: 3400,
        ownership: 40,
        allocation: '$3,400'
    },
    {
        asset: 'Digital Sunrise',
        agreement: 'AGR-0053',
        license: 'LIC-0048',
        right: 'Sync Licensing',
        territory: 'USA, UK',
        duration: '1 year',
        revenue: 1200,
        ownership: 100,
        allocation: '$1,200'
    },
    {
        asset: 'Code Symphony',
        agreement: 'AGR-0048',
        license: 'LIC-0032',
        right: 'AI Training Rights',
        territory: 'Worldwide',
        duration: 'Perpetual',
        revenue: 850,
        ownership: 60,
        allocation: '$510'
    }
];

const pipelineData = [
    { stage: 'License Created', status: 'done', icon: 'fa-file-contract' },
    { stage: 'License Purchased', status: 'done', icon: 'fa-shopping-cart' },
    { stage: 'Payment Received', status: 'done', icon: 'fa-credit-card' },
    { stage: 'Rights Verified', status: 'done', icon: 'fa-check-circle' },
    { stage: 'Allocation Calculated', status: 'active', icon: 'fa-calculator' },
    { stage: 'Wallet Updated', status: 'pending', icon: 'fa-wallet' },
    { stage: 'Payout Completed', status: 'pending', icon: 'fa-arrow-up' }
];

const timelineData = [
    { event: 'License Created', desc: 'Commercial License #0044 issued', time: '2026-06-20', type: 'created' },
    { event: 'License Purchased', desc: 'ABC Studios purchased license', time: '2026-06-22', type: 'purchased' },
    { event: 'Payment Received', desc: '$5,000 received', time: '2026-06-25', type: 'paid' },
    { event: 'Allocation Calculated', desc: '40% → Creator A, 30% → Creator B', time: '2026-06-26', type: 'allocated' },
    { event: 'Wallet Updated', desc: 'Balance increased by $2,000', time: '2026-06-27', type: 'payout' }
];

const assetEarningsData = [
    { title: 'Midnight Dreams', revenue: 12400, licenses: 4, nft: 0, marketplace: 3200, commercial: 3400, streaming: 5800 },
    { title: 'Digital Sunrise', revenue: 8500, licenses: 3, nft: 1200, marketplace: 1800, commercial: 1200, streaming: 4300 },
    { title: 'Code Symphony', revenue: 32000, licenses: 7, nft: 0, marketplace: 15000, commercial: 8500, streaming: 8500 }
];

const agreementEarningsData = [
    { name: 'Podcast Series 2026', value: 12400, remaining: 3200, participants: [{ name: 'Creator A', pct: 40 }, { name: 'Creator B', pct: 30 }, { name: 'Publisher', pct: 20 }, { name: 'Producer', pct: 10 }], status: 'active' },
    { name: 'Solo Tracks Ledger', value: 8500, remaining: 0, participants: [{ name: 'Creator A', pct: 100 }], status: 'completed' },
    { name: 'Vanguard Short Film', value: 3200, remaining: 800, participants: [{ name: 'Creator A', pct: 60 }, { name: 'Studio', pct: 40 }], status: 'pending' }
];

const revenueData = [
    { date: '2026-06-01', gross: 450, net: 405 },
    { date: '2026-06-02', gross: 320, net: 288 },
    { date: '2026-06-03', gross: 580, net: 522 },
    { date: '2026-06-04', gross: 210, net: 189 },
    { date: '2026-06-05', gross: 760, net: 684 },
    { date: '2026-06-06', gross: 340, net: 306 },
    { date: '2026-06-07', gross: 490, net: 441 },
    { date: '2026-06-08', gross: 620, net: 558 },
    { date: '2026-06-09', gross: 280, net: 252 },
    { date: '2026-06-10', gross: 850, net: 765 },
    { date: '2026-06-11', gross: 410, net: 369 },
    { date: '2026-06-12', gross: 530, net: 477 },
    { date: '2026-06-13', gross: 190, net: 171 },
    { date: '2026-06-14', gross: 700, net: 630 },
];

const recentTransactions = [
    { date: '2026-06-28', source: 'License', asset: 'Midnight Dreams', agreement: 'AGR-0051', license: 'LIC-0044', gross: 2500, fee: 62.50, net: 2437.50, status: 'settled' },
    { date: '2026-06-27', source: 'Marketplace', asset: 'Digital Sunrise', agreement: 'AGR-0053', license: null, gross: 800, fee: 40, net: 760, status: 'settled' },
    { date: '2026-06-26', source: 'License', asset: 'Code Symphony', agreement: 'AGR-0048', license: 'LIC-0032', gross: 1500, fee: 37.50, net: 1462.50, status: 'pending' },
    { date: '2026-06-25', source: 'NFT Sales', asset: 'Neon Dreams', agreement: null, license: null, gross: 1200, fee: 60, net: 1140, status: 'settled' },
    { date: '2026-06-24', source: 'Delegations', asset: 'Midnight Dreams', agreement: 'AGR-0051', license: null, gross: 400, fee: 20, net: 380, status: 'paid' },
];

const allocations = [
    { name: 'Creator A', pct: 40, amount: 40.00 },
    { name: 'Creator B', pct: 30, amount: 30.00 },
    { name: 'Publisher', pct: 20, amount: 20.00 },
    { name: 'Producer', pct: 10, amount: 10.00 },
];

const payouts = [
    { id: 'P-001', wallet: '0x8f4...2a1', bank: 'Capitec', amount: 5000, method: 'Bank Transfer', status: 'completed', date: '2026-06-15', reference: 'REF-001' },
    { id: 'P-002', wallet: '0x8f4...2a1', bank: 'Capitec', amount: 2500, method: 'Bank Transfer', status: 'processing', date: '2026-06-28', reference: 'REF-002' },
    { id: 'P-003', wallet: '0x8f4...2a1', bank: 'Capitec', amount: 1200, method: 'Crypto', status: 'pending', date: '2026-06-29', reference: 'REF-003' },
];

// ── JWT & API Helpers ─────────────────────────────────────────────────────────

function _getJwt() {
    if (_jwt) return _jwt;
    if (window.supabaseClient) {
        const { data: { session } } = window.supabaseClient.auth.getSession();
        _jwt = session?.access_token || null;
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

// ── Initialization ────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
    if (typeof window.waitForAuth === 'function') {
        const user = await window.waitForAuth();
        if (!user) { window.location.href = '/signup_signin.html'; return; }
        _setUserDisplay(user);
    }
    renderAll();
    initChart();
    _bindEvents();
    simulateRealtimeUpdates();
});

function _setUserDisplay(user) {
    const name = user.user_metadata?.display_name || user.email?.split('@')[0] || 'Creator';
    const el = document.getElementById('userNameNav');
    const av = document.getElementById('userAvatarNav');
    if (el) el.textContent = name.slice(0, 14);
    if (av) av.textContent = name[0].toUpperCase();
}

// ── Render All ────────────────────────────────────────────────────────────────

function renderAll() {
    renderRightsLedger();
    renderPipeline();
    renderTimeline();
    renderTransactions();
    renderPayouts();
    renderAllocations();
    renderAssetEarnings();
    renderAgreementEarnings();
    renderDistributionFlow();
}

function renderRightsLedger() {
    const container = document.getElementById('rightsLedger');
    if (!container) return;
    
    container.innerHTML = rightsLedgerData.map(item => `
        <div class="ledger-item">
            <div class="ledger-left">
                <div class="asset">${item.asset}</div>
                <div class="rights-chain">
                    <span class="chain-link">${item.agreement}</span>
                    <i class="fas fa-chevron-right" style="font-size:8px;"></i>
                    <span class="chain-link">${item.license}</span>
                    <i class="fas fa-chevron-right" style="font-size:8px;"></i>
                    <span>${item.right}</span>
                    <i class="fas fa-chevron-right" style="font-size:8px;"></i>
                    <span>${item.territory}</span>
                    <i class="fas fa-chevron-right" style="font-size:8px;"></i>
                    <span>${item.duration}</span>
                </div>
            </div>
            <div class="ledger-right">
                <div class="amount">$${item.revenue.toLocaleString()}</div>
                <div class="allocation">${item.ownership}% · ${item.allocation}</div>
            </div>
        </div>
    `).join('');
}

function renderPipeline() {
    const container = document.getElementById('pipelineStages');
    if (!container) return;
    
    container.innerHTML = pipelineData.map((stage, i) => `
        <div class="pipeline-stage ${stage.status}">
            <div class="stage-icon"><i class="fas ${stage.icon}"></i></div>
            <div class="stage-label">${stage.stage}</div>
            <div class="stage-status">${stage.status === 'done' ? '✓ Done' : stage.status === 'active' ? '⟳ In Progress' : '⏳ Pending'}</div>
        </div>
        ${i < pipelineData.length - 1 ? '<div class="pipeline-arrow"><i class="fas fa-arrow-right"></i></div>' : ''}
    `).join('');
}

function renderTimeline() {
    const container = document.getElementById('revenueTimeline');
    if (!container) return;
    
    container.innerHTML = timelineData.map(item => `
        <div class="timeline-item">
            <div class="timeline-dot ${item.type}"></div>
            <div class="timeline-content">
                <div class="tl-title">${item.event}</div>
                <div class="tl-desc">${item.desc}</div>
            </div>
            <div class="timeline-time">${item.time}</div>
        </div>
    `).join('');
}

function renderTransactions() {
    const tbody = document.getElementById('transactionsBody');
    if (!tbody) return;
    
    tbody.innerHTML = recentTransactions.map(t => `
        <tr>
            <td>${t.date}</td>
            <td><span class="status-badge" style="background:rgba(16,185,129,0.1);color:var(--primary);">${t.source}</span></td>
            <td>${t.asset}</td>
            <td>${t.agreement || '—'}</td>
            <td>${t.license || '—'}</td>
            <td>$${t.gross.toFixed(2)}</td>
            <td>$${t.fee.toFixed(2)}</td>
            <td><strong>$${t.net.toFixed(2)}</strong></td>
            <td><span class="status-badge status-${t.status}">${t.status}</span></td>
            <td><button class="btn btn-secondary btn-sm" onclick="viewTransaction('${t.license}')">Trace</button></td>
        </tr>
    `).join('');
}

function renderPayouts() {
    const tbody = document.getElementById('payoutsBody');
    if (!tbody) return;
    
    tbody.innerHTML = payouts.map(p => `
        <tr>
            <td>${p.id}</td>
            <td class="mono">${p.wallet}</td>
            <td>${p.bank}</td>
            <td><strong>$${p.amount.toFixed(2)}</strong></td>
            <td>${p.method}</td>
            <td><span class="status-badge status-${p.status}">${p.status}</span></td>
            <td>${p.date}</td>
            <td>${p.reference}</td>
        </tr>
    `).join('');
}

function renderAllocations() {
    const container = document.getElementById('allocationExample');
    if (!container) return;
    
    container.innerHTML = `
        <div class="allocation-source">
            <span>Spotify · Streaming Revenue</span>
            <span>$100.00</span>
        </div>
        <div class="allocation-tree">
            ${allocations.map(a => `
                <div class="allocation-item">
                    <span class="recipient">${a.name}</span>
                    <span>${a.pct}% · <span class="share">$${a.amount.toFixed(2)}</span></span>
                </div>
            `).join('')}
        </div>
    `;
}

function renderAssetEarnings() {
    const container = document.getElementById('assetEarnings');
    if (!container) return;
    
    container.innerHTML = assetEarningsData.map(asset => `
        <div class="asset-earning-item">
            <div class="ae-title">${asset.title}</div>
            <div class="ae-revenue">$${asset.revenue.toLocaleString()}</div>
            <div class="ae-detail">
                <span>📄 ${asset.licenses} licenses</span>
                <span>🛒 ${asset.marketplace ? '$' + asset.marketplace.toLocaleString() : '—'}</span>
                <span>💼 ${asset.commercial ? '$' + asset.commercial.toLocaleString() : '—'}</span>
                <span>🎵 ${asset.streaming ? '$' + asset.streaming.toLocaleString() : '—'}</span>
            </div>
        </div>
    `).join('');
}

function renderAgreementEarnings() {
    const container = document.getElementById('agreementEarnings');
    if (!container) return;
    
    container.innerHTML = agreementEarningsData.map(agr => `
        <div class="agreement-earning-item">
            <div class="ae-title">${agr.name}</div>
            <div style="display:flex;justify-content:space-between;margin-top:4px;">
                <span>Generated: <strong>$${agr.value.toLocaleString()}</strong></span>
                <span>Remaining: $${agr.remaining.toLocaleString()}</span>
                <span class="status-badge status-${agr.status}">${agr.status}</span>
            </div>
            <div class="ae-split">
                ${agr.participants.map(p => `
                    <div class="split-participant">
                        <span>${p.name}</span>
                        <span>${p.pct}%</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

function renderDistributionFlow() {
    const container = document.getElementById('distributionFlow');
    if (!container) return;
    
    container.innerHTML = `
        <div class="flow-row">
            <div class="flow-box primary">Customer</div>
            <div class="flow-arrow"><i class="fas fa-arrow-right"></i></div>
            <div class="flow-box">License</div>
            <div class="flow-arrow"><i class="fas fa-arrow-right"></i></div>
            <div class="flow-box primary">Agreement</div>
            <div class="flow-arrow"><i class="fas fa-arrow-right"></i></div>
            <div class="flow-box success">Rights Engine</div>
        </div>
        <div class="flow-row">
            <div class="flow-arrow down"><i class="fas fa-arrow-down"></i></div>
        </div>
        <div class="flow-row">
            <div class="flow-box">Creator A</div>
            <div class="flow-arrow"><i class="fas fa-arrow-right"></i></div>
            <div class="flow-box">Creator B</div>
            <div class="flow-arrow"><i class="fas fa-arrow-right"></i></div>
            <div class="flow-box">Publisher</div>
            <div class="flow-arrow"><i class="fas fa-arrow-right"></i></div>
            <div class="flow-box success">Wallet</div>
        </div>
    `;
}

// ── Chart ─────────────────────────────────────────────────────────────────────

function initChart() {
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;
    
    if (_chart) { _chart.destroy(); }
    
    _chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: revenueData.map(d => d.date.slice(5)),
            datasets: [
                {
                    label: 'Gross Revenue',
                    data: revenueData.map(d => d.gross),
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 3,
                },
                {
                    label: 'Net Revenue',
                    data: revenueData.map(d => d.net),
                    borderColor: '#E8C06A',
                    backgroundColor: 'rgba(232, 192, 106, 0.05)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 3,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: '#9ca3af', usePointStyle: true, pointStyle: 'circle' }
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: '#6b7280' }
                },
                y: {
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: '#6b7280', callback: v => '$' + v }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

// ── Event Bindings ────────────────────────────────────────────────────────────

function _bindEvents() {
    document.querySelectorAll('.chart-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            showToast(`Showing ${this.textContent} data`, 'info');
        });
    });
    
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            document.getElementById(tabId + 'Tab').classList.add('active');
        });
    });
}

// ── Real-time Simulations ─────────────────────────────────────────────────────

function simulateRealtimeUpdates() {
    // Simulate new revenue event every 30 seconds
    setInterval(() => {
        const sources = ['License', 'Marketplace', 'NFT Sales', 'Delegations', 'Commercial Rights'];
        const assets = ['Midnight Dreams', 'Digital Sunrise', 'Code Symphony', 'Neon Dreams'];
        const source = sources[Math.floor(Math.random() * sources.length)];
        const asset = assets[Math.floor(Math.random() * assets.length)];
        const amount = Math.floor(Math.random() * 500) + 50;
        
        showToast(`New ${source} revenue: ${asset} +$${amount}`, 'info');
        
        // Update the ledger with new item
        const ledgerContainer = document.getElementById('rightsLedger');
        if (ledgerContainer) {
            const newItem = document.createElement('div');
            newItem.className = 'ledger-item';
            newItem.style.animation = 'fadeIn 0.5s ease';
            newItem.innerHTML = `
                <div class="ledger-left">
                    <div class="asset">${asset}</div>
                    <div class="rights-chain">
                        <span class="chain-link">New</span>
                        <i class="fas fa-chevron-right" style="font-size:8px;"></i>
                        <span>${source}</span>
                        <i class="fas fa-chevron-right" style="font-size:8px;"></i>
                        <span>${['Commercial', 'Sync', 'Mechanical', 'Performance'][Math.floor(Math.random() * 4)]} Rights</span>
                    </div>
                </div>
                <div class="ledger-right">
                    <div class="amount">$${amount}</div>
                    <div class="allocation">${Math.floor(Math.random() * 60) + 20}% · $${(amount * 0.4).toFixed(0)}</div>
                </div>
            `;
            ledgerContainer.prepend(newItem);
            
            // Keep only latest 5 items
            while (ledgerContainer.children.length > 5) {
                ledgerContainer.removeChild(ledgerContainer.lastChild);
            }
        }
    }, 30000);
}

// ── Actions ──────────────────────────────────────────────────────────────────

function refreshEarnings() {
    showToast('Refreshing earnings data...', 'info');
    setTimeout(() => {
        renderAll();
        showToast('Earnings updated', 'success');
    }, 1000);
}

function exportEarnings() {
    showToast('Preparing export...', 'info');
    setTimeout(() => {
        showToast('Export ready: earnings_report.csv', 'success');
    }, 1500);
}

function withdrawFunds() {
    showToast('Withdraw funds feature coming soon', 'info');
}

function depositFunds() {
    showToast('Deposit funds feature coming soon', 'info');
}

function transferFunds() {
    showToast('Transfer funds feature coming soon', 'info');
}

function exportStatement() {
    showToast('Exporting statement...', 'info');
    setTimeout(() => {
        showToast('Statement downloaded', 'success');
    }, 1200);
}

function viewAllTransactions() {
    showToast('Viewing all transactions...', 'info');
}

function viewAllAssets() {
    showToast('Viewing all assets...', 'info');
}

function viewAllAgreements() {
    showToast('Viewing all agreements...', 'info');
}

function viewTransaction(id) {
    showToast(`Tracing transaction ${id}`, 'info');
}

function initiatePayout() {
    showToast('New payout initiated', 'success');
}

function filterBySource(source) {
    showToast(`Filtering by ${source}...`, 'info');
}

// ── Toast System ──────────────────────────────────────────────────────────────

function showToast(msg, type = 'success') {
    const t = document.createElement('div');
    t.className = 'toast';
    const icon = type === 'success' ? 'fa-check-circle' : type === 'info' ? 'fa-info-circle' : 'fa-exclamation-circle';
    const color = type === 'success' ? 'var(--primary)' : type === 'info' ? 'var(--info)' : 'var(--warning)';
    t.innerHTML = `<i class="fas ${icon}" style="margin-right:8px;color:${color};"></i> ${msg}`;
    document.body.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 2800);
}

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ── Expose Functions ──────────────────────────────────────────────────────────

window.refreshEarnings = refreshEarnings;
window.exportEarnings = exportEarnings;
window.withdrawFunds = withdrawFunds;
window.depositFunds = depositFunds;
window.transferFunds = transferFunds;
window.exportStatement = exportStatement;
window.viewAllTransactions = viewAllTransactions;
window.viewAllAssets = viewAllAssets;
window.viewAllAgreements = viewAllAgreements;
window.viewTransaction = viewTransaction;
window.initiatePayout = initiatePayout;
window.filterBySource = filterBySource;
window.showToast = showToast;

console.log('[earnings.js] Loaded — Rights & Revenue Command Center ready');
