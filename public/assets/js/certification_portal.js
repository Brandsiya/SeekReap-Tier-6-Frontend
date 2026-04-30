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





// ── Upload wiring (solo + collab) ─────────────────────────────────────────────
(function () {

  // ── Config ──────────────────────────────────────────────────────────────────
  var ACCEPT = '*/*';
  var MAX_BYTES = 500 * 1024 * 1024; // 500 MB

  var FILE_ICONS = {
    audio : '🎵', video : '🎬', image : '🖼️',
    pdf   : '📄', epub  : '📖', code  : '💻', default: '📄'
  };

  // Map MIME / extension → icon key
  function iconKey(file) {
    var t = file.type || '';
    if (t.startsWith('audio'))                      return 'audio';
    if (t.startsWith('video'))                      return 'video';
    if (t.startsWith('image'))                      return 'image';
    if (t === 'application/pdf')                    return 'pdf';
    if (t === 'application/epub+zip')               return 'epub';
    if (t.includes('javascript') || t.includes('text/x-') ||
        /\.(js|ts|py|go|java|cpp|c|sh|rb|rs|kt)$/i.test(file.name)) return 'code';
    return 'default';
  }

  function fmtBytes(b) {
    if (b < 1024)          return b + ' B';
    if (b < 1024 * 1024)   return (b / 1024).toFixed(1) + ' KB';
    return (b / (1024 * 1024)).toFixed(2) + ' MB';
  }

  // ── Core: wire one upload zone ───────────────────────────────────────────────
  //
  //  ids: {
  //    area, text, resetBtn, fileInput,
  //    fileInfo, fileIcon, fileName, fileSz,
  //    progress, progressBar, progressText,
  //    viewerLabel, viewerEmbed, fileStats      (viewer ids optional)
  //  }
  //
  function wireUploadZone(ids) {

    var area        = document.getElementById(ids.area);
    var text        = document.getElementById(ids.text);
    var resetBtn    = document.getElementById(ids.resetBtn);
    var fileInput   = document.getElementById(ids.fileInput);
    var fileInfo    = document.getElementById(ids.fileInfo);
    var fileIcon    = document.getElementById(ids.fileIcon);
    var fileName    = document.getElementById(ids.fileName);
    var fileSz      = document.getElementById(ids.fileSz);
    var progress    = document.getElementById(ids.progress);
    var progressBar = document.getElementById(ids.progressBar);
    var progressTxt = document.getElementById(ids.progressText);

    // Optional viewer elements
    var viewerLabel = ids.viewerLabel ? document.getElementById(ids.viewerLabel) : null;
    var viewerEmbed = ids.viewerEmbed ? document.getElementById(ids.viewerEmbed) : null;
    var fileStats   = ids.fileStats   ? document.getElementById(ids.fileStats)   : null;

    if (!area || !fileInput) return; // guard: elements not in DOM yet

    // Stored file reference exposed for submit logic
    area._uploadedFile = null;

    // ── Helpers ────────────────────────────────────────────────────────────────

    function showProgress(pct, label) {
      if (!progress) return;
      progress.style.display = 'block';
      if (progressBar) progressBar.style.width = pct + '%';
      if (progressTxt) progressTxt.textContent  = label || 'Uploading…';
    }

    function hideProgress() {
      if (progress) progress.style.display = 'none';
    }

    function clearViewer() {
      if (viewerLabel) viewerLabel.style.display = 'none';
      if (viewerEmbed) { viewerEmbed.innerHTML = ''; viewerEmbed.style.display = 'none'; }
      if (fileStats)   { fileStats.innerHTML  = ''; fileStats.style.display   = 'none'; }
    }

    function resetZone() {
      area._uploadedFile = null;
      fileInput.value    = '';

      if (text) text.textContent = 'Click to upload or drag & drop';
      area.classList.remove('has-file', 'drag-over', 'error');

      if (fileInfo) fileInfo.style.display = 'none';
      if (fileIcon) fileIcon.textContent   = '📄';
      if (fileName) fileName.textContent   = '—';
      if (fileSz)   fileSz.textContent     = '—';

      hideProgress();
      clearViewer();
    }

    // ── Preview / viewer ───────────────────────────────────────────────────────

    function renderViewer(file) {
      clearViewer();
      if (!viewerEmbed) return;

      var t = file.type || '';
      var url = URL.createObjectURL(file);

      // ── Image ──────────────────────────────────────────────────────────────
      if (t.startsWith('image')) {
        viewerLabel && (viewerLabel.textContent = 'Image Preview');
        viewerLabel && (viewerLabel.style.display = 'block');
        var img = document.createElement('img');
        img.src   = url;
        img.style.cssText = 'max-width:100%;max-height:320px;border-radius:6px;display:block;margin:0 auto;';
        img.onload = function () { URL.revokeObjectURL(url); };
        viewerEmbed.appendChild(img);
        viewerEmbed.style.display = 'block';
        return;
      }

      // ── Audio ──────────────────────────────────────────────────────────────
      if (t.startsWith('audio')) {
        viewerLabel && (viewerLabel.textContent = 'Audio Player');
        viewerLabel && (viewerLabel.style.display = 'block');
        var aud = document.createElement('audio');
        aud.controls = true;
        aud.src      = url;
        aud.style.cssText = 'width:100%;margin-top:8px;';
        aud.onended = function () { URL.revokeObjectURL(url); };
        viewerEmbed.appendChild(aud);
        viewerEmbed.style.display = 'block';
        return;
      }

      // ── Video ──────────────────────────────────────────────────────────────
      if (t.startsWith('video')) {
        viewerLabel && (viewerLabel.textContent = 'Video Player');
        viewerLabel && (viewerLabel.style.display = 'block');
        var vid = document.createElement('video');
        vid.controls = true;
        vid.src      = url;
        vid.style.cssText = 'width:100%;max-height:320px;border-radius:6px;';
        viewerEmbed.appendChild(vid);
        viewerEmbed.style.display = 'block';
        return;
      }

      // ── PDF (pdf.js) ───────────────────────────────────────────────────────
      if (t === 'application/pdf') {
        viewerLabel && (viewerLabel.textContent = 'PDF Document Viewer');
        viewerLabel && (viewerLabel.style.display = 'block');

        if (window.pdfjsLib) {
          var canvas = document.createElement('canvas');
          canvas.style.cssText = 'width:100%;border-radius:6px;display:block;';
          viewerEmbed.appendChild(canvas);
          viewerEmbed.style.display = 'block';

          var reader = new FileReader();
          reader.onload = function (ev) {
            window.pdfjsLib.getDocument({ data: ev.target.result }).promise
              .then(function (pdf) {
                if (fileStats) {
                  fileStats.innerHTML  = '<strong>' + pdf.numPages + '</strong> page' +
                    (pdf.numPages !== 1 ? 's' : '');
                  fileStats.style.display = 'block';
                }
                return pdf.getPage(1);
              })
              .then(function (page) {
                var vp  = page.getViewport({ scale: 1.5 });
                canvas.width  = vp.width;
                canvas.height = vp.height;
                return page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
              })
              .catch(function (err) {
                console.warn('PDF render error:', err);
                viewerEmbed.innerHTML = '<p style="color:#aaa;font-size:0.85rem;">Preview unavailable.</p>';
              });
          };
          reader.readAsArrayBuffer(file);
        } else {
          viewerEmbed.innerHTML = '<p style="color:#aaa;font-size:0.85rem;">pdf.js not loaded — preview unavailable.</p>';
          viewerEmbed.style.display = 'block';
        }
        return;
      }

      // ── EPUB (epub.js) ─────────────────────────────────────────────────────
      if (t === 'application/epub+zip' || file.name.endsWith('.epub')) {
        viewerLabel && (viewerLabel.textContent = 'eBook Preview');
        viewerLabel && (viewerLabel.style.display = 'block');

        if (window.ePub) {
          var epubDiv = document.createElement('div');
          epubDiv.style.cssText = 'width:100%;height:320px;border-radius:6px;overflow:hidden;background:#111;';
          viewerEmbed.appendChild(epubDiv);
          viewerEmbed.style.display = 'block';

          var fReader = new FileReader();
          fReader.onload = function (ev) {
            var book = window.ePub(ev.target.result);
            book.renderTo(epubDiv, { width: '100%', height: 320 });
          };
          fReader.readAsArrayBuffer(file);
        } else {
          viewerEmbed.innerHTML = '<p style="color:#aaa;font-size:0.85rem;">epub.js not loaded — preview unavailable.</p>';
          viewerEmbed.style.display = 'block';
        }
        return;
      }

      // ── Plain text / code ──────────────────────────────────────────────────
      var textTypes = ['text/', 'application/json', 'application/xml',
                       'application/javascript', 'application/x-sh'];
      var isText = textTypes.some(function (p) { return t.startsWith(p); }) ||
                   /\.(txt|md|json|xml|js|ts|py|go|sh|rb|rs|kt|css|html|yaml|toml)$/i.test(file.name);

      if (isText) {
        viewerLabel && (viewerLabel.textContent = 'File Preview');
        viewerLabel && (viewerLabel.style.display = 'block');

        var tReader = new FileReader();
        tReader.onload = function (ev) {
          var pre = document.createElement('pre');
          pre.style.cssText = 'margin:0;padding:10px;max-height:240px;overflow:auto;' +
                              'font-size:0.78rem;line-height:1.5;color:#d4c89a;background:#111;' +
                              'border-radius:6px;white-space:pre-wrap;word-break:break-word;';
          pre.textContent = ev.target.result.slice(0, 8000); // cap at 8 KB for display
          viewerEmbed.innerHTML = '';
          viewerEmbed.appendChild(pre);
          viewerEmbed.style.display = 'block';
        };
        tReader.readAsText(file);
        return;
      }

      // ── Fallback: no preview ───────────────────────────────────────────────
      URL.revokeObjectURL(url);
    }

    // ── Simulated upload progress then show file info ──────────────────────────

    function processFile(file) {
      if (file.size > MAX_BYTES) {
        area.classList.add('error');
        if (text) text.textContent = 'File too large (max 500 MB)';
        return;
      }

      area._uploadedFile = file;
      area.classList.add('has-file');
      area.classList.remove('error');

      // Update text inside the drop zone
      if (text) text.textContent = file.name;

      // Show file info row
      if (fileInfo) fileInfo.style.display = 'flex';
      if (fileIcon) fileIcon.textContent   = FILE_ICONS[iconKey(file)] || FILE_ICONS.default;
      if (fileName) fileName.textContent   = file.name;
      if (fileSz)   fileSz.textContent     = fmtBytes(file.size);

      // Simulated progress (XHR-style feel without real upload yet)
      var pct = 0;
      showProgress(0, 'Hashing file…');
      var interval = setInterval(function () {
        pct += Math.random() * 18 + 4;
        if (pct >= 100) {
          pct = 100;
          clearInterval(interval);
          if (progressBar) progressBar.style.width = '100%';
          if (progressTxt) progressTxt.textContent  = 'Ready ✓';
          setTimeout(function () {
            hideProgress();
            renderViewer(file);
          }, 600);
        } else {
          showProgress(Math.min(pct, 95), 'Processing…');
        }
      }, 90);
    }

    // ── Click to open file dialog ──────────────────────────────────────────────

    area.addEventListener('click', function (e) {
      // Don't fire if the reset button inside the area was clicked
      if (e.target.closest && e.target.closest('.ua-reset')) return;
      fileInput.click();
    });

    fileInput.setAttribute('accept', ACCEPT);
    fileInput.addEventListener('change', function () {
      if (fileInput.files && fileInput.files[0]) processFile(fileInput.files[0]);
    });

    // ── Drag & drop ────────────────────────────────────────────────────────────

    area.addEventListener('dragenter', function (e) {
      e.preventDefault(); e.stopPropagation();
      area.classList.add('drag-over');
    });
    area.addEventListener('dragover', function (e) {
      e.preventDefault(); e.stopPropagation();
      area.classList.add('drag-over');
    });
    area.addEventListener('dragleave', function (e) {
      e.preventDefault(); e.stopPropagation();
      // Only remove class when pointer leaves the area entirely (not child elements)
      if (!area.contains(e.relatedTarget)) area.classList.remove('drag-over');
    });
    area.addEventListener('drop', function (e) {
      e.preventDefault(); e.stopPropagation();
      area.classList.remove('drag-over');
      var files = e.dataTransfer && e.dataTransfer.files;
      if (files && files[0]) processFile(files[0]);
    });

    // ── Reset button ───────────────────────────────────────────────────────────

    if (resetBtn) {
      resetBtn.addEventListener('click', function (e) {
        e.stopPropagation(); // don't re-open file dialog
        resetZone();
      });
    }

    // ── Expose accessor for submit logic ───────────────────────────────────────
    //  Usage:  var file = getUploadedFile(ids.area);
    area.getUploadedFile = function () { return area._uploadedFile; };
  }

  // ── Wire solo zone ─────────────────────────────────────────────────────────
  wireUploadZone({
    area        : 'soloUploadArea',
    text        : 'soloUploadText',
    resetBtn    : 'soloResetBtn',
    fileInput   : 'soloFileInput',
    fileInfo    : 'soloFileInfo',
    fileIcon    : 'soloFileIcon',
    fileName    : 'soloFileName',
    fileSz      : 'soloFileSz',
    progress    : 'soloProgress',
    progressBar : 'soloProgressBar',
    progressText: 'soloProgressText',
    viewerLabel : 'soloViewerLabel',
    viewerEmbed : 'soloViewerEmbed',
    fileStats   : 'soloFileStats'
  });

  // ── Wire collab (primary) zone ─────────────────────────────────────────────
  wireUploadZone({
    area        : 'primaryUploadArea',
    text        : 'primaryUploadText',
    resetBtn    : 'primaryResetBtn',
    fileInput   : 'primaryFileInput',
    fileInfo    : 'primaryFileInfo',
    fileIcon    : 'primaryFileIcon',
    fileName    : 'primaryFileName',
    fileSz      : 'primaryFileSz',
    progress    : 'primaryProgress',
    progressBar : 'primaryProgressBar',
    progressText: 'primaryProgressText',
    viewerLabel : 'primaryViewerLabel',
    viewerEmbed : 'primaryViewerEmbed',
    fileStats   : 'primaryFileStats'
  });

  // ── Global accessor (used by submit / finalize handlers) ───────────────────
  //
  //  window.getUploadedFile('solo')    → File | null
  //  window.getUploadedFile('primary') → File | null
  //
  window.getUploadedFile = function (which) {
    var areaId = which === 'solo' ? 'soloUploadArea' : 'primaryUploadArea';
    var area   = document.getElementById(areaId);
    return (area && area._uploadedFile) ? area._uploadedFile : null;
  };

}());
