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
