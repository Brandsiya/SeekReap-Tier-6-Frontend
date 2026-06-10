let ownershipChart = null;
let royaltyChart = null;
let currentAgreement = null;

let agreements = [
    {
        id: "agr_001",
        name: "Podcast Series 2026",
        description: "Revenue sharing, governance and ownership agreement for the SeekReap Podcast Series.",
        type: "collaboration",
        status: "active",
        created_at: "2026-01-15",
        participants: [
            { id: "usr_001", name: "Siya", role: "Lead Creator", ownership: 70, royalty: 70, status: "active" },
            { id: "usr_002", name: "John", role: "Co-Creator", ownership: 30, royalty: 30, status: "active" }
        ],
        assets: [
            { id: "asset_001", title: "Episode 01", type: "Podcast", status: "Published", revenue: 1800 },
            { id: "asset_002", title: "Episode 02", type: "Podcast", status: "Published", revenue: 2400 }
        ],
        delegations: [
            { name: "Studio Manager", upload: true, edit: true, revenue: false, governance: false }
        ],
        revenueEvents: [
            { date: "2026-06-01", source: "Spotify", amount: 1500 },
            { date: "2026-06-05", source: "Apple Podcasts", amount: 2200 },
            { date: "2026-06-08", source: "YouTube", amount: 500 }
        ],
        auditTrail: [
            { date: "2026-06-01", actor: "Siya", action: "Created Agreement" },
            { date: "2026-06-02", actor: "Siya", action: "Added John as Co-Creator" }
        ]
    },
    {
        id: "agr_002",
        name: "Solo Tracks Ledger",
        description: "Individual creator agreement for solo music releases.",
        type: "solo",
        status: "active",
        created_at: "2026-01-10",
        participants: [
            { id: "usr_001", name: "Siya", role: "Creator", ownership: 100, royalty: 100, status: "active" }
        ],
        assets: [
            { id: "asset_003", title: "Single 01", type: "Music", status: "Published", revenue: 3200 }
        ],
        delegations: [],
        revenueEvents: [
            { date: "2026-06-03", source: "Spotify", amount: 3200 }
        ],
        auditTrail: [
            { date: "2026-01-10", actor: "Siya", action: "Created Agreement" }
        ]
    }
];

document.addEventListener("DOMContentLoaded", () => {
    renderSummary();
    renderAgreementCards();
    initializeCharts();
    attachEventListeners();
    filterAgreements();
});

function attachEventListeners() {
    document.getElementById("createAgreementBtn").onclick = () => openModal("createAgreementModal");
    document.getElementById("addParticipantBtn").onclick = () => openModal("addParticipantModal");
    document.getElementById("linkAssetBtn").onclick = () => openModal("linkAssetModal");
    document.getElementById("editAgreementBtn").onclick = () => alert("Edit agreement feature coming soon");
    document.getElementById("archiveAgreementBtn").onclick = () => archiveCurrentAgreement();
    document.getElementById("saveAgreementBtn").onclick = () => createAgreement();
    document.getElementById("saveParticipantBtn").onclick = () => addParticipant();
    document.getElementById("saveAssetBtn").onclick = () => linkAsset();
    document.getElementById("agreementSearch").oninput = () => filterAgreements();
    document.getElementById("agreementFilter").onchange = () => filterAgreements();
    document.querySelectorAll(".close-modal, .cancel-modal").forEach(btn => {
        btn.onclick = () => closeAllModals();
    });
    document.querySelectorAll(".tab").forEach(tab => {
        tab.onclick = () => {
            const tabId = tab.dataset.tab;
            document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
            document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
            tab.classList.add("active");
            document.getElementById(tabId).classList.add("active");
        };
    });
}

function renderSummary() {
    const totalAgreements = agreements.length;
    const totalParticipants = agreements.reduce((sum, a) => sum + a.participants.length, 0);
    const totalAssets = agreements.reduce((sum, a) => sum + a.assets.length, 0);
    const totalRevenue = agreements.reduce((sum, a) => sum + a.revenueEvents.reduce((s, e) => s + e.amount, 0), 0);
    setText("totalAgreements", totalAgreements);
    setText("totalParticipants", totalParticipants);
    setText("totalAssets", totalAssets);
    setText("totalRevenue", formatCurrency(totalRevenue));
}

function renderAgreementCards() {
    const container = document.getElementById("agreementsGrid");
    if (!container) return;
    container.innerHTML = agreements.map(a => `
        <div class="agreement-card" onclick="openAgreement('${a.id}')">
            <div class="badge ${a.type === 'solo' ? 'warning' : 'success'}">${capitalize(a.type)}</div>
            <h3>${escapeHtml(a.name)}</h3>
            <p>${escapeHtml(a.description)}</p>
            <div class="agreement-card-footer">
                <span><i class="fa-solid fa-users"></i> ${a.participants.length} participants</span>
                <span><i class="fa-solid fa-link"></i> ${a.assets.length} assets</span>
            </div>
        </div>
    `).join("");
}

function filterAgreements() {
    const searchTerm = document.getElementById("agreementSearch")?.value.toLowerCase() || "";
    const filterStatus = document.getElementById("agreementFilter")?.value || "all";
    const filtered = agreements.filter(a => {
        const matchesSearch = a.name.toLowerCase().includes(searchTerm) || a.description.toLowerCase().includes(searchTerm);
        const matchesStatus = filterStatus === "all" || a.status === filterStatus;
        return matchesSearch && matchesStatus;
    });
    const container = document.getElementById("agreementsGrid");
    if (!container) return;
    if (filtered.length === 0) {
        container.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:40px; color:var(--text-muted);">
            <i class="fa-solid fa-file-signature" style="font-size:48px; margin-bottom:16px; opacity:0.5;"></i>
            <p>No agreements found</p>
        </div>`;
        return;
    }
    container.innerHTML = filtered.map(a => `
        <div class="agreement-card" onclick="openAgreement('${a.id}')">
            <div class="badge ${a.type === 'solo' ? 'warning' : 'success'}">${capitalize(a.type)}</div>
            <h3>${escapeHtml(a.name)}</h3>
            <p>${escapeHtml(a.description)}</p>
            <div class="agreement-card-footer">
                <span><i class="fa-solid fa-users"></i> ${a.participants.length} participants</span>
                <span><i class="fa-solid fa-link"></i> ${a.assets.length} assets</span>
            </div>
        </div>
    `).join("");
}

function openAgreement(id) {
    currentAgreement = agreements.find(a => a.id === id);
    if (!currentAgreement) return;
    document.getElementById("agreementDetail").style.display = "block";
    document.getElementById("agreementTitle").textContent = currentAgreement.name;
    document.getElementById("agreementDescription").textContent = currentAgreement.description;
    document.getElementById("agreementTypeBadge").textContent = capitalize(currentAgreement.type);
    const statusBadge = document.getElementById("agreementStatusBadge");
    statusBadge.textContent = capitalize(currentAgreement.status);
    statusBadge.className = `badge ${currentAgreement.status === "active" ? "success" : "warning"}`;
    renderParticipants();
    renderRightsMatrix();
    renderAssets();
    renderRevenueLedger();
    renderAuditTrail();
    updateCharts();
}

function archiveCurrentAgreement() {
    if (!currentAgreement) return;
    currentAgreement.status = "archived";
    renderAgreementCards();
    document.getElementById("agreementDetail").style.display = "none";
    currentAgreement = null;
    renderSummary();
}

function renderParticipants() {
    const body = document.getElementById("participantsTableBody");
    if (!body || !currentAgreement) return;
    body.innerHTML = currentAgreement.participants.map(p => `
        <tr>
            <td>${escapeHtml(p.name)}</td><td>${escapeHtml(p.role)}</td>
            <td>${p.ownership}%</td><td>${p.royalty}%</td>
            <td><span class="badge ${p.status === 'active' ? 'success' : 'warning'}">${p.status}</span></td>
            <td><button class="btn btn-danger" onclick="removeParticipant('${p.id}')"><i class="fa-solid fa-trash"></i></button></td>
        </tr>
    `).join("");
}

function addParticipant() {
    const name = document.getElementById("participantName").value;
    const role = document.getElementById("participantRole").value;
    const ownership = Number(document.getElementById("participantOwnership").value);
    const royalty = Number(document.getElementById("participantRoyalty").value);
    if (!name || !role || isNaN(ownership) || isNaN(royalty)) { alert("Please fill all fields"); return; }
    const currentTotal = currentAgreement.participants.reduce((sum, p) => sum + p.ownership, 0);
    if (currentTotal + ownership > 100) { alert(`Total ownership would exceed 100% (currently ${currentTotal}%)`); return; }
    currentAgreement.participants.push({ id: crypto.randomUUID(), name, role, ownership, royalty, status: "pending" });
    closeAllModals();
    clearParticipantForm();
    renderParticipants();
    renderRightsMatrix();
    updateCharts();
    renderSummary();
}

function removeParticipant(id) {
    currentAgreement.participants = currentAgreement.participants.filter(p => p.id !== id);
    renderParticipants();
    renderRightsMatrix();
    updateCharts();
    renderSummary();
}

function clearParticipantForm() {
    document.getElementById("participantName").value = "";
    document.getElementById("participantRole").value = "";
    document.getElementById("participantOwnership").value = "";
    document.getElementById("participantRoyalty").value = "";
}

function renderRightsMatrix() {
    const body = document.getElementById("rightsMatrixTableBody");
    if (!body || !currentAgreement) return;
    const delegations = currentAgreement.delegations || [];
    body.innerHTML = currentAgreement.participants.map(p => {
        const del = delegations.find(d => d.name === p.name);
        return `<tr><td>${escapeHtml(p.name)}</td>
            <td class="text-center">${del?.upload ? '✓' : '✗'}</td>
            <td class="text-center">${del?.edit ? '✓' : '✗'}</td>
            <td class="text-center">${del?.revenue ? '✓' : '✗'}</td>
            <td class="text-center">${del?.governance ? '✓' : '✗'}</td></tr>`;
    }).join("");
}

function initializeCharts() {
    const oc = document.getElementById("ownershipChart"), rc = document.getElementById("royaltyChart");
    if (!oc || !rc) return;
    ownershipChart = new Chart(oc, { type: "doughnut", data: { labels: [], datasets: [{ data: [], backgroundColor: ["#10b981","#14b8a6","#059669","#0d9488","#34d399"], borderWidth: 0 }] }, options: { responsive: true, maintainAspectRatio: true, cutout: "65%", plugins: { legend: { position: "bottom" } } } });
    royaltyChart = new Chart(rc, { type: "doughnut", data: { labels: [], datasets: [{ data: [], backgroundColor: ["#14b8a6","#0d9488","#059669","#10b981","#34d399"], borderWidth: 0 }] }, options: { responsive: true, maintainAspectRatio: true, cutout: "65%", plugins: { legend: { position: "bottom" } } } });
}

function updateCharts() {
    if (!ownershipChart || !royaltyChart || !currentAgreement) return;
    const labels = currentAgreement.participants.map(p => p.name);
    ownershipChart.data.labels = labels;
    ownershipChart.data.datasets[0].data = currentAgreement.participants.map(p => p.ownership);
    royaltyChart.data.labels = labels;
    royaltyChart.data.datasets[0].data = currentAgreement.participants.map(p => p.royalty);
    ownershipChart.update();
    royaltyChart.update();
}

function renderAssets() {
    const container = document.getElementById("linkedAssetsGrid");
    if (!container || !currentAgreement) return;
    container.innerHTML = currentAgreement.assets.map(asset => `
        <div class="asset-card"><h4>${escapeHtml(asset.title)}</h4><p>${asset.type}</p><p>${asset.status}</p><strong>${formatCurrency(asset.revenue)}</strong></div>
    `).join("");
}

function linkAsset() {
    const assetId = document.getElementById("assetId").value;
    if (!assetId) { alert("Please enter an asset ID"); return; }
    currentAgreement.assets.push({ id: assetId, title: `Asset ${assetId.slice(0,8)}`, type: "Unknown", status: "Linked", revenue: 0 });
    closeAllModals();
    document.getElementById("assetId").value = "";
    renderAssets();
    renderSummary();
}

function renderRevenueLedger() {
    const container = document.getElementById("revenueLedger");
    if (!container || !currentAgreement) return;
    if (currentAgreement.revenueEvents.length === 0) { container.innerHTML = `<div class="ledger-item" style="text-align:center;"><p>No revenue events recorded</p></div>`; return; }
    container.innerHTML = currentAgreement.revenueEvents.map(event => `
        <div class="ledger-item"><div><strong>${escapeHtml(event.source)}</strong><p>${event.date}</p></div><h3>${formatCurrency(event.amount)}</h3></div>
    `).join("");
}

function renderAuditTrail() {
    const container = document.getElementById("auditTimeline");
    if (!container || !currentAgreement) return;
    if (currentAgreement.auditTrail.length === 0) { container.innerHTML = `<div style="text-align:center; padding:20px;"><p>No audit events recorded</p></div>`; return; }
    container.innerHTML = currentAgreement.auditTrail.map(event => `
        <div class="audit-event"><strong>${escapeHtml(event.action)}</strong><p>${escapeHtml(event.actor)} • ${event.date}</p></div>
    `).join("");
}

function createAgreement() {
    const name = document.getElementById("agreementName").value;
    const description = document.getElementById("agreementDescriptionInput").value;
    const type = document.getElementById("agreementType").value;
    if (!name) { alert("Please enter an agreement name"); return; }
    agreements.push({
        id: "agr_" + Date.now(),
        name: name,
        description: description || "No description provided",
        type: type,
        status: "active",
        created_at: new Date().toISOString().split("T")[0],
        participants: [{ id: "usr_current", name: "You", role: "Creator", ownership: 100, royalty: 100, status: "active" }],
        assets: [],
        delegations: [],
        revenueEvents: [],
        auditTrail: [{ date: new Date().toISOString().split("T")[0], actor: "You", action: "Created Agreement" }]
    });
    closeAllModals();
    clearAgreementForm();
    renderAgreementCards();
    renderSummary();
    openAgreement(agreements[agreements.length - 1].id);
}

function clearAgreementForm() {
    document.getElementById("agreementName").value = "";
    document.getElementById("agreementDescriptionInput").value = "";
    document.getElementById("agreementType").value = "collaboration";
}

function openModal(id) { document.getElementById(id)?.classList.add("active"); }
function closeAllModals() { document.querySelectorAll(".modal").forEach(m => m.classList.remove("active")); }
function formatCurrency(amount) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount); }
function capitalize(str) { if (!str) return ""; return str.charAt(0).toUpperCase() + str.slice(1); }
function escapeHtml(str) { if (!str) return ""; const div = document.createElement("div"); div.textContent = str; return div.innerHTML; }
function setText(id, value) { const el = document.getElementById(id); if (el) el.textContent = value; }
