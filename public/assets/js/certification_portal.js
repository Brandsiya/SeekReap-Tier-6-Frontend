/* certification_portal.js — complete portal logic with all fixes */
'use strict';

const TIER4_URL = 'https://seekreap-tier-4-dev.fly.dev';

// ── GLOBAL STATE ──────────────────────────────────────────────────────────────
window.selectedPlan  = 'free';
window.mode          = null;
window.collaborators = [];
window.uploadedFile  = null;

const CertificationState = {
  submissionId: null, certId: null, status: 'idle', error: null, data: null,
};

const STEP_CARDS = {
  1: 'step1Card', 2: 'step2Card', 3: 'step3Card', 4: 'step4Card',
  '5c': 'step5collabCard', 'final': 'stepFinalCard',
};

// ── PLAN SELECTION ────────────────────────────────────────────────────────────
function selectPlan(card) {
  document.querySelectorAll('.plan-card').forEach(function(c) { c.classList.remove('selected'); });
  card.classList.add('selected');
  window.selectedPlan = card.dataset.plan || 'free';
}
window.selectPlan = selectPlan;

// ── STEP NAVIGATION ───────────────────────────────────────────────────────────
function showStep(step) {
  Object.values(STEP_CARDS).forEach(function(id) {
    var el = document.getElementById(id); if (el) el.classList.add('hidden');
  });
  var cardId = STEP_CARDS[step];
  if (cardId) { var el = document.getElementById(cardId); if (el) el.classList.remove('hidden'); }

  [1,2,3,4].forEach(function(n) {
    var el = document.getElementById('step' + n); if (!el) return;
    el.classList.remove('active','completed');
    var num = typeof step === 'number' ? step : 99;
    if (n < num) el.classList.add('completed');
    else if (n === num) el.classList.add('active');
  });
  var s5 = document.getElementById('step5c');
  if (s5) {
    s5.classList.remove('active','completed');
    if (step === '5c') s5.classList.add('active');
    else if (step === 'final' && window.mode === 'collab') s5.classList.add('completed');
  }
  var sf = document.getElementById('stepFinal');
  if (sf) { sf.classList.remove('active','completed'); if (step === 'final') sf.classList.add('active'); }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
window.showStep = showStep;

// ── WAIT FOR AUTH ─────────────────────────────────────────────────────────────
function waitForAuth(timeoutMs) {
  timeoutMs = timeoutMs || 6000;
  if (window.currentUser !== undefined && window.currentUser !== null)
    return Promise.resolve(window.currentUser);
  return new Promise(function(resolve) {
    var timer = setTimeout(function() { resolve(window.currentUser || null); }, timeoutMs);
    document.addEventListener('authReady', function(e) {
      clearTimeout(timer); resolve((e.detail && e.detail.user) || null);
    }, { once: true });
  });
}

// ── STATUS UI ─────────────────────────────────────────────────────────────────
var STATUS_CONFIG = {
  queued:     { color:'#E8A040', bg:'rgba(232,160,64,0.1)',  icon:'\u23F3', text:'Certification queued \u2014 processing will begin shortly\u2026' },
  processing: { color:'#569cd6', bg:'rgba(86,156,214,0.1)', icon:'\uD83D\uDD04', text:'Analysing your work \u2014 this may take a few moments\u2026' },
  analyzed:   { color:'#3DB87A', bg:'rgba(61,184,122,0.08)',icon:'\uD83D\uDD2C', text:'Analysis complete \u2014 finalising certificate\u2026' },
  completed:  { color:'#3DB87A', bg:'rgba(61,184,122,0.1)', icon:'\u2705', text:'Certification complete!' },
  failed:     { color:'#E05555', bg:'rgba(224,85,85,0.1)',   icon:'\u274C', text:'Certification failed.' },
};

function getOrCreateStatusEl() {
  var el = document.getElementById('certificationStatus');
  if (!el) {
    el = document.createElement('div');
    el.id = 'certificationStatus';
    el.style.cssText = 'margin-top:14px;padding:11px 16px;border-radius:4px;font-size:0.85rem;display:none;';
    var btn = document.getElementById('finalizeBtn');
    if (btn && btn.parentNode) btn.parentNode.insertBefore(el, btn.nextSibling);
  }
  return el;
}

function updateUIBasedOnState() {
  var el = getOrCreateStatusEl();
  var btn = document.getElementById('finalizeBtn') ||
            document.getElementById('step4NextBtn');
  var cfg = STATUS_CONFIG[CertificationState.status];
  if (!cfg) { el.style.display = 'none'; return; }
  var msg = cfg.text;
  if (CertificationState.status === 'completed' && CertificationState.certId)
    msg += ' Certificate ID: <strong style="font-family:monospace;color:' + cfg.color + ';">' + CertificationState.certId + '</strong>';
  if (CertificationState.status === 'failed' && CertificationState.error)
    msg += ' ' + escHtml(CertificationState.error);
  el.style.cssText = 'margin-top:14px;padding:11px 16px;border-radius:4px;font-size:0.85rem;background:' +
    cfg.bg + ';border:1px solid ' + cfg.color + '44;color:' + cfg.color + ';display:block;';
  el.innerHTML = cfg.icon + ' ' + msg;
  if (btn) btn.disabled = ['queued','processing'].indexOf(CertificationState.status) !== -1;
}

// ── POLLING ───────────────────────────────────────────────────────────────────
function pollCertificationStatus(submissionId, maxAttempts, intervalMs) {
  maxAttempts = maxAttempts || 60; intervalMs = intervalMs || 3000; var attempts = 0;
  function poll() {
    attempts++;
    fetch(TIER4_URL + '/api/certify/' + encodeURIComponent(submissionId))
      .then(function(res) { if (!res.ok) throw new Error('HTTP ' + res.status); return res.json(); })
      .then(function(data) {
        CertificationState.submissionId = submissionId;
        CertificationState.certId   = data.cert_id   || CertificationState.certId;
        CertificationState.status   = data.status    || CertificationState.status;
        CertificationState.data     = data;
        updateUIBasedOnState();
        if (data.status === 'completed' || data.status === 'analyzed') {
          CertificationState.status = 'completed'; updateUIBasedOnState(); renderCompletedState(data);
          sessionStorage.setItem('activeCert', JSON.stringify({ submission_id: submissionId,
            cert_id: data.cert_id || CertificationState.certId, plan: data.plan || 'free',
            title: data.title || '', status: 'completed' }));
          sessionStorage.removeItem('activeCertification'); return;
        }
        if (data.status === 'failed') {
          CertificationState.status = 'failed';
          CertificationState.error  = data.failure_reason || 'Processing failed';
          updateUIBasedOnState(); renderErrorState(data); return;
        }
        if (attempts < maxAttempts) setTimeout(poll, intervalMs);
        else { CertificationState.status = 'failed'; CertificationState.error = 'Timed out.'; updateUIBasedOnState(); }
      })
      .catch(function(err) {
        console.warn('Poll ' + attempts, err.message);
        if (attempts < maxAttempts) setTimeout(poll, intervalMs);
        else { CertificationState.status = 'failed'; CertificationState.error = err.message; updateUIBasedOnState(); }
      });
  }
  poll();
}

// ── RENDER COMPLETED ──────────────────────────────────────────────────────────
function renderCompletedState(data) {
  var certId    = data.cert_id || CertificationState.certId || '\u2014';
  var title     = data.title   || (document.getElementById('workTitle') || {}).value || 'Your Work';
  var riskScore = data.overall_risk_score != null ? data.overall_risk_score : '\u2014';
  var riskLevel = data.risk_level || '\u2014';
  var plan      = data.plan || window.selectedPlan || 'free';
  var now       = new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'});
  var certIdLine = document.getElementById('certIdLine');
  if (certIdLine) certIdLine.textContent = certId + ' \u00B7 ' + now;
  var certDetails = document.getElementById('certificateDetails');
  if (certDetails) {
    var collabs = window.collaborators || [];
    var primaryPct = window.mode === 'collab'
      ? (100 - collabs.reduce(function(s,c){ return s + c.split; }, 0)) + '%' : '100%';
    var ownerRows = '<div class="cert-ownership-row"><span>You (Primary Creator)</span><span>' + primaryPct + '</span></div>';
    if (window.mode === 'collab') collabs.forEach(function(c) {
      ownerRows += '<div class="cert-ownership-row"><span>' + escHtml(c.fullName || c.email) + '</span><span>' + c.split + '%</span></div>';
    });
    var workTypeEl = document.getElementById('workType');
    var workTypeText = workTypeEl ? workTypeEl.options[workTypeEl.selectedIndex].text.trim() : '\u2014';
    var riskColor = riskLevel === 'low' ? 'var(--success)' : riskLevel === 'medium' ? 'var(--warning)' : 'var(--danger)';
    certDetails.innerHTML =
      '<div style="display:grid;gap:10px;font-size:0.88rem;">' +
        '<div><strong style="color:var(--white-dim);font-size:0.72rem;text-transform:uppercase;letter-spacing:0.08em;">Certificate ID</strong><br>' +
          '<span style="font-family:monospace;color:var(--gold-light);">' + escHtml(certId) + '</span></div>' +
        '<div><strong style="color:var(--white-dim);font-size:0.72rem;text-transform:uppercase;letter-spacing:0.08em;">Work Title</strong><br>' + escHtml(title) + '</div>' +
        '<div><strong style="color:var(--white-dim);font-size:0.72rem;text-transform:uppercase;letter-spacing:0.08em;">Work Type</strong><br>' + escHtml(workTypeText) + '</div>' +
        '<div><strong style="color:var(--white-dim);font-size:0.72rem;text-transform:uppercase;letter-spacing:0.08em;">Plan</strong><br>' + escHtml(plan) + '</div>' +
        '<div><strong style="color:var(--white-dim);font-size:0.72rem;text-transform:uppercase;letter-spacing:0.08em;">Risk Level</strong><br>' +
          '<span style="color:' + riskColor + ';">' + escHtml(String(riskLevel)) + ' (' + riskScore + ')</span></div>' +
        '<div><strong style="color:var(--white-dim);font-size:0.72rem;text-transform:uppercase;letter-spacing:0.08em;">Certified On</strong><br>' + now + '</div>' +
        '<div class="cert-ownership-block"><strong><i class="fas fa-shield-alt" style="margin-right:5px;"></i>Ownership</strong>' + ownerRows + '</div>' +
      '</div>' +
      '<div style="margin-top:14px;display:flex;gap:10px;flex-wrap:wrap;">' +
        '<a href="verification_portal.html?cert=' + encodeURIComponent(certId) + '" target="_blank"' +
           ' style="display:inline-flex;align-items:center;gap:7px;padding:8px 16px;background:var(--gold-glow);border:1px solid var(--border-strong);border-radius:3px;color:var(--gold-light);font-size:0.82rem;text-decoration:none;font-weight:600;">' +
          '<i class="fas fa-external-link-alt"></i> Verify Certificate</a>' +
        '<button onclick="navigator.clipboard.writeText(window.location.origin+\'/verification_portal.html?cert=' + encodeURIComponent(certId) + '\').then(function(){alert(\'Link copied\')})"' +
           ' style="display:inline-flex;align-items:center;gap:7px;padding:8px 16px;background:transparent;border:1px solid var(--border);border-radius:3px;color:var(--white-dim);font-size:0.82rem;cursor:pointer;">' +
          '<i class="fas fa-link"></i> Copy Link</button>' +
      '</div>';
  }
  showStep('final');
}

function renderErrorState(data) {
  var msg = data.failure_reason || CertificationState.error || 'Certification failed';
  var el = getOrCreateStatusEl();
  el.style.cssText = 'margin-top:14px;padding:11px 16px;border-radius:4px;font-size:0.85rem;background:rgba(224,85,85,0.1);border:1px solid rgba(224,85,85,0.3);color:#E05555;display:block;';
  el.innerHTML = '\u274C ' + escHtml(msg) + ' \u2014 <a href="certification_portal.html" style="color:#E05555;text-decoration:underline;">Try again</a>';
}

// ── HYDRATION ─────────────────────────────────────────────────────────────────
function hydrateFromSubmissionId(submissionId) {
  if (!submissionId) return Promise.resolve(false);
  return fetch(TIER4_URL + '/api/certify/' + encodeURIComponent(submissionId))
    .then(function(res) {
      if (!res.ok) return false;
      return res.json().then(function(data) {
        CertificationState.submissionId = submissionId; CertificationState.certId = data.cert_id;
        CertificationState.status = data.status; CertificationState.data = data;
        updateUIBasedOnState();
        var s = data.status;
        if (s === 'queued' || s === 'processing' || s === 'analyzed') pollCertificationStatus(submissionId);
        else if (s === 'completed') renderCompletedState(data);
        else if (s === 'failed')    renderErrorState(data);
        return true;
      });
    })
    .catch(function(err) { console.warn('Hydration failed:', err.message); return false; });
}

// ── FILE UPLOAD ───────────────────────────────────────────────────────────────
var TYPE_ICONS = { audio:'\uD83C\uDFB5', video:'\uD83C\uDFAC', image:'\uD83D\uDDBC\uFE0F', epub:'\uD83D\uDCD6', pdf:'\uD83D\uDCC4', code:'\uD83D\uDCBB', other:'\uD83D\uDCC4' };
var TYPE_ACCEPT = {
  audio:'audio/*', video:'video/*', image:'image/*', epub:'.epub', pdf:'.pdf',
  code:'.js,.ts,.py,.html,.css,.json,.java,.c,.cpp,.rb,.php,.go,.rs,.txt,.md', other:'*/*',
};

function fmtBytes(b) {
  if (b < 1024) return b + ' B'; if (b < 1048576) return (b/1024).toFixed(1) + ' KB';
  return (b/1048576).toFixed(1) + ' MB';
}

function setupUploadArea(cfg) {
  var area = document.getElementById(cfg.areaId), input = document.getElementById(cfg.inputId);
  var resetBtn = document.getElementById(cfg.resetId), textEl = document.getElementById(cfg.textId);
  var fileInfo = document.getElementById(cfg.infoId), iconEl = document.getElementById(cfg.iconId);
  var nameEl = document.getElementById(cfg.nameId), sizeEl = document.getElementById(cfg.sizeId);
  var progressW = document.getElementById(cfg.progressId), progressB = document.getElementById(cfg.barId);
  var progressT = document.getElementById(cfg.progTextId);
  if (!area || !input) return;

  function getWorkType() { return (document.getElementById('workType') || {}).value || 'other'; }
  function refreshAccept() { input.accept = TYPE_ACCEPT[getWorkType()] || '*/*'; }
  refreshAccept();
  var wtSel = document.getElementById('workType');
  if (wtSel) wtSel.addEventListener('change', refreshAccept);

  area.addEventListener('click', function(e) {
    if (e.target === resetBtn || (resetBtn && resetBtn.contains(e.target))) return;
    refreshAccept(); input.click();
  });
  area.addEventListener('dragover', function(e) { e.preventDefault(); area.classList.add('dragover'); });
  area.addEventListener('dragleave', function() { area.classList.remove('dragover'); });
  area.addEventListener('drop', function(e) {
    e.preventDefault(); area.classList.remove('dragover');
    var f = e.dataTransfer.files[0]; if (f) handleFile(f);
  });
  input.addEventListener('change', function(e) { var f = e.target.files[0]; if (f) handleFile(f); });
  if (resetBtn) resetBtn.addEventListener('click', function(e) { e.stopPropagation(); resetUpload(); });

  function handleFile(file) {
    window.uploadedFile = file;
    var wt = getWorkType(), icon = TYPE_ICONS[wt] || '\uD83D\uDCC4';
    if (progressW) progressW.style.display = 'block';
    var pct = 0;
    var iv = setInterval(function() {
      pct = Math.min(pct + 15, 100);
      if (progressB) progressB.style.width = pct + '%';
      if (progressT) progressT.textContent = pct + '%';
      if (pct >= 100) {
        clearInterval(iv);
        setTimeout(function() {
          if (progressW) progressW.style.display = 'none';
          area.classList.add('uploaded');
          if (textEl) textEl.textContent = file.name;
          if (iconEl) iconEl.textContent = icon;
          if (nameEl) nameEl.textContent = file.name;
          if (sizeEl) sizeEl.textContent = fmtBytes(file.size);
          if (fileInfo) fileInfo.classList.add('visible');
          renderPreview(cfg, file, wt);
        }, 150);
      }
    }, 80);
  }

  function resetUpload() {
    window.uploadedFile = null; input.value = '';
    area.classList.remove('uploaded','dragover');
    if (textEl) textEl.textContent = 'Click to upload or drag & drop';
    if (fileInfo) fileInfo.classList.remove('visible');
    if (progressW) progressW.style.display = 'none';
    var embed = document.getElementById(cfg.embedId);
    if (embed) { embed.classList.remove('visible'); embed.innerHTML = ''; }
    var label = document.getElementById(cfg.labelId); if (label) label.classList.remove('visible');
    var stats = document.getElementById(cfg.statsId); if (stats) stats.style.display = 'none';
  }
}

function renderPreview(cfg, file, wt) {
  var embed = document.getElementById(cfg.embedId), label = document.getElementById(cfg.labelId);
  if (!embed) return;
  embed.innerHTML = ''; embed.classList.add('visible');
  var url = URL.createObjectURL(file);

  // ── AUDIO ──────────────────────────────────────────────────────────────────
  if (wt === 'audio') {
    if (label) { label.textContent = 'Audio Player'; label.classList.add('visible'); }
    embed.innerHTML =
      '<div class="ve-audio">' +
        '<div class="ve-now-playing">' +
          '<div class="ve-album"><i class="fas fa-music"></i></div>' +
          '<div><div class="ve-track-title">' + escHtml(file.name.replace(/\.[^.]+$/, '')) + '</div></div>' +
        '</div>' +
        '<div class="ve-progress-row">' +
          '<div class="ve-time-row"><span id="veAT_' + cfg.areaId + '">0:00</span><span id="veDur_' + cfg.areaId + '">\u2014</span></div>' +
          '<div class="ve-progress-track" id="veTrack_' + cfg.areaId + '"><div class="ve-progress-fill" id="veFill_' + cfg.areaId + '"></div></div>' +
        '</div>' +
        '<div class="ve-btn-row">' +
          '<button class="ve-ctrl" id="vePrev_' + cfg.areaId + '" title="Previous" disabled style="opacity:0.35;cursor:not-allowed;"><i class="fas fa-step-backward"></i></button>' +
          '<button class="ve-ctrl" id="veRew_' + cfg.areaId + '" title="Rewind 10s" style="position:relative;"><i class="fas fa-undo" style="font-size:0.72rem;"></i><sup style="font-size:0.55rem;position:absolute;right:4px;top:4px;">10</sup></button>' +
          '<button class="ve-ctrl play" id="vePlay_' + cfg.areaId + '"><i class="fas fa-play"></i></button>' +
          '<button class="ve-ctrl" id="veFFwd_' + cfg.areaId + '" title="Forward 10s" style="position:relative;"><i class="fas fa-redo" style="font-size:0.72rem;"></i><sup style="font-size:0.55rem;position:absolute;right:4px;top:4px;">10</sup></button>' +
          '<button class="ve-ctrl" id="veNext_' + cfg.areaId + '" title="Next" disabled style="opacity:0.35;cursor:not-allowed;"><i class="fas fa-step-forward"></i></button>' +
        '</div>' +
        '<div class="ve-vol-row"><i class="fas fa-volume-down"></i><input type="range" class="ve-vol" min="0" max="1" step="0.02" value="0.8" id="veVol_' + cfg.areaId + '"><i class="fas fa-volume-up"></i></div>' +
        '<audio id="veAudio_' + cfg.areaId + '" src="' + url + '" style="display:none;"></audio>' +
      '</div>';
    setTimeout(function() {
      var audio = document.getElementById('veAudio_' + cfg.areaId);
      var playBtn = document.getElementById('vePlay_' + cfg.areaId);
      var fill    = document.getElementById('veFill_' + cfg.areaId);
      var track   = document.getElementById('veTrack_' + cfg.areaId);
      var curEl   = document.getElementById('veAT_' + cfg.areaId);
      var durEl   = document.getElementById('veDur_' + cfg.areaId);
      var volEl   = document.getElementById('veVol_' + cfg.areaId);
      var rewBtn  = document.getElementById('veRew_' + cfg.areaId);
      var fwdBtn  = document.getElementById('veFFwd_' + cfg.areaId);
      if (!audio) return;
      function fmt(s) { s = Math.floor(s || 0); return Math.floor(s/60) + ':' + String(s%60).padStart(2,'0'); }
      audio.addEventListener('loadedmetadata', function() { if (durEl) durEl.textContent = fmt(audio.duration); });
      audio.addEventListener('timeupdate', function() {
        if (curEl) curEl.textContent = fmt(audio.currentTime);
        if (fill && audio.duration) fill.style.width = (audio.currentTime / audio.duration * 100) + '%';
      });
      audio.addEventListener('ended', function() { if (playBtn) playBtn.innerHTML = '<i class="fas fa-play"></i>'; });
      if (playBtn) playBtn.addEventListener('click', function() {
        if (audio.paused) { audio.play(); playBtn.innerHTML = '<i class="fas fa-pause"></i>'; }
        else { audio.pause(); playBtn.innerHTML = '<i class="fas fa-play"></i>'; }
      });
      if (track) track.addEventListener('click', function(e) {
        var r = track.getBoundingClientRect();
        audio.currentTime = ((e.clientX - r.left) / r.width) * audio.duration;
      });
      if (volEl) volEl.addEventListener('input', function() { audio.volume = parseFloat(volEl.value); });
      if (rewBtn) rewBtn.addEventListener('click', function() { audio.currentTime = Math.max(0, audio.currentTime - 10); });
      if (fwdBtn) fwdBtn.addEventListener('click', function() { audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 10); });
    }, 50);

  // ── VIDEO ─────────────────────────────────────────────────────────────────
  } else if (wt === 'video') {
    if (label) { label.textContent = 'Video Preview'; label.classList.add('visible'); }
    embed.innerHTML = '<div class="ve-video"><video controls src="' + url + '" style="max-height:260px;"></video></div>';

  // ── IMAGE (zoom + rotate, no reset) ──────────────────────────────────────
  } else if (wt === 'image') {
    if (label) { label.textContent = 'Image Preview'; label.classList.add('visible'); }
    var imgId = 'veImg_' + cfg.areaId;
    // Helper to update transform from data attributes
    var upd = 'function(el){el.style.transform="scale("+parseFloat(el.dataset.sc||"1")+") rotate("+parseInt(el.dataset.rt||"0")+"deg)"}';
    embed.innerHTML =
      '<div class="ve-toolbar">' +
        '<button class="ve-btn" onclick="(function(){var el=document.getElementById(\'' + imgId + '\');el.dataset.sc=Math.min(parseFloat(el.dataset.sc||1)+0.2,3);(' + upd + ')(el)})()"><i class="fas fa-search-plus"></i> Zoom In</button>' +
        '<button class="ve-btn" onclick="(function(){var el=document.getElementById(\'' + imgId + '\');el.dataset.sc=Math.max(parseFloat(el.dataset.sc||1)-0.2,0.3);(' + upd + ')(el)})()"><i class="fas fa-search-minus"></i> Zoom Out</button>' +
        '<button class="ve-btn" onclick="(function(){var el=document.getElementById(\'' + imgId + '\');el.dataset.rt=parseInt(el.dataset.rt||0)-90;(' + upd + ')(el)})()"><i class="fas fa-undo"></i> Rotate L</button>' +
        '<button class="ve-btn" onclick="(function(){var el=document.getElementById(\'' + imgId + '\');el.dataset.rt=parseInt(el.dataset.rt||0)+90;(' + upd + ')(el)})()"><i class="fas fa-redo"></i> Rotate R</button>' +
      '</div>' +
      '<div class="ve-image" style="overflow:hidden;max-height:300px;">' +
        '<img id="' + imgId + '" src="' + url + '" alt="Preview" data-sc="1" data-rt="0"' +
          ' style="max-width:100%;max-height:280px;object-fit:contain;transform-origin:center;transition:transform 0.25s;">' +
      '</div>';

  // ── PDF (page nav + zoom) ─────────────────────────────────────────────────
  } else if (wt === 'pdf') {
    if (label) { label.textContent = 'PDF Document Viewer'; label.classList.add('visible'); }
    if (typeof pdfjsLib === 'undefined') {
      embed.innerHTML = '<div style="padding:20px;color:var(--white-dim);font-size:0.85rem;"><i class="fas fa-file-pdf" style="color:var(--gold);margin-right:8px;"></i>PDF uploaded. Preview unavailable.</div>';
      return;
    }
    var canvasId = 'vePdfCanvas_' + cfg.areaId, infoId2 = 'vePdfInfo_' + cfg.areaId;
    embed.innerHTML =
      '<div class="ve-toolbar">' +
        '<button class="ve-btn" id="vePdfPrev_' + cfg.areaId + '" disabled><i class="fas fa-chevron-left"></i> Prev</button>' +
        '<span class="ve-info" id="' + infoId2 + '">Loading\u2026</span>' +
        '<button class="ve-btn" id="vePdfNext_' + cfg.areaId + '"><i class="fas fa-chevron-right"></i> Next</button>' +
        '<div style="flex:1;"></div>' +
        '<button class="ve-btn" id="vePdfZoomIn_' + cfg.areaId + '"><i class="fas fa-search-plus"></i> Zoom In</button>' +
        '<button class="ve-btn" id="vePdfZoomOut_' + cfg.areaId + '"><i class="fas fa-search-minus"></i> Zoom Out</button>' +
      '</div>' +
      '<div class="ve-pdf"><canvas id="' + canvasId + '"></canvas></div>';

    var reader = new FileReader();
    reader.onload = function(e) {
      pdfjsLib.getDocument({ data: e.target.result }).promise.then(function(doc) {
        var pageNum = 1, pdfScale = 1.2;
        function renderPage(n) {
          doc.getPage(n).then(function(page) {
            var baseW  = page.getViewport({ scale: 1 }).width;
            var fitSc  = Math.min(pdfScale, 580 / baseW);
            var vp = page.getViewport({ scale: fitSc });
            var canvas = document.getElementById(canvasId); if (!canvas) return;
            canvas.height = vp.height; canvas.width = vp.width;
            page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise.then(function() {
              var info = document.getElementById(infoId2);
              if (info) info.textContent = 'Page ' + n + ' / ' + doc.numPages;
              var prev = document.getElementById('vePdfPrev_' + cfg.areaId);
              var next = document.getElementById('vePdfNext_' + cfg.areaId);
              if (prev) prev.disabled = n <= 1; if (next) next.disabled = n >= doc.numPages;
            });
          });
        }
        renderPage(pageNum);
        var prev = document.getElementById('vePdfPrev_' + cfg.areaId);
        var next = document.getElementById('vePdfNext_' + cfg.areaId);
        var zIn  = document.getElementById('vePdfZoomIn_'  + cfg.areaId);
        var zOut = document.getElementById('vePdfZoomOut_' + cfg.areaId);
        if (prev) prev.addEventListener('click', function() { if (pageNum > 1) renderPage(--pageNum); });
        if (next) next.addEventListener('click', function() { if (pageNum < doc.numPages) renderPage(++pageNum); });
        if (zIn)  zIn.addEventListener('click',  function() { pdfScale = Math.min(pdfScale + 0.3, 4); renderPage(pageNum); });
        if (zOut) zOut.addEventListener('click', function() { pdfScale = Math.max(pdfScale - 0.3, 0.4); renderPage(pageNum); });
      }).catch(function() {
        embed.innerHTML = '<div style="padding:14px;color:var(--danger);">Could not render PDF.</div>';
      });
    };
    reader.readAsArrayBuffer(file);

  // ── EPUB ──────────────────────────────────────────────────────────────────
  } else if (wt === 'epub') {
    if (label) { label.textContent = 'EPUB Reader'; label.classList.add('visible'); }
    var epubTargetId = 'veEpub_' + cfg.areaId;
    embed.innerHTML =
      '<div class="ve-toolbar">' +
        '<button class="ve-btn" id="veEpubPrev_' + cfg.areaId + '"><i class="fas fa-chevron-left"></i> Prev</button>' +
        '<button class="ve-btn" id="veEpubNext_' + cfg.areaId + '">Next <i class="fas fa-chevron-right"></i></button>' +
      '</div>' +
      '<div class="ve-epub" id="' + epubTargetId + '" style="min-height:220px;"></div>';
    if (typeof ePub === 'undefined') {
      document.getElementById(epubTargetId).innerHTML =
        '<div style="padding:20px;color:var(--white-dim);font-size:0.85rem;"><i class="fas fa-book" style="color:var(--gold);margin-right:8px;"></i>EPUB uploaded successfully.</div>';
      return;
    }
    var book = ePub(url), rendition = book.renderTo(epubTargetId, { width:'100%', height:220 });
    rendition.display();
    var ep = document.getElementById('veEpubPrev_' + cfg.areaId), en = document.getElementById('veEpubNext_' + cfg.areaId);
    if (ep) ep.addEventListener('click', function() { rendition.prev(); });
    if (en) en.addEventListener('click', function() { rendition.next(); });

  // ── CODE (icon label, preview, split, zoom) ───────────────────────────────
  } else if (wt === 'code') {
    if (label) {
      label.innerHTML = '<i class="fas fa-code" style="margin-right:5px;color:var(--gold);"></i>Code Viewer';
      label.classList.add('visible');
    }
    var reader2 = new FileReader();
    reader2.onload = function(ev) {
      var raw  = ev.target.result;
      var code = raw.slice(0, 8000);
      var codeId    = 'veCodeArea_' + cfg.areaId;
      var lineNumId = 'veLineNums_' + cfg.areaId;
      var previewId = 'veCodePreviewPane_' + cfg.areaId;
      var ext = file.name.split('.').pop().toLowerCase();

      embed.innerHTML =
        '<div class="ve-toolbar">' +
          '<span class="ve-info"><i class="fas fa-file-code" style="margin-right:5px;"></i>' + escHtml(file.name) + '</span>' +
          '<div style="flex:1;"></div>' +
          '<button class="ve-btn" id="veCodePrev_'   + cfg.areaId + '" title="Preview"><i class="fas fa-eye"></i> Preview</button>' +
          '<button class="ve-btn" id="veCodeSplit_'  + cfg.areaId + '" title="Toggle line numbers"><i class="fas fa-columns"></i> Split</button>' +
          '<button class="ve-btn" id="veCodeZoomIn_' + cfg.areaId + '" title="Zoom in"><i class="fas fa-search-plus"></i></button>' +
          '<button class="ve-btn" id="veCodeZoomOut_'+ cfg.areaId + '" title="Zoom out"><i class="fas fa-search-minus"></i></button>' +
        '</div>' +
        '<div id="veCodeWrap_' + cfg.areaId + '" style="display:flex;overflow:auto;max-height:280px;">' +
          '<div id="' + lineNumId + '" style="display:none;padding:12px 6px 12px 8px;background:#0e0e0e;border-right:1px solid #2a2a2a;font-family:\'Courier New\',monospace;font-size:12px;line-height:1.55;color:#555;text-align:right;user-select:none;white-space:pre;min-width:38px;flex-shrink:0;"></div>' +
          '<div class="ve-code" id="' + codeId + '" style="flex:1;font-size:12px;white-space:pre-wrap;">' + escHtml(code) + (code.length >= 8000 ? '\n\u2026 (truncated)' : '') + '</div>' +
        '</div>' +
        '<div id="' + previewId + '" style="display:none;"></div>';

      setTimeout(function() {
        var codeEl  = document.getElementById(codeId);
        var lineEl  = document.getElementById(lineNumId);
        var wrapEl  = document.getElementById('veCodeWrap_' + cfg.areaId);
        var prevEl  = document.getElementById(previewId);
        var prevBtn = document.getElementById('veCodePrev_'   + cfg.areaId);
        var splitBtn= document.getElementById('veCodeSplit_'  + cfg.areaId);
        var zInBtn  = document.getElementById('veCodeZoomIn_' + cfg.areaId);
        var zOutBtn = document.getElementById('veCodeZoomOut_'+ cfg.areaId);
        var fontSize = 12, splitOn = false, previewOn = false;

        function getLines() {
          var lines = (codeEl ? codeEl.textContent : '').split('\n').length;
          return Array.from({length: lines}, function(_,i){ return i+1; }).join('\n');
        }

        if (splitBtn) splitBtn.addEventListener('click', function() {
          splitOn = !splitOn;
          splitBtn.classList.toggle('active', splitOn);
          if (lineEl) {
            lineEl.style.display = splitOn ? 'block' : 'none';
            if (splitOn) lineEl.textContent = getLines();
          }
        });

        if (prevBtn) prevBtn.addEventListener('click', function() {
          previewOn = !previewOn;
          prevBtn.classList.toggle('active', previewOn);
          if (previewOn) {
            if (wrapEl) wrapEl.style.display = 'none';
            if (prevEl) {
              prevEl.style.display = 'block';
              if (ext === 'html' || ext === 'htm') {
                var iframe = document.createElement('iframe');
                iframe.sandbox = 'allow-scripts';
                iframe.style.cssText = 'width:100%;height:280px;border:none;background:#fff;border-radius:0 0 4px 4px;';
                iframe.srcdoc = raw;
                prevEl.innerHTML = '';
                prevEl.appendChild(iframe);
              } else {
                prevEl.innerHTML =
                  '<div style="padding:14px 16px;color:var(--white-dim);font-size:0.82rem;">' +
                  '<i class="fas fa-info-circle" style="color:var(--gold);margin-right:6px;"></i>' +
                  'Live preview is available for HTML files only. Current file: <code>.' + escHtml(ext) + '</code></div>';
              }
            }
          } else {
            if (wrapEl) wrapEl.style.display = 'flex';
            if (prevEl) { prevEl.style.display = 'none'; prevEl.innerHTML = ''; }
          }
        });

        if (zInBtn) zInBtn.addEventListener('click', function() {
          fontSize = Math.min(fontSize + 2, 26);
          if (codeEl) codeEl.style.fontSize = fontSize + 'px';
          if (lineEl) lineEl.style.fontSize = fontSize + 'px';
        });
        if (zOutBtn) zOutBtn.addEventListener('click', function() {
          fontSize = Math.max(fontSize - 2, 8);
          if (codeEl) codeEl.style.fontSize = fontSize + 'px';
          if (lineEl) lineEl.style.fontSize = fontSize + 'px';
        });
      }, 50);
    };
    reader2.readAsText(file);
  }
}

// ── COLLABORATOR MANAGEMENT ───────────────────────────────────────────────────
function renderPrimaryRow() {
  var list = document.getElementById('collaboratorList'); if (!list) return;
  if (list.querySelector('.primary-creator-row')) return;
  var meta = (window.currentUser && window.currentUser.user_metadata) || {};
  var fullName    = meta.full_name    || (window.currentUser && window.currentUser.email) || 'You';
  var artisticName = meta.artistic_name || '';
  var row = document.createElement('div');
  row.className = 'collaborator-item primary-creator-row';
  row.innerHTML =
    '<div class="collaborator-avatar"><i class="fas fa-user"></i></div>' +
    '<div class="collaborator-info">' +
      '<div class="collaborator-name">' + escHtml(fullName) + '</div>' +
      '<div class="collaborator-role">Primary Creator' + (artisticName ? ' \u00B7 <em>' + escHtml(artisticName) + '</em>' : '') + '</div>' +
    '</div>' +
    '<div class="split-control"><div class="split-slider-wrap">' +
      '<input type="range" min="0" max="100" value="100" id="primarySplit" disabled style="accent-color:var(--gold);">' +
      '<span class="split-percentage" id="primaryPercent">100%</span>' +
    '</div></div>' +
    '<div class="collab-status distributor">Owner</div>';
  list.prepend(row);
}

function renderCollaborators() {
  var list = document.getElementById('collaboratorList'); if (!list) return;
  list.querySelectorAll('.collab-row').forEach(function(el) { el.remove(); });
  window.collaborators.forEach(function(c) {
    var row = document.createElement('div');
    row.className = 'collaborator-item collab-row'; row.dataset.id = c.id;
    row.innerHTML =
      '<div class="collaborator-avatar"><i class="fas fa-user"></i></div>' +
      '<div class="collaborator-info">' +
        '<div class="collaborator-name">' + escHtml(c.fullName || c.email) + '</div>' +
        '<div class="collaborator-role">' + escHtml(c.ownershipTitle || 'Co-owner') +
          (c.artisticName ? ' \u00B7 <em>' + escHtml(c.artisticName) + '</em>' : '') + '</div>' +
      '</div>' +
      '<div class="split-control"><div class="split-slider-wrap">' +
        '<input type="range" min="0" max="100" value="' + c.split + '" class="collab-split-input" data-id="' + c.id + '" style="accent-color:var(--gold);">' +
        '<span class="split-percentage collab-pct-' + c.id + '">' + c.split + '%</span>' +
      '</div></div>' +
      '<div class="coowner-actions"><button class="action-btn remove-coowner" data-id="' + c.id + '"><i class="fas fa-times"></i></button></div>';
    list.appendChild(row);
  });
  list.querySelectorAll('.collab-split-input').forEach(function(inp) {
    inp.addEventListener('input', function(e) {
      var co = window.collaborators.find(function(x) { return x.id === e.target.dataset.id; });
      if (co) co.split = parseInt(e.target.value, 10);
      var sp = list.querySelector('.collab-pct-' + e.target.dataset.id);
      if (sp) sp.textContent = e.target.value + '%';
      updateSplitSummary();
    });
  });
  list.querySelectorAll('.remove-coowner').forEach(function(btn) {
    btn.addEventListener('click', function() {
      window.collaborators = window.collaborators.filter(function(c) { return c.id !== btn.dataset.id; });
      renderCollaborators(); updateSplitSummary();
    });
  });
  updateSplitSummary();
}

function updateSplitSummary() {
  var total = window.collaborators.reduce(function(s,c){ return s + c.split; }, 0), primary = 100 - total;
  var pInp = document.getElementById('primarySplit'), pPct = document.getElementById('primaryPercent');
  if (pInp) pInp.value = primary; if (pPct) pPct.textContent = primary + '%';
  var warn = document.getElementById('splitWarning');
  if (warn) warn.textContent = primary < 0 ? '\u26A0 Total split exceeds 100%' : '';
  var COLORS = ['#C9993A','#3DB87A','#E8A040','#569cd6','#E05555'];
  var html = '<div class="split-piece"><div class="split-circle" style="background:' + COLORS[0] + ';"></div><div class="split-label">You \u00B7 ' + primary + '%</div></div>';
  window.collaborators.forEach(function(c, i) {
    html += '<div class="split-piece"><div class="split-circle" style="background:' + COLORS[(i+1)%COLORS.length] + ';"></div>' +
      '<div class="split-label">' + escHtml((c.fullName||c.email||'').split('@')[0]) + ' \u00B7 ' + c.split + '%</div></div>';
  });
  var sv = document.getElementById('splitVisual'); if (sv) sv.innerHTML = html;
}

// ── CO-OWNER MODAL ────────────────────────────────────────────────────────────
function openCoownerModal() {
  ['coFullName','coGender','coTitle','coArtisticName','coCountry','coOwnershipTitle','coSplit','coEmail'].forEach(function(id) {
    var el = document.getElementById(id); if (el) el.value = '';
  });
  var modal = document.getElementById('coownerModal'); if (modal) modal.classList.add('active');
}
function closeCoownerModal() {
  var modal = document.getElementById('coownerModal'); if (modal) modal.classList.remove('active');
}
function saveCoowner() {
  var name  = ((document.getElementById('coFullName')  || {}).value || '').trim();
  var email = ((document.getElementById('coEmail')     || {}).value || '').trim();
  var split = parseInt(((document.getElementById('coSplit')  || {}).value || '0'), 10);
  var ownershipTitle = ((document.getElementById('coOwnershipTitle') || {}).value || '').trim() || 'Co-owner';
  var artisticName   = ((document.getElementById('coArtisticName')  || {}).value || '').trim();
  if (!name)  { alert('Full name is required.'); return; }
  if (!email) { alert('Email address is required.'); return; }
  if (!email.includes('@')) { alert('Please enter a valid email.'); return; }
  if (isNaN(split) || split < 1 || split > 99) { alert('Ownership % must be between 1 and 99.'); return; }
  var used = window.collaborators.reduce(function(s,c){ return s + c.split; }, 0);
  if (used + split > 100) { alert('Total split cannot exceed 100%. Available: ' + (100 - used) + '%.'); return; }
  window.collaborators.push({
    id: Date.now().toString(), fullName: name, email: email, split: split,
    ownershipTitle: ownershipTitle, artisticName: artisticName,
    gender: ((document.getElementById('coGender') || {}).value || ''),
    title:  ((document.getElementById('coTitle')  || {}).value || ''),
    country:((document.getElementById('coCountry')|| {}).value || ''),
  });
  renderCollaborators(); closeCoownerModal();
}

// ── SUBMIT ────────────────────────────────────────────────────────────────────
function doSubmit() {
  var title    = (((document.getElementById('workTitle') || {}).value || '').trim()) || 'Untitled Work';
  var workTypeEl = document.getElementById('workType');
  var workType = workTypeEl ? workTypeEl.value : 'other';
  var user = window.currentUser, creatorId = user ? (user.id || user.sub) : null;
  if (!creatorId) {
    alert('Your session has expired. Please sign in again.');
    window.location.href = 'signup_signin.html?redirect=' + encodeURIComponent(window.location.href);
    return;
  }
  var plan = window.selectedPlan || 'free', mode = window.mode || 'solo', collabs = window.collaborators || [];
  var ownershipSplit = {};
  if (mode === 'collab' && collabs.length) {
    collabs.forEach(function(c) { ownershipSplit[c.email] = c.split; });
    ownershipSplit['__primary__'] = 100 - collabs.reduce(function(s,c){ return s + c.split; }, 0);
  }
  function submit(hash) {
    if (plan !== 'free') {
      sessionStorage.setItem('pendingCert', JSON.stringify({
        creator_id: creatorId, email: user.email || '', title: title,
        work_type: workType, content_hash: hash, plan: plan,
        collaborators: mode === 'collab' ? collabs : [], ownership_split: ownershipSplit,
      }));
      window.location.href = 'pay.html?plan=' + encodeURIComponent(plan) + '&title=' + encodeURIComponent(title);
      return;
    }
    var btn = document.getElementById('finalizeBtn') ||
              document.getElementById('step4NextBtn');
    if (btn) { btn.disabled = true; btn.innerHTML = '\u23F3 Submitting\u2026'; }
    CertificationState.status = 'queued'; updateUIBasedOnState();
    fetch(TIER4_URL + '/api/certify', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creator_id: creatorId, email: user.email || '', title: title,
        work_type: workType, content_hash: hash, plan: 'free',
        collaborators: mode === 'collab' ? collabs : [], ownership_split: ownershipSplit,
      }),
    })
    .then(function(res) { return res.json().then(function(d) { return { ok: res.ok, data: d }; }); })
    .then(function(r) {
      if (!r.ok) throw new Error(r.data.error || 'HTTP error');
      var data = r.data;
      sessionStorage.setItem('activeCertification', JSON.stringify({
        submission_id: data.submission_id, cert_id: data.cert_id, status: 'queued', title: title,
      }));
      sessionStorage.setItem('activeCert', JSON.stringify({
        submission_id: data.submission_id, cert_id: data.cert_id, plan: 'free', title: title,
      }));
      // ── FIX #7: free solo plan → redirect to certificate_loader.html ──────
      window.location.href = 'certificate_loader.html?id=' + encodeURIComponent(data.submission_id) +
        '&cert=' + encodeURIComponent(data.cert_id || '');
    })
    .catch(function(err) {
      console.error('Submission error:', err);
      var msg = err.message || 'Network error';
      if (msg.toLowerCase().indexOf('failed to fetch') !== -1)
        msg = 'Could not reach the certification server. Please check your connection and try again.';
      CertificationState.status = 'failed'; CertificationState.error = msg;
      updateUIBasedOnState();
      var btn2 = document.getElementById('finalizeBtn') ||
                 document.getElementById('step4NextBtn');
      if (btn2) {
        btn2.disabled = false;
        if (window.mode === 'collab') {
          btn2.innerHTML = '<i class="fas fa-paper-plane"></i> Submit';
        } else {
          btn2.innerHTML = '<i class="fas fa-arrow-right"></i> Continue';
        }
      }
    });
  }
  if (window.uploadedFile) {
    window.uploadedFile.arrayBuffer()
      .then(function(buf) { return crypto.subtle.digest('SHA-256', buf); })
      .then(function(hb) {
        var hash = Array.from(new Uint8Array(hb)).map(function(b){ return b.toString(16).padStart(2,'0'); }).join('');
        submit(hash);
      }).catch(function() { submit(''); });
  } else { submit(''); }
}
window.doSubmit = doSubmit;

function copyLink() {
  var link = document.getElementById('shareLink');
  if (link) { link.select(); document.execCommand('copy'); alert('Invite link copied!'); }
}
window.copyLink = copyLink;

function escHtml(s) {
  if (!s) return ''; var d = document.createElement('div'); d.textContent = String(s); return d.innerHTML;
}
window.escHtml = escHtml;

// ── BOOTSTRAP ────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async function() {
  var user = await waitForAuth(6000);
  if (!user) {
    window.location.href = '/signup_signin.html?redirect=' + encodeURIComponent(window.location.href);
    return;
  }

  // ── FIX #5: Show Full Name + Artistic Name from user profile ─────────────
  var ownerNameEl = document.getElementById('soloOwnerName');
  if (ownerNameEl) {
    var meta = user.user_metadata || {};
    var fullName    = meta.full_name    || user.email || 'You';
    var artisticName = meta.artistic_name || '';
    ownerNameEl.innerHTML =
      '<span style="font-weight:600;">' + escHtml(fullName) + '</span>' +
      (artisticName ? '<br><span style="font-size:var(--fs-xs);color:var(--white-dim);font-style:italic;">' + escHtml(artisticName) + '</span>' : '');
  }

  // Plan selection (also bound via onclick in HTML, addEventListener ensures JS state stays synced)
  document.querySelectorAll('.plan-card').forEach(function(card) {
    card.addEventListener('click', function() { selectPlan(card); });
  });

  // Step 1 → 2
  var b = document.getElementById('nextToDetailsBtn');
  if (b) b.addEventListener('click', function() { showStep(2); });

  // Step 2 → 3
  var b2 = document.getElementById('nextToOwnershipBtn');
  if (b2) b2.addEventListener('click', function() {
    if (!(document.getElementById('workTitle') || {}).value.trim()) { alert('Please enter a work title.'); return; }
    showStep(3);
  });

  // Mode selection (step 3)
  var soloBtn = document.getElementById('soloModeBtn'), collabBtn = document.getElementById('collabModeBtn');
  if (soloBtn) soloBtn.addEventListener('click', function() {
    window.mode = 'solo'; soloBtn.classList.add('active'); if (collabBtn) collabBtn.classList.remove('active');
    var s5 = document.getElementById('step5c'); if (s5) s5.style.display = 'none';
    var sfn = document.getElementById('stepFinalNum'); if (sfn) sfn.textContent = '5';
  });
  if (collabBtn) collabBtn.addEventListener('click', function() {
    window.mode = 'collab'; collabBtn.classList.add('active'); if (soloBtn) soloBtn.classList.remove('active');
    var s5 = document.getElementById('step5c'); if (s5) s5.style.display = '';
    var sfn = document.getElementById('stepFinalNum'); if (sfn) sfn.textContent = '6';
  });

  // Step 3 → 4
  var b3 = document.getElementById('nextToUploadBtn');
  if (b3) b3.addEventListener('click', function() {
    if (!window.mode) { alert('Please select an ownership type.'); return; }
    showStep(4);
    var sc = document.getElementById('soloContent'), cc = document.getElementById('collabContent');
    if (sc) sc.classList.toggle('hidden', window.mode !== 'solo');
    if (cc) cc.classList.toggle('hidden', window.mode !== 'collab');
  });

  // Step 4 → next
  var b4 = document.getElementById('step4NextBtn');
  if (b4) b4.addEventListener('click', function() {
    if (window.mode === 'collab') { renderPrimaryRow(); renderCollaborators(); showStep('5c'); }
    else { doSubmit(); }
  });

  // Step 5 finalize
  var fb = document.getElementById('finalizeBtn');
  if (fb) fb.addEventListener('click', doSubmit);

  // Co-owner modal
  var addBtn = document.getElementById('addCollaboratorBtn'); if (addBtn) addBtn.addEventListener('click', openCoownerModal);
  var saveBtn = document.getElementById('coownerSaveBtn');   if (saveBtn) saveBtn.addEventListener('click', saveCoowner);
  var cancelBtn = document.getElementById('coownerCancelBtn'); if (cancelBtn) cancelBtn.addEventListener('click', closeCoownerModal);
  var coModal = document.getElementById('coownerModal');
  if (coModal) coModal.addEventListener('click', function(e) { if (e.target === coModal) closeCoownerModal(); });

  // Invite / remove all
  var iaBtn = document.getElementById('inviteAllBtn');
  if (iaBtn) iaBtn.addEventListener('click', function() {
    if (!window.collaborators.length) { alert('No co-owners to invite.'); return; }
    alert('Invitations sent to: ' + window.collaborators.map(function(c){ return c.email; }).join(', '));
  });
  var raBtn = document.getElementById('removeAllBtn');
  if (raBtn) raBtn.addEventListener('click', function() {
    if (!window.collaborators.length) return;
    if (confirm('Remove all co-owners?')) { window.collaborators = []; renderCollaborators(); }
  });

  // Download cert
  var dlBtn = document.getElementById('downloadCertBtn');
  if (dlBtn) dlBtn.addEventListener('click', function() {
    var s = CertificationState.submissionId, c = CertificationState.certId;
    if (s && c) window.location.href = 'certificate_loader.html?id=' + encodeURIComponent(s) + '&cert=' + encodeURIComponent(c);
    else alert('Certificate not yet available \u2014 please wait for processing to complete.');
  });

  // File upload areas
  setupUploadArea({ areaId:'soloUploadArea', inputId:'soloFileInput', resetId:'soloResetBtn',
    textId:'soloUploadText', infoId:'soloFileInfo', iconId:'soloFileIcon', nameId:'soloFileName',
    sizeId:'soloFileSz', progressId:'soloProgress', barId:'soloProgressBar', progTextId:'soloProgressText',
    embedId:'soloViewerEmbed', labelId:'soloViewerLabel', statsId:'soloFileStats' });
  setupUploadArea({ areaId:'primaryUploadArea', inputId:'primaryFileInput', resetId:'primaryResetBtn',
    textId:'primaryUploadText', infoId:'primaryFileInfo', iconId:'primaryFileIcon', nameId:'primaryFileName',
    sizeId:'primaryFileSz', progressId:'primaryProgress', barId:'primaryProgressBar', progTextId:'primaryProgressText',
    embedId:'primaryViewerEmbed', labelId:'primaryViewerLabel', statsId:'primaryFileStats' });

  // Page-refresh / URL recovery
  var activeCert = sessionStorage.getItem('activeCertification');
  if (activeCert) {
    try {
      var cert = JSON.parse(activeCert);
      if (cert.submission_id && cert.status !== 'completed') {
        var hydrated = await hydrateFromSubmissionId(cert.submission_id);
        if (hydrated) return;
      }
    } catch(e) {}
  }
  var params = new URLSearchParams(window.location.search);
  var sid = params.get('id') || params.get('submission_id');
  if (sid) { await hydrateFromSubmissionId(sid); return; }

  showStep(1);
});
