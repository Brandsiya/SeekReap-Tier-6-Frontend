
<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js"></script>
<script>
// ── STATE ─────────────────────────────────────────────────────────────────────
let currentStep = 1, mode = null, collaborators = [], uploadedFile = null, uploadedFileType = null, uploadedFileName = '';
let selectedPlan = 'free';
let pdfDoc = null, pdfCurrentPage = 1, currentEpubBook = null;
let imageZoom = 1;
const typeIcons = { audio: '🎵', video: '🎬', image: '🖼️', epub: '📖', pdf: '📄', code: '💻' };
const typeAccept = { audio: 'audio/*', video: 'video/*', image: 'image/*', epub: '.epub', pdf: '.pdf', code: '.js,.ts,.py,.html,.css,.json,.java,.c,.cpp,.rb,.php,.go,.rs,.txt' };

if (typeof pdfjsLib !== 'undefined') pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

// ── PLAN ──────────────────────────────────────────────────────────────────────
function selectPlan(card) {
  document.querySelectorAll('.plan-card').forEach(c => c.classList.remove('selected'));
  card.classList.add('selected');
  selectedPlan = card.dataset.plan;
}

// ── STEPS ─────────────────────────────────────────────────────────────────────
function showStep(step) {
  [1,2,3,4,5].forEach(i => {
    document.getElementById('step'+i+'Card').classList.add('hidden');
    const el = document.getElementById('step'+i);
    el.classList.remove('active','completed');
    if (i < step) el.classList.add('completed');
    else if (i === step) el.classList.add('active');
  });
  document.getElementById('step'+step+'Card').classList.remove('hidden');
  currentStep = step;
  window.scrollTo({top:0,behavior:'smooth'});
}

function updateStepUI() {
  const s3Icon = document.getElementById('step3Icon');
  const s4Title = document.getElementById('step4Title');
  const s4Header = document.getElementById('step4HeaderText');
  const s4Sub = document.getElementById('step4SubText');
  if (mode === 'solo') {
    s3Icon.innerHTML = '<i class="fas fa-user"></i>';
    s4Title.textContent = 'Upload Work'; if(s4Header) s4Header.textContent = 'Upload Work';
    s4Sub.textContent = 'Upload your work for blockchain certification';
  } else {
    s3Icon.innerHTML = '<i class="fas fa-users"></i>';
    s4Title.textContent = 'Upload & Invite'; if(s4Header) s4Header.textContent = 'Upload & Invite';
    s4Sub.textContent = 'Upload your work & invite co-owners';
  }
}

// ── UPLOAD PROGRESS ───────────────────────────────────────────────────────────
function simulateUpload(progressId, barId, textId, callback) {
  let progress = 0;
  document.getElementById(progressId).style.display = 'block';
  const interval = setInterval(() => {
    progress += 12;
    document.getElementById(barId).style.width = Math.min(progress, 100) + '%';
    document.getElementById(textId).innerText = Math.min(progress, 100) + '%';
    if (progress >= 100) { clearInterval(interval); setTimeout(callback, 200); }
  }, 120);
}

function formatBytes(b) {
  if (b < 1024) return b + ' B';
  if (b < 1048576) return (b/1024).toFixed(1) + ' KB';
  return (b/1048576).toFixed(1) + ' MB';
}

// ── REAL FILE UPLOAD ──────────────────────────────────────────────────────────
function setupFileUpload(areaId, inputId, listId, previewId, previewLabelId, previewTypeId, previewBodyId, progressId, barId, textId) {
  const area = document.getElementById(areaId);
  const input = document.getElementById(inputId);

  // Update accept based on work type
  function refreshAccept() {
    const wt = document.getElementById('workType').value;
    input.accept = typeAccept[wt] || '*/*';
  }
  refreshAccept();
  document.getElementById('workType').addEventListener('change', refreshAccept);

  area.addEventListener('click', () => { refreshAccept(); input.click(); });
  area.addEventListener('dragover', e => { e.preventDefault(); area.classList.add('dragover'); });
  area.addEventListener('dragleave', () => area.classList.remove('dragover'));
  area.addEventListener('drop', e => {
    e.preventDefault(); area.classList.remove('dragover');
    const f = e.dataTransfer.files[0];
    if (f) processFile(f, area, listId, previewId, previewLabelId, previewTypeId, previewBodyId, progressId, barId, textId);
  });
  input.addEventListener('change', e => {
    const f = e.target.files[0];
    if (f) processFile(f, area, listId, previewId, previewLabelId, previewTypeId, previewBodyId, progressId, barId, textId);
  });
}

function processFile(file, area, listId, previewId, previewLabelId, previewTypeId, previewBodyId, progressId, barId, textId) {
  uploadedFile = file;
  uploadedFileName = file.name;
  uploadedFileType = document.getElementById('workType').value;

  simulateUpload(progressId, barId, textId, () => {
    const icon = typeIcons[uploadedFileType] || '📄';
    const list = document.getElementById(listId);
    if (list) list.innerHTML = `<div class="file-item"><span>${icon}</span><span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${file.name}</span><span class="file-size">${formatBytes(file.size)}</span></div>`;
    area.classList.add('uploaded');
    area.innerHTML = `<i class="fas fa-check-circle" style="color:var(--success);margin-right:8px;"></i> ${file.name}`;
    renderPreview(uploadedFileType, file, previewId, previewLabelId, previewTypeId, previewBodyId);
  });
}

// ── PREVIEW RENDERING ─────────────────────────────────────────────────────────
function renderPreview(type, file, previewId, previewLabelId, previewTypeId, previewBodyId) {
  const container = document.getElementById(previewId);
  const labelEl = document.getElementById(previewLabelId);
  const typeEl = document.getElementById(previewTypeId);
  const body = document.getElementById(previewBodyId);
  if (!container || !body) return;

  container.classList.remove('hidden');
  if (labelEl) labelEl.textContent = 'Preview — ' + file.name;
  if (typeEl) typeEl.innerHTML = `<span class="code-lang-badge">${type.toUpperCase()}</span>`;

  const url = URL.createObjectURL(file);
  body.innerHTML = '';

  switch(type) {
    case 'audio': renderAudioPreview(body, url, file); break;
    case 'video': renderVideoPreview(body, url); break;
    case 'image': renderImagePreview(body, url); break;
    case 'pdf':   renderPdfPreview(body, file); break;
    case 'epub':  renderEpubPreview(body, file); break;
    case 'code':  renderCodePreview(body, file); break;
    default: body.innerHTML = `<span style="color:var(--white-dim);font-size:0.85rem;"><i class="fas fa-file" style="margin-right:8px;"></i> ${file.name} uploaded successfully</span>`;
  }
}

function renderAudioPreview(body, url, file) {
  const bars = Array.from({length:28},(_,i)=>`<div class="wave-bar" style="height:${12+Math.sin(i*0.7)*10}px;animation-delay:${i*0.06}s;"></div>`).join('');
  body.innerHTML = `<div class="audio-player" style="width:100%;padding:0 8px;">
    <div class="audio-waveform">${bars}</div>
    <audio controls style="width:100%;accent-color:var(--gold);" src="${url}"></audio>
  </div>`;
}

function renderVideoPreview(body, url) {
  body.innerHTML = `<video controls style="width:100%;max-height:260px;border-radius:3px;background:#000;" src="${url}"></video>`;
}

function renderImagePreview(body, url) {
  imageZoom = 1;
  body.innerHTML = `<div class="image-preview-wrap">
    <img id="previewImg" src="${url}" alt="Preview" style="max-width:100%;max-height:260px;border-radius:3px;transform:scale(1);transition:transform 0.2s;object-fit:contain;">
    <div class="image-zoom-controls">
      <button class="zoom-btn" onclick="changeZoom(-0.2)"><i class="fas fa-search-minus"></i></button>
      <button class="zoom-btn" onclick="changeZoom(0)"><i class="fas fa-sync-alt"></i></button>
      <button class="zoom-btn" onclick="changeZoom(0.2)"><i class="fas fa-search-plus"></i></button>
    </div>
  </div>`;
}

function changeZoom(delta) {
  if (delta === 0) { imageZoom = 1; } else { imageZoom = Math.max(0.5, Math.min(3, imageZoom + delta)); }
  const img = document.getElementById('previewImg');
  if (img) img.style.transform = `scale(${imageZoom})`;
}

function renderPdfPreview(body, file) {
  if (typeof pdfjsLib === 'undefined') {
    body.innerHTML = '<span style="color:var(--white-dim);font-size:0.85rem;"><i class="fas fa-file-pdf" style="margin-right:8px;color:var(--gold);"></i> PDF uploaded — preview requires PDF.js CDN</span>';
    return;
  }
  body.innerHTML = `<div class="pdf-preview-wrap">
    <div class="pdf-nav">
      <button id="pdfPrev" onclick="pdfPage(-1)"><i class="fas fa-chevron-left"></i></button>
      <span class="pdf-page-info" id="pdfInfo">Loading…</span>
      <button id="pdfNext" onclick="pdfPage(1)"><i class="fas fa-chevron-right"></i></button>
    </div>
    <div class="pdf-canvas-container"><canvas id="pdfCanvas"></canvas></div>
  </div>`;

  const reader = new FileReader();
  reader.onload = e => {
    pdfjsLib.getDocument(new Uint8Array(e.target.result)).promise.then(doc => {
      pdfDoc = doc; pdfCurrentPage = 1;
      renderPdfPage(pdfCurrentPage);
    }).catch(() => { body.innerHTML = '<span style="color:var(--danger);font-size:0.85rem;"><i class="fas fa-exclamation-triangle" style="margin-right:6px;"></i> Could not render PDF</span>'; });
  };
  reader.readAsArrayBuffer(file);
}

function renderPdfPage(n) {
  if (!pdfDoc) return;
  pdfDoc.getPage(n).then(page => {
    const vp = page.getViewport({scale: Math.min(1.2, 600/page.getViewport({scale:1}).width)});
    const canvas = document.getElementById('pdfCanvas');
    if (!canvas) return;
    canvas.height = vp.height; canvas.width = vp.width;
    page.render({canvasContext:canvas.getContext('2d'),viewport:vp}).promise.then(() => {
      const info = document.getElementById('pdfInfo');
      if (info) info.textContent = `Page ${n} / ${pdfDoc.numPages}`;
    });
  });
}

function pdfPage(dir) {
  if (!pdfDoc) return;
  const next = pdfCurrentPage + dir;
  if (next >= 1 && next <= pdfDoc.numPages) { pdfCurrentPage = next; renderPdfPage(pdfCurrentPage); }
}

function renderEpubPreview(body, file) {
  body.innerHTML = `<div id="epubRenderTarget" style="width:100%;min-height:220px;max-height:280px;overflow:auto;background:#f5f0e8;border-radius:3px;padding:16px;"></div>
  <div style="display:flex;gap:8px;margin-top:10px;justify-content:center;">
    <button class="zoom-btn" onclick="epubNav(-1)"><i class="fas fa-chevron-left"></i> Prev</button>
    <button class="zoom-btn" onclick="epubNav(1)">Next <i class="fas fa-chevron-right"></i></button>
  </div>`;

  if (typeof ePub === 'undefined') {
    document.getElementById('epubRenderTarget').innerHTML = '<div class="epub-fallback"><i class="fas fa-book" style="color:var(--gold);font-size:2rem;display:block;margin-bottom:10px;"></i><p>ePub uploaded. Viewer requires epub.js CDN.</p></div>';
    return;
  }
  const url = URL.createObjectURL(file);
  currentEpubBook = ePub(url);
  window._epubRendition = currentEpubBook.renderTo('epubRenderTarget', {width:'100%',height:220});
  window._epubRendition.display();
}

function epubNav(dir) {
  if (window._epubRendition) { dir > 0 ? window._epubRendition.next() : window._epubRendition.prev(); }
}

function renderCodePreview(body, file) {
  const reader = new FileReader();
  reader.onload = e => {
    const code = e.target.result.slice(0, 4000);
    const escaped = code.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    body.innerHTML = `<div class="code-preview" style="width:100%;"><pre>${escaped}</pre>${code.length >= 4000 ? '<p style="color:var(--white-dim);font-size:0.72rem;text-align:center;margin-top:6px;">… preview truncated at 4000 chars</p>' : ''}</div>`;
  };
  reader.readAsText(file);
}

// ── COLLABORATORS ─────────────────────────────────────────────────────────────
function addCoowner(email, split) {
  collaborators.push({id:Date.now(),email,split});
  renderCollaborators(); updateSplitSummary();
}

function renderCollaborators() {
  const container = document.getElementById('collaboratorList');
  container.querySelectorAll('.collaborator-item:not(:first-child)').forEach(el => el.remove());
  collaborators.forEach(c => {
    const div = document.createElement('div');
    div.className = 'collaborator-item';
    div.innerHTML = `<div class="collaborator-avatar"><i class="fas fa-user"></i></div>
      <div class="collaborator-info"><div class="collaborator-name">${c.email}</div><div class="collaborator-email">Co-owner</div></div>
      <div class="split-control"><div class="split-slider"><input type="range" min="0" max="100" value="${c.split}" class="split-slider-input" data-id="${c.id}"><span class="split-percentage split-pct-${c.id}">${c.split}%</span></div></div>
      <div class="collab-status pending">Pending</div>
      <div class="coowner-actions">
        <button class="action-btn invite-coowner" data-email="${c.email}"><i class="fas fa-envelope"></i> Invite</button>
        <button class="action-btn remove-coowner" data-id="${c.id}"><i class="fas fa-times"></i></button>
      </div>`;
    container.appendChild(div);
  });

  document.querySelectorAll('.split-slider-input').forEach(s => s.addEventListener('input', e => {
    const id = parseInt(e.target.dataset.id);
    const c = collaborators.find(x => x.id === id);
    if (c) { c.split = parseInt(e.target.value); const sp = document.querySelector('.split-pct-'+id); if(sp) sp.textContent = c.split+'%'; updateSplitSummary(); }
  }));
  document.querySelectorAll('.invite-coowner').forEach(b => b.addEventListener('click', e => alert('Invitation sent to '+e.target.closest('[data-email]').dataset.email)));
  document.querySelectorAll('.remove-coowner').forEach(b => b.addEventListener('click', e => {
    collaborators = collaborators.filter(c => c.id !== parseInt(b.dataset.id));
    renderCollaborators(); updateSplitSummary();
  }));
}

function updateSplitSummary() {
  const totalCollab = collaborators.reduce((s,c) => s+c.split, 0);
  const primary = 100 - totalCollab;
  const inp = document.getElementById('primarySplit'); const pct = document.getElementById('primaryPercent');
  if(inp) inp.value = primary; if(pct) pct.textContent = primary+'%';
  const warn = document.getElementById('splitWarning');
  if(warn) warn.textContent = primary < 0 ? '⚠ Total split exceeds 100%' : '';
  const colors = ['#C9993A','#E8C06A','#9B7520','#3DB87A','#E8A040'];
  let html = `<div class="split-piece"><div class="split-circle" style="background:${colors[0]};"></div><div class="split-label">You · ${primary}%</div></div>`;
  collaborators.forEach((c,i) => { html += `<div class="split-piece"><div class="split-circle" style="background:${colors[(i+1)%colors.length]};"></div><div class="split-label">${c.email.split('@')[0]} · ${c.split}%</div></div>`; });
  const sv = document.getElementById('splitVisual'); if(sv) sv.innerHTML = html;
}

// ── CERTIFICATE GENERATION ────────────────────────────────────────────────────
function generateCertId() {
  const now = new Date();
  return `SR-${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
}

function buildCertDetails(title, workTypeText, ownerRows, certId) {
  const now = new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'});
  return `<div style="display:grid;gap:10px;font-size:0.88rem;">
    <div><strong style="color:var(--white-dim);font-size:0.72rem;text-transform:uppercase;letter-spacing:0.08em;">Certificate ID</strong><br><span style="font-family:monospace;color:var(--gold-light);">${certId}</span></div>
    <div><strong style="color:var(--white-dim);font-size:0.72rem;text-transform:uppercase;letter-spacing:0.08em;">Work Title</strong><br>${title}</div>
    <div><strong style="color:var(--white-dim);font-size:0.72rem;text-transform:uppercase;letter-spacing:0.08em;">Work Type</strong><br>${workTypeText}</div>
    <div><strong style="color:var(--white-dim);font-size:0.72rem;text-transform:uppercase;letter-spacing:0.08em;">Certified On</strong><br>${now}</div>
    <div class="cert-ownership-block"><strong><i class="fas fa-shield-alt" style="margin-right:5px;"></i> Ownership</strong>${ownerRows}</div>
  </div>`;
}

// ── EVENT LISTENERS ───────────────────────────────────────────────────────────
document.getElementById('workType').addEventListener('change', () => {
  const wt = document.getElementById('workType').value;
  document.getElementById('workTypeIcon').textContent = typeIcons[wt] || '📄';
  // update upload area hint
  const hint = {audio:'audio files (MP3, WAV, FLAC…)',video:'video files (MP4, MOV, AVI…)',image:'image files (JPG, PNG, GIF…)',epub:'EPUB ebook file',pdf:'PDF document',code:'code files (JS, PY, TS…)'};
  ['soloUploadArea','primaryUploadArea'].forEach(id => {
    const el = document.getElementById(id);
    if (el && !el.classList.contains('uploaded')) el.innerHTML = `<i class="fas fa-cloud-upload-alt"></i> Click to upload or drag &amp; drop ${hint[wt]||'your file'}`;
  });
});

document.getElementById('nextToDetailsBtn').addEventListener('click', () => showStep(2));
document.getElementById('nextToOwnershipBtn').addEventListener('click', () => {
  if (!document.getElementById('workTitle').value.trim()) { alert('Please enter a work title.'); return; }
  showStep(3);
});

document.getElementById('soloModeBtn').addEventListener('click', () => {
  mode = 'solo';
  document.getElementById('soloModeBtn').classList.add('active');
  document.getElementById('collabModeBtn').classList.remove('active');
  updateStepUI();
});
document.getElementById('collabModeBtn').addEventListener('click', () => {
  mode = 'collab';
  document.getElementById('collabModeBtn').classList.add('active');
  document.getElementById('soloModeBtn').classList.remove('active');
  updateStepUI();
});

document.getElementById('nextToUploadBtn').addEventListener('click', () => {
  if (!mode) { alert('Please select an ownership type.'); return; }
  showStep(4);
  document.getElementById('soloContent').classList.toggle('hidden', mode !== 'solo');
  document.getElementById('collabContent').classList.toggle('hidden', mode !== 'collab');
});

document.getElementById('addCollaboratorBtn').addEventListener('click', () => {
  const email = prompt('Enter co-owner email address:');
  if (!email || !email.includes('@')) { if(email !== null) alert('Please enter a valid email.'); return; }
  const maxSplit = 100 - collaborators.reduce((s,c) => s+c.split, 0);
  const splitStr = prompt(`Enter ownership % for ${email} (max ${maxSplit}):`, Math.floor(maxSplit/2));
  const split = parseInt(splitStr);
  if (isNaN(split) || split < 1 || split > maxSplit) { alert('Invalid split percentage.'); return; }
  addCoowner(email, split);
});

document.getElementById('finalizeBtn').addEventListener('click', () => {
  const title = document.getElementById('workTitle').value.trim() || 'Untitled Work';
  const workTypeEl = document.getElementById('workType');
  const workTypeText = workTypeEl.options[workTypeEl.selectedIndex].text.trim();
  const certId = generateCertId();

  if (mode === 'solo') {
    const ownerRows = `<div class="cert-ownership-row"><span>You (Primary Creator)</span><span style="color:var(--gold);font-weight:600;">100%</span></div>`;
    document.getElementById('certificateDetails').innerHTML = buildCertDetails(title, workTypeText, ownerRows, certId);
    document.getElementById('certIdLine').textContent = certId + ' · ' + new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'});
    showStep(5);
    // Plan-based redirect
    if (selectedPlan === 'free') {
      setTimeout(() => { window.location.href = 'certificate_loader.html'; }, 400);
    } else {
      setTimeout(() => { window.location.href = 'pay.html'; }, 400);
    }
  } else {
    if (collaborators.length === 0) { alert('Please add at least one co-owner.'); return; }
    const inviteList = document.getElementById('inviteList');
    if (inviteList) inviteList.innerHTML = collaborators.map(c => `<div style="padding:8px 0;border-bottom:1px solid var(--border);font-size:0.85rem;color:var(--white-dim);"><i class="fas fa-envelope" style="margin-right:8px;color:var(--gold);"></i>${c.email} — ${c.split}% share</div>`).join('');
    const shareLink = document.getElementById('shareLink');
    if (shareLink) shareLink.value = `${location.origin}/verify?cert=${certId}`;
    document.getElementById('inviteModal').classList.add('active');
  }
});

document.getElementById('closeModalBtn').addEventListener('click', () => {
  document.getElementById('inviteModal').classList.remove('active');
  const title = document.getElementById('workTitle').value.trim() || 'Untitled Work';
  const workTypeEl = document.getElementById('workType');
  const workTypeText = workTypeEl.options[workTypeEl.selectedIndex].text.trim();
  const primary = 100 - collaborators.reduce((s,c) => s+c.split, 0);
  const certId = generateCertId();
  const ownerRows = `<div class="cert-ownership-row"><span>You (Primary Creator)</span><span style="color:var(--gold);font-weight:600;">${primary}%</span></div>` +
    collaborators.map(c => `<div class="cert-ownership-row"><span>${c.email}</span><span style="color:var(--gold);font-weight:600;">${c.split}%</span></div>`).join('');
  document.getElementById('certificateDetails').innerHTML = buildCertDetails(title, workTypeText, ownerRows, certId);
  document.getElementById('certIdLine').textContent = certId + ' · ' + new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'});
  showStep(5);
  if (selectedPlan === 'free') { setTimeout(() => { window.location.href = 'certificate_loader.html'; }, 400); }
  else { setTimeout(() => { window.location.href = 'pay.html'; }, 400); }
});

document.getElementById('downloadCertBtn').addEventListener('click', () => alert('✓ Certificate downloaded. Your blockchain proof of ownership has been saved.'));

function copyLink() {
  const link = document.getElementById('shareLink');
  if (link) { link.select(); document.execCommand('copy'); alert('Invite link copied!'); }
}

// ── INIT FILE UPLOADS ─────────────────────────────────────────────────────────
setupFileUpload('soloUploadArea','soloFileInput','soloFileList','soloPreview','soloPreviewLabel','soloPreviewType','soloPreviewBody','soloProgress','soloProgressBar','soloProgressText');
setupFileUpload('primaryUploadArea','primaryFileInput','primaryFileList','primaryPreview','primaryPreviewLabel','primaryPreviewType','primaryPreviewBody','primaryProgress','primaryProgressBar','primaryProgressText');
updateStepUI();
