// ── Step navigation ───────────────────────────────────────────────────────────
var STEP_CARDS = {
  1: 'step1Card',
  2: 'step2Card',
  3: 'step3Card',
  4: 'step4Card',
  5: 'step5collabCard',
  6: 'stepFinalCard'
};
var STEP_INDICATORS = { 1:'step1', 2:'step2', 3:'step3', 4:'step4', 5:'step5c', 6:'stepFinal' };

window.showStep = function(n) {
  Object.values(STEP_CARDS).forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  });
  var card = document.getElementById(STEP_CARDS[n]);
  if (card) card.classList.remove('hidden');

  Object.values(STEP_INDICATORS).forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.classList.remove('active');
  });
  var ind = document.getElementById(STEP_INDICATORS[n]);
  if (ind) ind.classList.add('active');
};

// ── Plan selection ────────────────────────────────────────────────────────────
window.selectedPlan = 'free';

window.selectPlan = function(el) {
  document.querySelectorAll('.plan-card').forEach(function(c) {
    c.classList.remove('selected');
  });
  el.classList.add('selected');
  window.selectedPlan = el.dataset.plan;

  // Co-ownership only available on studio plan
  var collabStep = document.getElementById('step5c');
  var stepFinalNum = document.getElementById('stepFinalNum');
  var stepFinalLabel = document.getElementById('stepFinalLabel');
  if (window.selectedPlan === 'studio') {
    if (collabStep) collabStep.style.display = '';
    if (stepFinalNum) stepFinalNum.textContent = '6';
  } else {
    if (collabStep) collabStep.style.display = 'none';
    if (stepFinalNum) stepFinalNum.textContent = '5';
  }
};

// ── Auth-aware init ───────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", function() {

  // Show loading overlay
  var loadingMsg = document.createElement("div");
  loadingMsg.id = "loadingState";
  loadingMsg.style.cssText = "position:fixed;top:10px;left:50%;transform:translateX(-50%);padding:8px 16px;background:#222;color:#fff;border-radius:4px;z-index:9999;";
  loadingMsg.innerText = "Preparing your dashboard\u2026";
  document.body.appendChild(loadingMsg);

  var continueBtn = document.getElementById("nextToDetailsBtn");
  if (continueBtn) continueBtn.disabled = true;

  if (typeof window.waitForAuth === "function") {
    window.waitForAuth().then(function(user) {
      var msg = document.getElementById("loadingState");
      if (msg) msg.remove();

      if (user) {
        // Populate creator name in solo ownership box
        var soloOwnerName = document.getElementById("soloOwnerName");
        if (soloOwnerName && user.email) soloOwnerName.textContent = user.email;

        // Wire Continue button (step 1 → step 2)
        if (continueBtn) {
          continueBtn.disabled = false;
          continueBtn.addEventListener("click", function(e) {
            e.preventDefault();
            window.showStep(2);
          });
        }

        // Wire step 2 → 3
        var nextToOwnershipBtn = document.getElementById("nextToOwnershipBtn");
        if (nextToOwnershipBtn) {
          nextToOwnershipBtn.addEventListener("click", function(e) {
            e.preventDefault();
            var title = document.getElementById("workTitle");
            if (!title || !title.value.trim()) {
              alert("Please enter a work title before continuing.");
              return;
            }
            window.showStep(3);
          });
        }

        // Wire step 3 → 4
        var nextToUploadBtn = document.getElementById("nextToUploadBtn");
        if (nextToUploadBtn) {
          nextToUploadBtn.addEventListener("click", function(e) {
            e.preventDefault();
            var isSolo = document.getElementById("soloModeBtn");
            var isCollab = document.getElementById("collabModeBtn");
            var soloActive = isSolo && isSolo.classList.contains('active');
            var collabActive = isCollab && isCollab.classList.contains('active');
            if (!soloActive && !collabActive) {
              alert("Please select an ownership type.");
              return;
            }
            var soloContent = document.getElementById("soloContent");
            var collabContent = document.getElementById("collabContent");
            if (soloContent) soloContent.classList.toggle('hidden', !soloActive);
            if (collabContent) collabContent.classList.toggle('hidden', !collabActive);
            window.showStep(4);
          });
        }

        // Wire ownership toggle buttons
        var soloModeBtn = document.getElementById("soloModeBtn");
        var collabModeBtn = document.getElementById("collabModeBtn");
        if (soloModeBtn) {
          soloModeBtn.addEventListener("click", function() {
            soloModeBtn.classList.add('active');
            if (collabModeBtn) collabModeBtn.classList.remove('active');
          });
        }
        if (collabModeBtn) {
          collabModeBtn.addEventListener("click", function() {
            collabModeBtn.classList.add('active');
            if (soloModeBtn) soloModeBtn.classList.remove('active');
          });
        }

      } else {
        alert("You must sign in to continue.");
        window.location.href = '/signup_signin.html?redirect=' +
          encodeURIComponent(window.location.href);
      }
    });
  } else {
    console.error("waitForAuth not available — check script order in certification_portal.html");
    var msg = document.getElementById("loadingState");
    if (msg) msg.remove();
  }
});


// ── Upload wiring ─────────────────────────────────────────────────────────────
(function () {
  var uploadedFile = null;

  var FILE_ICONS = {
    audio: '🎵', video: '🎬', image: '🖼️', epub: '📖', pdf: '📄', code: '💻'
  };

  function formatBytes(b) {
    if (b < 1024) return b + ' B';
    if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
    return (b / 1048576).toFixed(1) + ' MB';
  }

  function getTypeIcon(name) {
    var ext = (name.split('.').pop() || '').toLowerCase();
    var map = { mp3:'audio', wav:'audio', flac:'audio', ogg:'audio',
                mp4:'video', mov:'video', avi:'video', mkv:'video',
                jpg:'image', jpeg:'image', png:'image', gif:'image', webp:'image',
                epub:'epub', pdf:'pdf',
                js:'code', py:'code', ts:'code', html:'code', css:'code' };
    return FILE_ICONS[map[ext]] || '📄';
  }

  function simulateProgress(barId, textId, onDone) {
    var bar  = document.getElementById(barId);
    var text = document.getElementById(textId);
    var prog = document.getElementById(barId.replace('Bar', ''));
    if (prog) prog.style.display = 'block';
    var pct = 0;
    var iv = setInterval(function () {
      pct += Math.random() * 18 + 5;
      if (pct >= 100) { pct = 100; clearInterval(iv); if (onDone) onDone(); }
      if (bar)  bar.style.width = pct + '%';
      if (text) text.textContent = pct < 100 ? 'Processing… ' + Math.floor(pct) + '%' : 'Ready ✓';
    }, 120);
  }

  function handleFile(file, prefix) {
    uploadedFile = file;
    var nameEl = document.getElementById(prefix + 'FileName');
    var sizeEl = document.getElementById(prefix + 'FileSz');
    var iconEl = document.getElementById(prefix + 'FileIcon');
    var infoEl = document.getElementById(prefix + 'FileInfo');
    var areaEl = document.getElementById(prefix + 'UploadArea');
    var step4Next = document.getElementById('step4NextBtn');

    if (nameEl) nameEl.textContent = file.name;
    if (sizeEl) sizeEl.textContent = formatBytes(file.size);
    if (iconEl) iconEl.textContent = getTypeIcon(file.name);
    if (infoEl) infoEl.style.display = 'flex';
    if (areaEl) areaEl.classList.add('has-file');

    // Disable Continue until processing done
    if (step4Next) step4Next.disabled = true;

    simulateProgress(prefix + 'ProgressBar', prefix + 'ProgressText', function () {
      if (step4Next) step4Next.disabled = false;
    });
  }

  function resetUpload(prefix) {
    uploadedFile = null;
    var nameEl   = document.getElementById(prefix + 'FileName');
    var sizeEl   = document.getElementById(prefix + 'FileSz');
    var iconEl   = document.getElementById(prefix + 'FileIcon');
    var infoEl   = document.getElementById(prefix + 'FileInfo');
    var areaEl   = document.getElementById(prefix + 'UploadArea');
    var barEl    = document.getElementById(prefix + 'ProgressBar');
    var textEl   = document.getElementById(prefix + 'ProgressText');
    var progEl   = document.getElementById(prefix + 'Progress');
    var inputEl  = document.getElementById(prefix + 'FileInput');
    var step4Next = document.getElementById('step4NextBtn');

    if (nameEl)  nameEl.textContent  = '—';
    if (sizeEl)  sizeEl.textContent  = '—';
    if (iconEl)  iconEl.textContent  = '📄';
    if (infoEl)  infoEl.style.display = 'none';
    if (areaEl)  areaEl.classList.remove('has-file');
    if (barEl)   barEl.style.width   = '0%';
    if (textEl)  textEl.textContent  = 'Uploading...';
    if (progEl)  progEl.style.display = 'none';
    if (inputEl) inputEl.value = '';
    if (step4Next) step4Next.disabled = true;
  }

  function wireZone(prefix) {
    var area     = document.getElementById(prefix + 'UploadArea');
    var input    = document.getElementById(prefix + 'FileInput');
    var resetBtn = document.getElementById(prefix + 'ResetBtn');

    if (!area || !input) return;

    // Click area → trigger file input
    area.addEventListener('click', function (e) {
      if (e.target === resetBtn || (resetBtn && resetBtn.contains(e.target))) return;
      input.click();
    });

    // File chosen via dialog
    input.addEventListener('change', function () {
      if (input.files && input.files[0]) handleFile(input.files[0], prefix);
    });

    // Drag and drop
    area.addEventListener('dragover', function (e) {
      e.preventDefault();
      area.classList.add('drag-over');
    });
    area.addEventListener('dragleave', function () {
      area.classList.remove('drag-over');
    });
    area.addEventListener('drop', function (e) {
      e.preventDefault();
      area.classList.remove('drag-over');
      var f = e.dataTransfer.files && e.dataTransfer.files[0];
      if (f) handleFile(f, prefix);
    });

    // Reset button
    if (resetBtn) {
      resetBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        resetUpload(prefix);
      });
    }
  }

  // ── Wire step4NextBtn → step 5 (collab) or stepFinal (solo) ─────────────────
  document.addEventListener('DOMContentLoaded', function () {
    wireZone('solo');
    wireZone('primary');

    // Disable Continue on step 4 by default until file is chosen
    var step4Next = document.getElementById('step4NextBtn');
    if (step4Next) {
      step4Next.disabled = true;
      step4Next.addEventListener('click', function (e) {
        e.preventDefault();
        if (!uploadedFile) {
          alert('Please upload your work file before continuing.');
          return;
        }
        var collabActive = document.getElementById('collabModeBtn') &&
          document.getElementById('collabModeBtn').classList.contains('active');
        window.showStep(collabActive ? 5 : 6);
      });
    }
  });
})();

// ── File Previewers ───────────────────────────────────────────────────────────
window._showPreview = function(file, prefix) {
  var embedEl = document.getElementById(prefix + 'ViewerEmbed');
  var labelEl = document.getElementById(prefix + 'ViewerLabel');
  if (!embedEl) return;
  embedEl.innerHTML = '';
  var url  = URL.createObjectURL(file);
  var t    = file.type || '';
  var ext  = (file.name.split('.').pop() || '').toLowerCase();

  if (t.startsWith('audio/')) {
    if (labelEl) labelEl.textContent = 'Audio Player';
    var a = document.createElement('audio');
    a.controls = true; a.style.cssText = 'width:100%;margin-top:10px;'; a.src = url;
    embedEl.appendChild(a);

  } else if (t.startsWith('video/')) {
    if (labelEl) labelEl.textContent = 'Video Player';
    var v = document.createElement('video');
    v.controls = true;
    v.style.cssText = 'width:100%;max-height:220px;margin-top:10px;border-radius:6px;display:block;';
    v.src = url; embedEl.appendChild(v);

  } else if (t.startsWith('image/')) {
    if (labelEl) labelEl.textContent = 'Image Preview';
    var img = document.createElement('img');
    img.src = url;
    img.style.cssText = 'max-width:100%;max-height:220px;border-radius:6px;margin:10px auto 0;display:block;';
    embedEl.appendChild(img);

  } else if (t === 'application/pdf' || ext === 'pdf') {
    if (labelEl) labelEl.textContent = 'PDF Viewer';
    var fr = document.createElement('iframe');
    fr.src = url;
    fr.style.cssText = 'width:100%;height:300px;border:none;border-radius:6px;margin-top:10px;background:#fff;';
    embedEl.appendChild(fr);

  } else if (t === 'application/epub+zip' || ext === 'epub') {
    if (labelEl) labelEl.textContent = 'eBook / EPUB';
    embedEl.innerHTML = '<div style="padding:16px;background:rgba(201,153,58,0.08);border:1px solid rgba(201,153,58,0.25);border-radius:6px;margin-top:10px;font-size:0.85rem;color:#E8C06A;">' +
      '\uD83D\uDCD6 <strong>' + file.name + '</strong><br>' +
      '<span style="color:rgba(250,250,248,0.55);font-size:0.78rem;">Full eBook reader available after certification</span></div>';

  } else {
    if (labelEl) labelEl.textContent = 'Code / Script Preview';
    var rd = new FileReader();
    rd.onload = function(e) {
      var pre = document.createElement('pre');
      pre.style.cssText = 'background:rgba(0,0,0,0.4);border:1px solid rgba(201,153,58,0.2);border-radius:6px;' +
        'padding:12px;font-size:0.72rem;color:#E8C06A;overflow:auto;max-height:220px;margin-top:10px;' +
        'white-space:pre-wrap;word-break:break-all;';
      pre.textContent = (e.target.result || '').slice(0, 3000);
      embedEl.appendChild(pre);
    };
    rd.readAsText(file);
  }
};

document.addEventListener('DOMContentLoaded', function () {

  // Hook previewers onto file inputs
  ['solo', 'primary'].forEach(function(prefix) {
    var inp = document.getElementById(prefix + 'FileInput');
    if (inp) inp.addEventListener('change', function() {
      if (inp.files && inp.files[0]) window._showPreview(inp.files[0], prefix);
    });
  });

  // ── Co-owner modal & splits ───────────────────────────────────────────────
  var collaborators = [];

  function initPrimaryRow() {
    var user  = window.currentUser || {};
    var label = user.email || 'You (Primary Creator)';
    collaborators = [{ name: label, email: user.email || '', split: 100, role: 'Primary Creator', isPrimary: true }];
    renderCollaborators();
  }

  function renderCollaborators() {
    var list = document.getElementById('collaboratorList');
    if (!list) return;
    list.innerHTML = collaborators.map(function(c, i) {
      return '<div style="display:flex;justify-content:space-between;align-items:center;' +
             'padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.06);">' +
        '<div>' +
          '<div style="font-size:0.88rem;font-weight:600;">' + c.name + '</div>' +
          '<div style="font-size:0.75rem;color:rgba(250,250,248,0.5);">' + c.role +
            (c.email ? ' \u00b7 ' + c.email : '') + '</div>' +
        '</div>' +
        '<div style="display:flex;align-items:center;gap:10px;">' +
          '<span style="color:#C9993A;font-weight:700;font-size:1rem;">' + c.split + '%</span>' +
          (!c.isPrimary
            ? '<button onclick="window._removeCoowner(' + i + ')" style="background:rgba(224,85,85,0.15);' +
              'border:1px solid rgba(224,85,85,0.3);color:#f08080;border-radius:4px;' +
              'padding:3px 8px;font-size:0.75rem;cursor:pointer;">\u2715</button>'
            : '') +
        '</div>' +
      '</div>';
    }).join('');
    renderSplitVisual();
  }

  window._removeCoowner = function(idx) {
    if (!collaborators[idx] || collaborators[idx].isPrimary) return;
    var freed = collaborators[idx].split;
    collaborators.splice(idx, 1);
    collaborators[0].split = Math.min(100, collaborators[0].split + freed);
    renderCollaborators();
  };

  function renderSplitVisual() {
    var vis  = document.getElementById('splitVisual');
    var warn = document.getElementById('splitWarning');
    if (!vis) return;
    var total = collaborators.reduce(function(s, c) { return s + c.split; }, 0);
    vis.innerHTML = collaborators.map(function(c) {
      return '<div style="display:inline-block;height:14px;width:' + c.split + '%;' +
             'background:' + (c.isPrimary ? '#C9993A' : '#3DB87A') + ';' +
             'border-radius:3px;margin-right:2px;vertical-align:top;" title="' + c.name + ': ' + c.split + '%"></div>';
    }).join('');
    if (warn) {
      if (total !== 100) {
        warn.textContent = '\u26a0 Total is ' + total + '% \u2014 must equal exactly 100%';
        warn.style.color = '#f08080';
      } else {
        warn.textContent = '\u2713 Splits balance to 100%';
        warn.style.color = '#3DB87A';
      }
    }
  }

  var modal     = document.getElementById('coownerModal');
  var addBtn    = document.getElementById('addCollaboratorBtn');
  var cancelBtn = document.getElementById('coownerCancelBtn');
  var saveBtn   = document.getElementById('coownerSaveBtn');
  var removeAll = document.getElementById('removeAllBtn');
  var inviteAll = document.getElementById('inviteAllBtn');

  if (addBtn && modal) {
    addBtn.addEventListener('click', function() {
      var used = collaborators.reduce(function(s,c){ return s+c.split; }, 0);
      var remaining = Math.max(0, 100 - used);
      ['coFullName','coArtisticName','coCountry','coOwnershipTitle','coEmail'].forEach(function(id){
        var el = document.getElementById(id); if(el) el.value = '';
      });
      var gs = document.getElementById('coGender'); if(gs) gs.value = '';
      var ts = document.getElementById('coTitle');  if(ts) ts.value = '';
      var sp = document.getElementById('coSplit');  if(sp) sp.value = remaining > 0 ? remaining : '';
      modal.style.display = 'flex';
    });
  }

  if (cancelBtn && modal) {
    cancelBtn.addEventListener('click', function() { modal.style.display = 'none'; });
  }
  if (modal) {
    modal.addEventListener('click', function(e) { if(e.target === modal) modal.style.display = 'none'; });
  }

  if (saveBtn) {
    saveBtn.addEventListener('click', function() {
      var name    = (document.getElementById('coFullName')       || {}).value || '';
      var email   = (document.getElementById('coEmail')          || {}).value || '';
      var split   = parseInt((document.getElementById('coSplit') || {}).value || '0', 10);
      var role    = (document.getElementById('coOwnershipTitle') || {}).value || 'Co-owner';
      var artistic= (document.getElementById('coArtisticName')   || {}).value || '';
      var country = (document.getElementById('coCountry')        || {}).value || '';

      if (!name.trim())   { alert('Full name is required.');            return; }
      if (!email.trim())  { alert('Email address is required.');        return; }
      if (!split || split < 1 || split > 99) { alert('Ownership % must be 1\u201399.'); return; }

      var used = collaborators.reduce(function(s,c){ return s+c.split; }, 0);
      if (used + split > 100) {
        alert('Would exceed 100%. Available: ' + (100 - used) + '%'); return;
      }

      collaborators[0].split -= split;
      collaborators.push({
        name:      name + (artistic ? ' (' + artistic + ')' : ''),
        email:     email,
        split:     split,
        role:      role + (country ? ' \u00b7 ' + country : ''),
        isPrimary: false
      });
      renderCollaborators();
      modal.style.display = 'none';
    });
  }

  if (removeAll) {
    removeAll.addEventListener('click', function() {
      if (!confirm('Remove all co-owners?')) return;
      collaborators = [{ name: collaborators[0].name, email: collaborators[0].email,
                         split: 100, role: 'Primary Creator', isPrimary: true }];
      renderCollaborators();
    });
  }

  if (inviteAll) {
    inviteAll.addEventListener('click', function() {
      var co = collaborators.filter(function(c){ return !c.isPrimary; });
      if (!co.length) { alert('No co-owners added yet.'); return; }
      alert('Invitations queued for:\n' + co.map(function(c){ return '\u2022 ' + c.email; }).join('\n'));
    });
  }

  // Init primary row after auth resolves
  if (window.currentUser) {
    initPrimaryRow();
  } else {
    setTimeout(function() { if (!collaborators.length) initPrimaryRow(); }, 2500);
  }

  // Also expose so collabModeBtn click can init
  window._initPrimaryRow = initPrimaryRow;

  // ── Submit routing ────────────────────────────────────────────────────────
  function routeToPayment() {
    var plan  = window.selectedPlan || 'free';
    var title = (document.getElementById('workTitle') || {}).value || 'Untitled Work';
    var wtype = (document.getElementById('workType')  || {}).value || 'audio';
    try {
      sessionStorage.setItem('pendingCert', JSON.stringify({
        title: title, work_type: wtype,
        collaborators:   collaborators.filter(function(c){ return !c.isPrimary; }),
        ownership_split: collaborators.reduce(function(o,c){ o[c.email||c.name]=c.split; return o; }, {})
      }));
    } catch(e) {}
    if (plan === 'free') {
      window.showStep(6);
    } else {
      window.location.href = 'bill_review.html?plan=' + encodeURIComponent(plan) +
                             '&title=' + encodeURIComponent(title);
    }
  }
  window._routeToPayment = routeToPayment;

  // Intercept showStep(6) for paid solo plans
  var _origShow = window.showStep;
  window.showStep = function(n) {
    if (n === 6) {
      var plan = window.selectedPlan || 'free';
      var collabActive = document.getElementById('collabModeBtn') &&
        document.getElementById('collabModeBtn').classList.contains('active');
      if (!collabActive && plan !== 'free') { routeToPayment(); return; }
    }
    _origShow(n);
  };

  // Finalize button (step 5 collab → submit)
  var finalizeBtn = document.getElementById('finalizeBtn');
  if (finalizeBtn) {
    finalizeBtn.addEventListener('click', function(e) {
      e.preventDefault();
      var total = collaborators.reduce(function(s,c){ return s+c.split; }, 0);
      if (total !== 100) { alert('Splits must total 100% before submitting. Currently: ' + total + '%'); return; }
      routeToPayment();
    });
  }

  // Show step5c indicator when collab mode selected
  var collabModeBtn2 = document.getElementById('collabModeBtn');
  if (collabModeBtn2) {
    collabModeBtn2.addEventListener('click', function() {
      var s5 = document.getElementById('step5c'); if(s5) s5.style.display = '';
      var sn = document.getElementById('stepFinalNum'); if(sn) sn.textContent = '6';
      if (window._initPrimaryRow) window._initPrimaryRow();
    });
  }

});
