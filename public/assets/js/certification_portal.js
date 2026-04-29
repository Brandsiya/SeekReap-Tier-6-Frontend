document.addEventListener("DOMContentLoaded", function() {
  // ── Global function definitions ───────────────────────────────
  window.handleContinue = function() {
    console.log("handleContinue executed");
    // TODO: insert your existing continue logic here
    // e.g., redirect to next step or submit form
  };

  window.handlePlanSelection = function(plan) {
    console.log("handlePlanSelection executed with plan:", plan);
    // TODO: insert your existing plan selection logic here
    // e.g., save plan choice, update UI, call Supabase
  };

  // ── Loading state ─────────────────────────────────────────────
  var loadingMsg = document.createElement("div");
  loadingMsg.id = "loadingState";
  loadingMsg.style.cssText = "position:fixed;top:10px;left:50%;transform:translateX(-50%);padding:8px 16px;background:#222;color:#fff;border-radius:4px;z-index:9999;";
  loadingMsg.innerText = "Preparing your dashboard…";
  document.body.appendChild(loadingMsg);

  var continueBtn = document.getElementById("continueBtn");
  var planButtons = document.querySelectorAll(".plan-select");
  if (continueBtn) continueBtn.disabled = true;
  planButtons.forEach(btn => btn.disabled = true);

  // ── Auth-aware binding ────────────────────────────────────────
  if (typeof window.waitForAuth === "function") {
    window.waitForAuth().then(function(user) {
      var msg = document.getElementById("loadingState");
      if (msg) msg.remove();

      if (user) {
        if (continueBtn) {
          continueBtn.disabled = false;
          continueBtn.addEventListener("click", function(e) {
            e.preventDefault();
            window.handleContinue();
          });
        }

        planButtons.forEach(function(btn) {
          btn.disabled = false;
          btn.addEventListener("click", function(e) {
            e.preventDefault();
            window.handlePlanSelection(btn.dataset.plan);
          });
        });
      } else {
        alert("You must sign in to continue.");
      }
    });
  } else {
    console.error("waitForAuth not available — check script order in certification_portal.html");
  }
});
