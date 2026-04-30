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
