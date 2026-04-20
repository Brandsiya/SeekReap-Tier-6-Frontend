/* certification_portal.js - complete portal logic
   Handles: plan selection, step navigation, mode, file upload,
   collaborators, API submission, polling, certificate rendering.
   Auth is handled by auth-guard.js (loaded before this file). */

'use strict';

const TIER4_URL = 'https://seekreap-tier-4-dev.fly.dev';

// ── GLOBAL STATE ──────────────────────────────────────────────────────────────
window.selectedPlan  = 'free';
window.mode          = null;
window.collaborators = [];
window.uploadedFile  = null;

const CertificationState = {
  submissionId: null,
  certId:       null,
  status:       'idle',
  error:        null,
  data:         null,
};

// Step definitions: which card ID maps to which step number
const STEP_CARDS = {
  1: 'step1Card',
  2: 'step2Card',
  3: 'step3Card',
  4: 'step4Card',
  '5c': 'step5collabCard',
  'final': 'stepFinalCard',
};

// ── PLAN SELECTION ────────────────────────────────────────────────────────────
function selectPlan(card) {
  document.querySelectorAll('.plan-card').forEach(c => c.classList.remove('selected'));
  card.classList.add('selected');
  window.selectedPlan = card.dataset.plan || 'free';
  console.log('[portal] plan selected:', window.selectedPlan);
}
window.selectPlan = selectPlan;

// ── STEP NAVIGATION ───────────────────────────────────────────────────────────
function showStep(step) {
  // Hide all cards
  Object.values(STEP_CARDS).forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  });

  // Show target card
  const cardId = STEP_CARDS[step];
  if (cardId) {
    const el = document.getElementById(cardId);
    if (el) el.classList.remove('hidden');
  }

  // Update step indicator bar
  const stepNums = [1, 2, 3, 4];
  stepNums.forEach(n => {
    const el = document.getElementById('step' + n);
    if (!el) return;
    el.classList.remove('active', 'completed');
    const num = typeof step === 'number' ? step : 99;
    if (n < num) el.classList.add('completed');
    else if (n === num) el.classList.add('active');
  });
  // collab step 5
  const s5 = document.getElementById('step5c');
  if (s5) {
    s5.classList.remove('active', 'completed');
    if (step === '5c') s5.classList.add('active');
    else if (step === 'final' && window.mode === 'collab') s5.classList.add('completed');
  }
  // final step
  const sf = document.getElementById('stepFinal');
  if (sf) {
    sf.classList.remove('active', 'completed');
    if (step === 'final') sf.classList.add('active');
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
  console.log('[portal] showStep:', step);
}
window.showStep = showStep;

// ── WAIT FOR AUTH ─────────────────────────────────────────────────────────────
function waitForAuth(timeoutMs) {
  timeoutMs = timeoutMs || 6000;
  if (window.currentUser !== undefined && window.currentUser !== null) {
    return Promise.resolve(window.currentUser);
  }
  return new Promise(function(resolve) {
    var timer = setTimeout(function() {
      resolve(window.currentUser || null);
    }, timeoutMs);
    document.addEventListener('authReady', function(e) {
      clearTimeout(timer);
      resolve((e.detail && e.detail.user) || null);
    }, { once: true });
  });
}

// ── STATUS UI ─────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  queued:     { color:'#E8A040', bg:'rgba(232,160,64,0.1)',  icon:'⏳', text:'Certification queued - processing will begin shortly…' },
  processing: { color:'#569cd6', bg:'rgba(86,156,214,0.1)', icon:'🔄', text:'Analysing your work - this may take a few moments…' },
  analyzed:   { color:'#3DB87A', bg:'rgba(61,184,122,0.08)',icon:'🔬', text:'Analysis complete - finalising certificate…' },
  completed:  { color:'#3DB87A', bg:'rgba(61,184,122,0.1)', icon:'✅', text:'Certification complete!' },
  failed:     { color:'#E05555', bg:'rgba(224,85,85,0.1)',   icon:'❌', text:'Certification failed.' },
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
  var el  = getOrCreateStatusEl();
  var btn = document.getElementById('finalizeBtn');
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
// OLD function pollCertificationStatus(submissionId, maxAttempts, intervalMs) {
  maxAttempts = maxAttempts || 60;
  intervalMs  = intervalMs  || 3000;
  var attempts = 0;
  function poll() {
    attempts++;
    fetch(TIER4_URL + '/api/certify/' + encodeURIComponent(submissionId))
      .then(function(res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function(data) {
        CertificationState.submissionId = submissionId;
        CertificationState.certId   = data.cert_id   || CertificationState.certId;
        CertificationState.status   = data.status    || CertificationState.status;
        CertificationState.data     = data;
        updateUIBasedOnState();

        if (data.status === 'completed' || data.status === 'analyzed') {
          CertificationState.status = 'completed';
          updateUIBasedOnState();
          renderCompletedState(data);
          sessionStorage.setItem('activeCert', JSON.stringify({
            submission_id: submissionId,
            cert_id: data.cert_id || CertificationState.certId,
            plan: data.plan || 'free',
            title: data.title || '',
            status: 'completed',
          }));
          sessionStorage.removeItem('activeCertification');
          return;
        }
        if (data.status === 'failed') {
          CertificationState.status = 'failed';
          CertificationState.error  = data.failure_reason || 'Processing failed';
          updateUIBasedOnState();
          renderErrorState(data);
          return;
        }
        if (attempts < maxAttempts) setTimeout(poll, intervalMs);
        else { CertificationState.status = 'failed'; CertificationState.error = 'Timed out - check your dashboard.'; updateUIBasedOnState(); }
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
  var certId    = data.cert_id            || CertificationState.certId || '-';
  var title     = data.title              || (document.getElementById('workTitle') || {}).value || 'Your Work';
  var riskScore = data.overall_risk_score != null ? data.overall_risk_score : '-';
  var riskLevel = data.risk_level         || '-';
  var plan      = data.plan               || window.selectedPlan || 'free';
  var now       = new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'});

  var certIdLine = document.getElementById('certIdLine');
  if (certIdLine) certIdLine.textContent = certId + ' · ' + now;

  var certDetails = document.getElementById('certificateDetails');
  if (certDetails) {
    var collabs = window.collaborators || [];
    var primaryPct = window.mode === 'collab'
      ? (100 - collabs.reduce(function(s,c){ return s + c.split; }, 0)) + '%'
      : '100%';
    var ownerRows = '<div class="cert-ownership-row"><span>You (Primary Creator)</span><span>' + primaryPct + '</span></div>';
    if (window.mode === 'collab') collabs.forEach(function(c) {
      ownerRows += '<div class="cert-ownership-row"><span>' + escHtml(c.fullName || c.email) + '</span><span>' + c.split + '%</span></div>';
    });

    var workTypeEl   = document.getElementById('workType');
    var workTypeText = workTypeEl ? workTypeEl.options[workTypeEl.selectedIndex].text.trim() : '-';
    var riskColor    = riskLevel === 'low' ? 'var(--success)' : riskLevel === 'medium' ? 'var(--warning)' : 'var(--danger)';

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
        '<div class="cert-ownership-block"><strong><i class="fas fa-shield-alt" style="margin-right:5px;"></i> Ownership</strong>' + ownerRows + '</div>' +
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
  var el  = getOrCreateStatusEl();
  el.style.cssText = 'margin-top:14px;padding:11px 16px;border-radius:4px;font-size:0.85rem;background:rgba(224,85,85,0.1);border:1px solid rgba(224,85,85,0.3);color:#E05555;display:block;';
  el.innerHTML = '❌ ' + escHtml(msg) + ' - <a href="certification_portal.html" style="color:#E05555;text-decoration:underline;">Try again</a>';
}

// ── HYDRATION ─────────────────────────────────────────────────────────────────
function hydrateFromSubmissionId(submissionId) {
  if (!submissionId) return Promise.resolve(false);
  return fetch(TIER4_URL + '/api/certify/' + encodeURIComponent(submissionId))
    .then(function(res) {
      if (!res.ok) return false;
      return res.json().then(function(data) {
        CertificationState.submissionId = submissionId;
        CertificationState.certId   = data.cert_id;
        CertificationState.status   = data.status;
        CertificationState.data     = data;
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
var TYPE_ICONS = { audio:'🎵', video:'🎬', image:'🖼️', epub:'📖', pdf:'📄', code:'💻', other:'📄' };
var TYPE_ACCEPT = {
  audio: 'audio/*',
  video: 'video/*',
  image: 'image/*',
  epub:  '.epub',
  pdf:   '.pdf',
  code:  '.js,.ts,.py,.html,.css,.json,.java,.c,.cpp,.rb,.php,.go,.rs,.txt,.md',
  other: '*/*',
};

function fmtBytes(b) {
  if (b < 1024) return b + ' B';
  if (b < 1048576) return (b/1024).toFixed(1) + ' KB';
  return (b/1048576).toFixed(1) + ' MB';
}

function setupUploadArea(cfg) {
  var area      = document.getElementById(cfg.areaId);
  var input     = document.getElementById(cfg.inputId);
  var resetBtn  = document.getElementById(cfg.resetId);
  var textEl    = document.getElementById(cfg.textId);
  var fileInfo  = document.getElementById(cfg.infoId);
  var iconEl    = document.getElementById(cfg.iconId);
  var nameEl    = document.getElementById(cfg.nameId);
  var sizeEl    = document.getElementById(cfg.sizeId);
  var progressW = document.getElementById(cfg.progressId);
  var progressB = document.getElementById(cfg.barId);
  var progressT = document.getElementById(cfg.progTextId);

  if (!area || !input) return;

  function getWorkType() {
    return (document.getElementById('workType') || {}).value || 'other';
  }

  function refreshAccept() {
    input.accept = TYPE_ACCEPT[getWorkType()] || '*/*';
  }
  refreshAccept();
  document.getElementById('workType').addEventListener('change', refreshAccept);

  area.addEventListener('click', function(e) {
    if (e.target === resetBtn || (resetBtn && resetBtn.contains(e.target))) return;
    refreshAccept();
    input.click();
  });
  area.addEventListener('dragover', function(e) { e.preventDefault(); area.classList.add('dragover'); });
  area.addEventListener('dragleave', function() { area.classList.remove('dragover'); });
  area.addEventListener('drop', function(e) {
    e.preventDefault(); area.classList.remove('dragover');
    var f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  });
  input.addEventListener('change', function(e) {
    var f = e.target.files[0];
    if (f) handleFile(f);
  });
  if (resetBtn) resetBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    resetUpload();
  });

  function handleFile(file) {
    window.uploadedFile = file;
    var wt = getWorkType();
    var icon = TYPE_ICONS[wt] || '📄';

    // Show progress
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
          // Mark area uploaded
          area.classList.add('uploaded');
          if (textEl) textEl.textContent = file.name;
          // File info row
          if (iconEl) iconEl.textContent = icon;
          if (nameEl) nameEl.textContent = file.name;
          if (sizeEl) sizeEl.textContent = fmtBytes(file.size);
          if (fileInfo) fileInfo.classList.add('visible');
          // Render preview
          renderPreview(cfg, file, wt);
        }, 150);
      }
    }, 80);
  }

  function resetUpload() {
    window.uploadedFile = null;
    input.value = '';
    area.classList.remove('uploaded', 'dragover');
    if (textEl) textEl.textContent = 'Click to upload or drag & drop';
    if (fileInfo) fileInfo.classList.remove('visible');
    if (progressW) progressW.style.display = 'none';
    // Clear viewer
    var embed = document.getElementById(cfg.embedId);
    if (embed) { embed.classList.remove('visible'); embed.innerHTML = ''; }
    var label = document.getElementById(cfg.labelId);
    if (label) label.classList.remove('visible');
    var stats = document.getElementById(cfg.statsId);
    if (stats) stats.style.display = 'none';
  }
}

function renderPreview(cfg, file, wt) {
  var embed = document.getElementById(cfg.embedId);
  var label = document.getElementById(cfg.labelId);
  if (!embed) return;

  embed.innerHTML = '';
  embed.classList.add('visible');

  var url = URL.createObjectURL(file);

  if (wt === 'audio') {
    if (label) { label.textContent = 'Audio Player'; label.classList.add('visible'); }
    embed.innerHTML =
      '<div class="ve-audio">' +
        '<div class="ve-now-playing">' +
          '<div class="ve-album"><i class="fas fa-music"></i></div>' +
          '<div><div class="ve-track-title">' + escHtml(file.name.replace(/\.[^.]+$/, '')) + '</div></div>' +
        '</div>' +
        '<div class="ve-progress-row">' +
          '<div class="ve-time-row"><span id="veAT_' + cfg.areaId + '">0:00</span><span id="veDur_' + cfg.areaId + '">-</span></div>' +
          '<div class="ve-progress-track" id="veTrack_' + cfg.areaId + '"><div class="ve-progress-fill" id="veFill_' + cfg.areaId + '"></div></div>' +
        '</div>' +
        '<div class="ve-btn-row">' +
          '<button class="ve-ctrl play" id="vePlay_' + cfg.areaId + '"><i class="fas fa-play"></i></button>' +
        '</div>' +
        '<div class="ve-vol-row"><i class="fas fa-volume-down"></i><input type="range" class="ve-vol" min="0" max="1" step="0.02" value="0.8" id="veVol_' + cfg.areaId + '"><i class="fas fa-volume-up"></i></div>' +
        '<audio id="veAudio_' + cfg.areaId + '" src="' + url + '" style="display:none;"></audio>' +
      '</div>';

    // Wire audio player
    setTimeout(function() {
      var audio   = document.getElementById('veAudio_' + cfg.areaId);
      var playBtn = document.getElementById('vePlay_' + cfg.areaId);
      var fill    = document.getElementById('veFill_' + cfg.areaId);
      var track   = document.getElementById('veTrack_' + cfg.areaId);
      var curEl   = document.getElementById('veAT_' + cfg.areaId);
      var durEl   = document.getElementById('veDur_' + cfg.areaId);
      var volEl   = document.getElementById('veVol_' + cfg.areaId);
      if (!audio) return;

      function fmt(s) {
        s = Math.floor(s || 0);
        return Math.floor(s/60) + ':' + String(s%60).padStart(2,'0');
      }
      audio.addEventListener('loadedmetadata', function() { if (durEl) durEl.textContent = fmt(audio.duration); });
      audio.addEventListener('timeupdate', function() {
        if (curEl) curEl.textContent = fmt(audio.currentTime);
        if (fill && audio.duration) fill.style.width = (audio.currentTime / audio.duration * 100) + '%';
      });
      audio.addEventListener('ended', function() {
        if (playBtn) playBtn.innerHTML = '<i class="fas fa-play"></i>';
      });
      if (playBtn) playBtn.addEventListener('click', function() {
        if (audio.paused) { audio.play(); playBtn.innerHTML = '<i class="fas fa-pause"></i>'; }
        else { audio.pause(); playBtn.innerHTML = '<i class="fas fa-play"></i>'; }
      });
      if (track) track.addEventListener('click', function(e) {
        var r = track.getBoundingClientRect();
        audio.currentTime = ((e.clientX - r.left) / r.width) * audio.duration;
      });
      if (volEl) volEl.addEventListener('input', function() { audio.volume = parseFloat(volEl.value); });
    }, 50);

  } else if (wt === 'video') {
    if (label) { label.textContent = 'Video Preview'; label.classList.add('visible'); }
    embed.innerHTML =
      '<div class="ve-video">' +
        '<video controls src="' + url + '" style="max-height:260px;"></video>' +
      '</div>';

  } else if (wt === 'image') {
    if (label) { label.textContent = 'Image Preview'; label.classList.add('visible'); }
    var imgId = 'veImg_' + cfg.areaId;
    embed.innerHTML =
      '<div class="ve-toolbar">' +
        '<button class="ve-btn" onclick="var i=document.getElementById(\'' + imgId + '\');var s=parseFloat(i.style.transform.replace(/[^0-9.]/g,\'\')||\'1\');i.style.transform=\'scale(\'+(Math.min(s+0.2,3))+\')\';"><i class="fas fa-search-plus"></i> Zoom In</button>' +
        '<button class="ve-btn" onclick="var i=document.getElementById(\'' + imgId + '\');var s=parseFloat(i.style.transform.replace(/[^0-9.]/g,\'\')||\'1\');i.style.transform=\'scale(\'+(Math.max(s-0.2,0.5))+\')\';"><i class="fas fa-search-minus"></i> Zoom Out</button>' +
        '<button class="ve-btn" onclick="document.getElementById(\'' + imgId + '\').style.transform=\'scale(1)\'"><i class="fas fa-expand-arrows-alt"></i> Reset</button>' +
      '</div>' +
      '<div class="ve-image" style="overflow:hidden;max-height:300px;">' +
        '<img id="' + imgId + '" src="' + url + '" alt="Preview" style="max-width:100%;max-height:280px;object-fit:contain;transform-origin:center;transition:transform 0.2s;">' +
      '</div>';

  } else if (wt === 'pdf') {
    if (label) { label.textContent = 'PDF Preview'; label.classList.add('visible'); }
    if (typeof pdfjsLib === 'undefined') {
      embed.innerHTML = '<div style="padding:20px;color:var(--white-dim);font-size:0.85rem;"><i class="fas fa-file-pdf" style="color:var(--gold);margin-right:8px;"></i>PDF uploaded. Preview unavailable (PDF.js not loaded).</div>';
      return;
    }
    var canvasId = 'vePdfCanvas_' + cfg.areaId;
    var infoId2  = 'vePdfInfo_' + cfg.areaId;
    embed.innerHTML =
      '<div class="ve-toolbar">' +
        '<button class="ve-btn" id="vePdfPrev_' + cfg.areaId + '" disabled><i class="fas fa-chevron-left"></i> Prev</button>' +
        '<span class="ve-info" id="' + infoId2 + '">Loading…</span>' +
        '<button class="ve-btn" id="vePdfNext_' + cfg.areaId + '"><i class="fas fa-chevron-right"></i> Next</button>' +
      '</div>' +
      '<div class="ve-pdf"><canvas id="' + canvasId + '"></canvas></div>';

    var reader = new FileReader();
    reader.onload = function(e) {
      pdfjsLib.getDocument({ data: e.target.result }).promise.then(function(doc) {
        var pageNum = 1;
        function renderPage(n) {
          doc.getPage(n).then(function(page) {
            var vp = page.getViewport({ scale: Math.min(1.2, 580 / page.getViewport({scale:1}).width) });
            var canvas = document.getElementById(canvasId);
            if (!canvas) return;
            canvas.height = vp.height; canvas.width = vp.width;
            page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise.then(function() {
              var info = document.getElementById(infoId2);
              if (info) info.textContent = 'Page ' + n + ' / ' + doc.numPages;
              var prev = document.getElementById('vePdfPrev_' + cfg.areaId);
              var next = document.getElementById('vePdfNext_' + cfg.areaId);
              if (prev) prev.disabled = n <= 1;
              if (next) next.disabled = n >= doc.numPages;
            });
          });
        }
        renderPage(pageNum);
        var prev = document.getElementById('vePdfPrev_' + cfg.areaId);
        var next = document.getElementById('vePdfNext_' + cfg.areaId);
        if (prev) prev.addEventListener('click', function() { if (pageNum > 1) renderPage(--pageNum); });
        if (next) next.addEventListener('click', function() { if (pageNum < doc.numPages) renderPage(++pageNum); });
      }).catch(function() {
        embed.innerHTML = '<div style="padding:14px;color:var(--danger);">Could not render PDF.</div>';
      });
    };
    reader.readAsArrayBuffer(file);

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
    var book = ePub(url);
    var rendition = book.renderTo(epubTargetId, { width: '100%', height: 220 });
    rendition.display();
    var ep = document.getElementById('veEpubPrev_' + cfg.areaId);
    var en = document.getElementById('veEpubNext_' + cfg.areaId);
    if (ep) ep.addEventListener('click', function() { rendition.prev(); });
    if (en) en.addEventListener('click', function() { rendition.next(); });

  } else if (wt === 'code') {
    if (label) { label.textContent = 'Code Preview'; label.classList.add('visible'); }
    var reader2 = new FileReader();
    reader2.onload = function(e) {
      var code = e.target.result.slice(0, 5000);
      embed.innerHTML =
        '<div class="ve-toolbar"><span class="ve-info"><i class="fas fa-code"></i> ' + escHtml(file.name) + '</span></div>' +
        '<div class="ve-code">' + escHtml(code) + (code.length >= 5000 ? '\n… (truncated)' : '') + '</div>';
    };
    reader2.readAsText(file);
  }
}

// ── COLLABORATOR MANAGEMENT ───────────────────────────────────────────────────
function renderPrimaryRow() {
  var list = document.getElementById('collaboratorList');
  if (!list) return;
  var name = (window.currentUser && window.currentUser.user_metadata && window.currentUser.user_metadata.artistic_name)
    || (window.currentUser && window.currentUser.email) || 'You';
  var existing = list.querySelector('.primary-creator-row');
  if (existing) return;
  var row = document.createElement('div');
  row.className = 'collaborator-item primary-creator-row';
  row.innerHTML =
    '<div class="collaborator-avatar"><i class="fas fa-user"></i></div>' +
    '<div class="collaborator-info"><div class="collaborator-name">' + escHtml(name) + '</div>' +
      '<div class="collaborator-role">Primary Creator</div></div>' +
    '<div class="split-control"><div class="split-slider-wrap">' +
      '<input type="range" min="0" max="100" value="100" id="primarySplit" disabled' +
        ' style="accent-color:var(--gold);">' +
      '<span class="split-percentage" id="primaryPercent">100%</span>' +
    '</div></div>' +
    '<div class="collab-status distributor">Owner</div>';
  list.prepend(row);
}

function renderCollaborators() {
  var list = document.getElementById('collaboratorList');
  if (!list) return;
  // Remove non-primary rows
  list.querySelectorAll('.collab-row').forEach(function(el) { el.remove(); });

  window.collaborators.forEach(function(c, idx) {
    var row = document.createElement('div');
    row.className = 'collaborator-item collab-row';
    row.dataset.id = c.id;
    row.innerHTML =
      '<div class="collaborator-avatar"><i class="fas fa-user"></i></div>' +
      '<div class="collaborator-info"><div class="collaborator-name">' + escHtml(c.fullName || c.email) + '</div>' +
        '<div class="collaborator-role">' + escHtml(c.ownershipTitle || 'Co-owner') + '</div></div>' +
      '<div class="split-control"><div class="split-slider-wrap">' +
        '<input type="range" min="0" max="100" value="' + c.split + '" class="collab-split-input" data-id="' + c.id + '"' +
          ' style="accent-color:var(--gold);">' +
        '<span class="split-percentage collab-pct-' + c.id + '">' + c.split + '%</span>' +
      '</div></div>' +
      '<div class="coowner-actions">' +
        '<button class="action-btn remove-coowner" data-id="' + c.id + '"><i class="fas fa-times"></i></button>' +
      '</div>';
    list.appendChild(row);
  });

  list.querySelectorAll('.collab-split-input').forEach(function(inp) {
    inp.addEventListener('input', function(e) {
      var id  = e.target.dataset.id;
      var co  = window.collaborators.find(function(x) { return x.id === id; });
      if (co) { co.split = parseInt(e.target.value, 10); }
      var sp = list.querySelector('.collab-pct-' + id);
      if (sp) sp.textContent = e.target.value + '%';
      updateSplitSummary();
    });
  });
  list.querySelectorAll('.remove-coowner').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var id = btn.dataset.id;
      window.collaborators = window.collaborators.filter(function(c) { return c.id !== id; });
      renderCollaborators();
      updateSplitSummary();
    });
  });

  updateSplitSummary();
}

function updateSplitSummary() {
  var total = window.collaborators.reduce(function(s, c) { return s + c.split; }, 0);
  var primary = 100 - total;
  var pInp = document.getElementById('primarySplit');
  var pPct = document.getElementById('primaryPercent');
  if (pInp) pInp.value = primary;
  if (pPct) pPct.textContent = primary + '%';

  var warn = document.getElementById('splitWarning');
  if (warn) warn.textContent = primary < 0 ? '⚠ Total split exceeds 100%' : '';

  var COLORS = ['#C9993A','#3DB87A','#E8A040','#569cd6','#E05555'];
  var html = '<div class="split-piece"><div class="split-circle" style="background:' + COLORS[0] + ';"></div>' +
    '<div class="split-label">You · ' + primary + '%</div></div>';
  window.collaborators.forEach(function(c, i) {
    html += '<div class="split-piece"><div class="split-circle" style="background:' + COLORS[(i+1)%COLORS.length] + ';"></div>' +
      '<div class="split-label">' + escHtml((c.fullName||c.email||'').split('@')[0]) + ' · ' + c.split + '%</div></div>';
  });
  var sv = document.getElementById('splitVisual');
  if (sv) sv.innerHTML = html;
}

// ── CO-OWNER MODAL ────────────────────────────────────────────────────────────
function openCoownerModal() {
  ['coFullName','coGender','coTitle','coArtisticName','coCountry','coOwnershipTitle','coSplit','coEmail'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.value = '';
  });
  var modal = document.getElementById('coownerModal');
  if (modal) modal.classList.add('active');
}

function closeCoownerModal() {
  var modal = document.getElementById('coownerModal');
  if (modal) modal.classList.remove('active');
}

function saveCoowner() {
  var name  = (document.getElementById('coFullName')  || {}).value || '';
  var email = (document.getElementById('coEmail')     || {}).value || '';
  var split = parseInt((document.getElementById('coSplit')  || {}).value || '0', 10);
  var ownershipTitle = (document.getElementById('coOwnershipTitle') || {}).value || 'Co-owner';

  if (!name.trim())  { alert('Full name is required.'); return; }
  if (!email.trim()) { alert('Email address is required.'); return; }
  if (!email.includes('@')) { alert('Please enter a valid email.'); return; }
  if (isNaN(split) || split < 1 || split > 99) { alert('Ownership % must be between 1 and 99.'); return; }

  var used = window.collaborators.reduce(function(s, c) { return s + c.split; }, 0);
  if (used + split > 100) { alert('Total split cannot exceed 100%. Available: ' + (100 - used) + '%.'); return; }

  window.collaborators.push({
    id:             Date.now().toString(),
    fullName:       name.trim(),
    email:          email.trim(),
    split:          split,
    ownershipTitle: ownershipTitle.trim(),
    gender:         (document.getElementById('coGender')  || {}).value || '',
    title:          (document.getElementById('coTitle')   || {}).value || '',
    artisticName:   (document.getElementById('coArtisticName') || {}).value || '',
    country:        (document.getElementById('coCountry') || {}).value || '',
  });

  renderCollaborators();
  closeCoownerModal();
}

// ── SUBMIT ────────────────────────────────────────────────────────────────────
function doSubmit() {
  var title      = ((document.getElementById('workTitle') || {}).value || '').trim() || 'Untitled Work';
  var workTypeEl = document.getElementById('workType');
  var workType   = workTypeEl ? workTypeEl.value : 'other';

  var contentHash = '';
  var file = window.uploadedFile;
  var user = window.currentUser;
  var creatorId = user ? (user.id || user.sub) : null;

  if (!creatorId) {
    alert('Your session has expired. Please sign in again.');
    window.location.href = 'signup_signin.html?redirect=' + encodeURIComponent(window.location.href);
    return;
  }

  var plan    = window.selectedPlan || 'free';
  var mode    = window.mode || 'solo';
  var collabs = window.collaborators || [];

  var ownershipSplit = {};
  if (mode === 'collab' && collabs.length) {
    collabs.forEach(function(c) { ownershipSplit[c.email] = c.split; });
    ownershipSplit['__primary__'] = 100 - collabs.reduce(function(s,c){ return s+c.split; }, 0);
  }

  function submit(hash) {
    if (plan !== 'free') {
      sessionStorage.setItem('pendingCert', JSON.stringify({
        creator_id: creatorId, email: user.email || '',
        title: title, work_type: workType, content_hash: hash, plan: plan,
        collaborators: mode === 'collab' ? collabs : [],
        ownership_split: ownershipSplit,
      }));
      window.location.href = 'pay.html?plan=' + encodeURIComponent(plan) + '&title=' + encodeURIComponent(title);
      return;
    }

    var btn = document.getElementById('finalizeBtn');
    if (btn) { btn.disabled = true; btn.innerHTML = '⏳ Submitting…'; }
    CertificationState.status = 'queued';
    updateUIBasedOnState();

    fetch(TIER4_URL + '/api/certify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creator_id: creatorId, email: user.email || '',
        title: title, work_type: workType, content_hash: hash, plan: 'free',
        collaborators: mode === 'collab' ? collabs : [],
        ownership_split: ownershipSplit,
      }),
    })
    .then(function(res) { return res.json().then(function(d) { return { ok: res.ok, data: d }; }); })
    .then(function(r) {
      if (!r.ok) throw new Error(r.data.error || 'HTTP error');
      var data = r.data;
      CertificationState.submissionId = data.submission_id;
      CertificationState.certId   = data.cert_id;
      CertificationState.status   = data.status || 'queued';
      CertificationState.data     = data;
      updateUIBasedOnState();
      sessionStorage.setItem('activeCertification', JSON.stringify({
        submission_id: data.submission_id, cert_id: data.cert_id, status: 'queued', title: title,
      }));
      sessionStorage.setItem('activeCert', JSON.stringify({
        submission_id: data.submission_id, cert_id: data.cert_id, plan: 'free', title: title,
      }));
      pollCertificationStatus(data.submission_id);
    })
    .catch(function(err) {
      console.error('Submission error:', err);
      CertificationState.status = 'failed';
      CertificationState.error  = err.message;
      updateUIBasedOnState();
      var btn2 = document.getElementById('finalizeBtn');
      if (btn2) { btn2.disabled = false; btn2.innerHTML = '<i class="fas fa-paper-plane"></i> Submit'; }
    });
  }

  if (file) {
    file.arrayBuffer().then(function(buf) {
      return crypto.subtle.digest('SHA-256', buf);
    }).then(function(hb) {
      contentHash = Array.from(new Uint8Array(hb)).map(function(b) { return b.toString(16).padStart(2,'0'); }).join('');
      submit(contentHash);
    }).catch(function() { submit(''); });
  } else {
    submit('');
  }
}
window.doSubmit = doSubmit;

// ── COPY LINK ─────────────────────────────────────────────────────────────────
function copyLink() {
  var link = document.getElementById('shareLink');
  if (link) { link.select(); document.execCommand('copy'); alert('Invite link copied!'); }
}
window.copyLink = copyLink;

// ── ESCAPE ────────────────────────────────────────────────────────────────────
function escHtml(s) {
  if (!s) return '';
  var d = document.createElement('div');
  d.textContent = String(s);
  return d.innerHTML;
}
window.escHtml = escHtml;

// ── BOOTSTRAP (DOMContentLoaded) ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async function() {

  // 1. Auth check
  var user = await waitForAuth(6000);
  if (!user) {
    var returnUrl = encodeURIComponent(window.location.href);
    window.location.href = '/signup_signin.html?redirect=' + returnUrl;
    return;
  }

  // Set owner name in solo view
  var ownerNameEl = document.getElementById('soloOwnerName');
  if (ownerNameEl) {
    ownerNameEl.textContent =
      (user.user_metadata && user.user_metadata.artistic_name) ||
      (user.user_metadata && user.user_metadata.full_name) ||
      user.email || 'You';
  }

  // 2. Plan selection
  document.querySelectorAll('.plan-card').forEach(function(card) {
    card.addEventListener('click', function() { selectPlan(card); });
  });

  // 3. Step 1 → 2
  var nextToDetailsBtn = document.getElementById('nextToDetailsBtn');
  if (nextToDetailsBtn) nextToDetailsBtn.addEventListener('click', function() { showStep(2); });

  // 4. Step 2 → 3
  var nextToOwnershipBtn = document.getElementById('nextToOwnershipBtn');
  if (nextToOwnershipBtn) nextToOwnershipBtn.addEventListener('click', function() {
    var title = (document.getElementById('workTitle') || {}).value || '';
    if (!title.trim()) { alert('Please enter a work title.'); return; }
    showStep(3);
  });

  // 5. Mode selection (step 3)
  var soloBtn = document.getElementById('soloModeBtn');
  var collabBtn = document.getElementById('collabModeBtn');
  if (soloBtn) soloBtn.addEventListener('click', function() {
    window.mode = 'solo';
    soloBtn.classList.add('active');
    if (collabBtn) collabBtn.classList.remove('active');
    // Hide collab step in workflow
    var s5 = document.getElementById('step5c');
    if (s5) s5.style.display = 'none';
    var sfn = document.getElementById('stepFinalNum'); if (sfn) sfn.textContent = '5';
  });
  if (collabBtn) collabBtn.addEventListener('click', function() {
    window.mode = 'collab';
    collabBtn.classList.add('active');
    if (soloBtn) soloBtn.classList.remove('active');
    // Show collab step in workflow
    var s5 = document.getElementById('step5c');
    if (s5) s5.style.display = '';
    var sfn = document.getElementById('stepFinalNum'); if (sfn) sfn.textContent = '6';
  });

  // 6. Step 3 → 4
  var nextToUploadBtn = document.getElementById('nextToUploadBtn');
  if (nextToUploadBtn) nextToUploadBtn.addEventListener('click', function() {
    if (!window.mode) { alert('Please select an ownership type.'); return; }
    showStep(4);
    var soloContent   = document.getElementById('soloContent');
    var collabContent = document.getElementById('collabContent');
    if (soloContent)   soloContent.classList.toggle('hidden', window.mode !== 'solo');
    if (collabContent) collabContent.classList.toggle('hidden', window.mode !== 'collab');
  });

  // 7. Step 4 → next (solo→final submit, collab→step5)
  var step4NextBtn = document.getElementById('step4NextBtn');
  if (step4NextBtn) step4NextBtn.addEventListener('click', function() {
    if (window.mode === 'collab') {
      renderPrimaryRow();
      renderCollaborators();
      showStep('5c');
    } else {
      doSubmit();
    }
  });

  // 8. Step 5 (collab) finalize
  var finalizeBtn = document.getElementById('finalizeBtn');
  if (finalizeBtn) {
    var fresh = finalizeBtn.cloneNode(true);
    finalizeBtn.parentNode.replaceChild(fresh, finalizeBtn);
    fresh.addEventListener('click', doSubmit);
  }

  // 9. Add co-owner button
  var addBtn = document.getElementById('addCollaboratorBtn');
  if (addBtn) addBtn.addEventListener('click', openCoownerModal);

  // 10. Co-owner modal save/cancel
  var saveBtn   = document.getElementById('coownerSaveBtn');
  var cancelBtn = document.getElementById('coownerCancelBtn');
  if (saveBtn)   saveBtn.addEventListener('click', saveCoowner);
  if (cancelBtn) cancelBtn.addEventListener('click', closeCoownerModal);

  // Close modal on backdrop click
  var coModal = document.getElementById('coownerModal');
  if (coModal) coModal.addEventListener('click', function(e) {
    if (e.target === coModal) closeCoownerModal();
  });

  // 11. Invite/remove all buttons
  var inviteAllBtn = document.getElementById('inviteAllBtn');
  var removeAllBtn = document.getElementById('removeAllBtn');
  if (inviteAllBtn) inviteAllBtn.addEventListener('click', function() {
    if (window.collaborators.length === 0) { alert('No co-owners to invite.'); return; }
    alert('Invitations sent to: ' + window.collaborators.map(function(c){ return c.email; }).join(', '));
  });
  if (removeAllBtn) removeAllBtn.addEventListener('click', function() {
    if (!window.collaborators.length) return;
    if (confirm('Remove all co-owners?')) {
      window.collaborators = [];
      renderCollaborators();
    }
  });

  // 12. Download cert button
  var dlBtn = document.getElementById('downloadCertBtn');
  if (dlBtn) dlBtn.addEventListener('click', function() {
    var s = CertificationState.submissionId;
    var c = CertificationState.certId;
    if (s && c) {
      window.location.href = 'certificate_loader.html?id=' + encodeURIComponent(s) + '&cert=' + encodeURIComponent(c);
    } else {
      alert('Certificate not yet available - please wait for processing to complete.');
    }
  });

  // 13. File upload setup
  var uploadCfgBase = {
    progressId: '', barId: '', progTextId: '', embedId: '', labelId: '', statsId: '',
  };
  setupUploadArea({
    areaId:     'soloUploadArea',
    inputId:    'soloFileInput',
    resetId:    'soloResetBtn',
    textId:     'soloUploadText',
    infoId:     'soloFileInfo',
    iconId:     'soloFileIcon',
    nameId:     'soloFileName',
    sizeId:     'soloFileSz',
    progressId: 'soloProgress',
    barId:      'soloProgressBar',
    progTextId: 'soloProgressText',
    embedId:    'soloViewerEmbed',
    labelId:    'soloViewerLabel',
    statsId:    'soloFileStats',
  });
  setupUploadArea({
    areaId:     'primaryUploadArea',
    inputId:    'primaryFileInput',
    resetId:    'primaryResetBtn',
    textId:     'primaryUploadText',
    infoId:     'primaryFileInfo',
    iconId:     'primaryFileIcon',
    nameId:     'primaryFileName',
    sizeId:     'primaryFileSz',
    progressId: 'primaryProgress',
    barId:      'primaryProgressBar',
    progTextId: 'primaryProgressText',
    embedId:    'primaryViewerEmbed',
    labelId:    'primaryViewerLabel',
    statsId:    'primaryFileStats',
  });

  // 14. Page-refresh / URL recovery
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
  if (sid) await hydrateFromSubmissionId(sid);

  // Start at step 1
  showStep(1);
});
// ── FIX: Ownership Type State Management ─────────────────────────────────────
// Add this to certification_portal.js

// Initialize ownership type
let ownershipType = null;

// Bind ownership buttons if not already bound
document.addEventListener('DOMContentLoaded', function() {
  const soloBtn = document.getElementById('soloModeBtn');
  const collabBtn = document.getElementById('collabModeBtn');
  const nextToUploadBtn = document.getElementById('nextToUploadBtn');
  
  if (soloBtn) {
    soloBtn.onclick = function() {
      ownershipType = 'solo';
      soloBtn.classList.add('active');
      if (collabBtn) collabBtn.classList.remove('active');
      window.mode = 'solo';
    };
  }
  
  if (collabBtn) {
    collabBtn.onclick = function() {
      ownershipType = 'collab';
      collabBtn.classList.add('active');
      if (soloBtn) soloBtn.classList.remove('active');
      window.mode = 'collab';
    };
  }
  
  // Fix nextToUploadBtn to check ownership type
  if (nextToUploadBtn) {
    nextToUploadBtn.onclick = function() {
      if (!ownershipType && !window.mode) {
        alert('Please select an ownership type (Sole Ownership or Co-ownership)');
        return;
      }
      
      showStep(4);
      
      const soloContent = document.getElementById('soloContent');
      const collabContent = document.getElementById('collabContent');
      
      if (ownershipType === 'solo' || window.mode === 'solo') {
        if (soloContent) soloContent.classList.remove('hidden');
        if (collabContent) collabContent.classList.add('hidden');
      } else {
        if (collabContent) collabContent.classList.remove('hidden');
        if (soloContent) soloContent.classList.add('hidden');
      }
    };
  }
});



// ── FIX: Polling with exponential backoff and proper state handling ─────────
// Replace the existing pollCertificationStatus function

let pollController = null;
let pollAttempts = 0;

function pollCertificationStatus(submissionId, maxAttempts = 60, baseIntervalMs = 3000) {
  // Abort any existing polling
  if (pollController) {
    pollController.abort();
  }
  
  pollController = new AbortController();
  pollAttempts = 0;
  
  async function poll() {
    pollAttempts++;
    
    // Exponential backoff: start at 2s, max 15s
    const backoffMs = Math.min(baseIntervalMs * Math.pow(1.2, pollAttempts - 1), 15000);
    
    try {
      const res = await fetch(`${TIER4_URL}/api/certify/${encodeURIComponent(submissionId)}`, {
        signal: pollController.signal
      });
      
      if (!res.ok) throw new Error(`Status check HTTP ${res.status}`);
      const data = await res.json();

      CertificationState.submissionId = submissionId;
      CertificationState.certId = data.cert_id || CertificationState.certId;
      CertificationState.status = data.status || CertificationState.status;
      CertificationState.data = data;

      updateUIBasedOnState();

      // FIX: Handle 'analyzed' as intermediate state, not completed
      if (data.status === 'completed') {
        CertificationState.status = 'completed';
        updateUIBasedOnState();
        renderCompletedState(data);
        
        sessionStorage.setItem('activeCert', JSON.stringify({
          submission_id: submissionId,
          cert_id: data.cert_id || CertificationState.certId,
          plan: data.plan || 'free',
          title: data.title || '',
          status: 'completed',
        }));
        sessionStorage.removeItem('activeCertification');
        return;
      }
      
      // Handle 'analyzed' as intermediate state
      if (data.status === 'analyzed') {
        CertificationState.status = 'analyzed';
        updateUIBasedOnState();
        // Continue polling for completion
        if (pollAttempts < maxAttempts) {
          setTimeout(poll, backoffMs);
        }
        return;
      }

      if (data.status === 'failed') {
        CertificationState.status = 'failed';
        CertificationState.error = data.failure_reason || 'Processing failed';
        updateUIBasedOnState();
        renderErrorState(data);
        return;
      }

      // Still in flight (queued, processing)
      if (pollAttempts < maxAttempts) {
        setTimeout(poll, backoffMs);
      } else {
        CertificationState.status = 'failed';
        CertificationState.error = 'Timed out. Your certificate may still process - check the dashboard.';
        updateUIBasedOnState();
      }

    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Polling aborted');
        return;
      }
      console.warn('Poll attempt', pollAttempts, err.message);
      if (pollAttempts < maxAttempts) {
        setTimeout(poll, backoffMs);
      } else {
        CertificationState.status = 'failed';
        CertificationState.error = err.message;
        updateUIBasedOnState();
      }
    }
  }

  poll();
}

// ── SIMPLE FIX FOR OWNERSHIP BUTTONS ─────────────────────────────────────────
// This ensures the Continue button works after selecting ownership type

(function fixOwnershipButtons() {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fixButtons);
  } else {
    fixButtons();
  }
  
  function fixButtons() {
    const soloBtn = document.getElementById('soloModeBtn');
    const collabBtn = document.getElementById('collabModeBtn');
    const nextBtn = document.getElementById('nextToUploadBtn');
    
    // Set initial window.mode if not set
    if (!window.mode && soloBtn && soloBtn.classList.contains('active')) {
      window.mode = 'solo';
    }
    if (!window.mode && collabBtn && collabBtn.classList.contains('active')) {
      window.mode = 'collab';
    }
    
    // Fix Solo button click
    if (soloBtn && !soloBtn._fixed) {
      soloBtn._fixed = true;
      soloBtn.addEventListener('click', function() {
        window.mode = 'solo';
        soloBtn.classList.add('active');
        if (collabBtn) collabBtn.classList.remove('active');
        console.log('[fix] Mode set to: solo');
      });
    }
    
    // Fix Collab button click
    if (collabBtn && !collabBtn._fixed) {
      collabBtn._fixed = true;
      collabBtn.addEventListener('click', function() {
        window.mode = 'collab';
        collabBtn.classList.add('active');
        if (soloBtn) soloBtn.classList.remove('active');
        // Show step5 in workflow
        const step5c = document.getElementById('step5c');
        if (step5c) step5c.style.display = '';
        const stepFinalNum = document.getElementById('stepFinalNum');
        if (stepFinalNum) stepFinalNum.textContent = '6';
        console.log('[fix] Mode set to: collab');
      });
    }
    
    // Fix Continue button
    if (nextBtn && !nextBtn._fixed) {
      nextBtn._fixed = true;
      nextBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Check if mode is selected
        if (!window.mode) {
          alert('Please select Sole Ownership or Co-ownership before continuing.');
          return;
        }
        
        console.log('[fix] Continue clicked, mode:', window.mode);
        
        // Show step 4
        if (typeof showStep === 'function') {
          showStep(4);
        } else {
          // Fallback if showStep not defined
          const step4Card = document.getElementById('step4Card');
          if (step4Card) step4Card.classList.remove('hidden');
          
          // Update step indicators
          [1,2,3].forEach(function(n) {
            const el = document.getElementById('step' + n);
            if (el) {
              el.classList.remove('active');
              el.classList.add('completed');
            }
          });
          const step4 = document.getElementById('step4');
          if (step4) step4.classList.add('active');
        }
        
        // Show correct content based on mode
        const soloContent = document.getElementById('soloContent');
        const collabContent = document.getElementById('collabContent');
        
        if (soloContent) soloContent.classList.toggle('hidden', window.mode !== 'solo');
        if (collabContent) collabContent.classList.toggle('hidden', window.mode !== 'collab');
      });
    }
    
    console.log('[fix] Ownership buttons fixed. Current mode:', window.mode);
  }
})();
