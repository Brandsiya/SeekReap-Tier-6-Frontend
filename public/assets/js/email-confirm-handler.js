/**
 * SeekReap email-confirm-handler.js
 * 1. Detects Supabase email-confirmation redirect and shows sign-in
 *    form with a "Email confirmed" banner.
 * 2. After SIGNED_IN event on the auth page, redirects to
 *    certification_portal.html ONLY when coming from an email
 *    confirmation link (not after a normal sign-in, which
 *    signup_signin.js already handles).
 */
(function () {
  'use strict';
  var hash        = window.location.hash  || '';
  var search      = window.location.search || '';
  var hashParams  = new URLSearchParams(hash.replace(/^#/, ''));
  var queryParams = new URLSearchParams(search);

  // Only activate the auto-redirect when this is genuinely an
  // email-confirmation landing (Supabase adds type=signup to the URL).
  var isEmailConfirmed =
    hashParams.get('type')  === 'signup' ||
    queryParams.get('type') === 'signup' ||
    queryParams.get('confirmed') === 'true' ||
    (queryParams.get('token_hash') && queryParams.get('type') === 'signup');

  if (isEmailConfirmed) {
    document.addEventListener('DOMContentLoaded', function () {
      _showSignInForm();
      _injectBanner();
      window.history.replaceState({}, document.title, window.location.pathname);
    });
  }

  function _showSignInForm() {
    var tryIds = function(ids) {
      for (var i = 0; i < ids.length; i++) {
        var el = document.getElementById(ids[i]);
        if (el) return el;
      }
      return null;
    };
    var tab   = tryIds(['signinTab','signin-tab','loginTab','login-tab']);
    var sForm = tryIds(['signinForm','signin-form','loginForm','login-form']);
    var rForm = tryIds(['signupForm','signup-form','registerForm','register-form']);
    if (tab)   tab.click();
    if (rForm) rForm.style.display = 'none';
    if (sForm) sForm.style.display = '';
  }

  function _injectBanner() {
    if (document.getElementById('sr-email-confirmed')) return;
    var b = document.createElement('div');
    b.id = 'sr-email-confirmed';
    b.style.cssText = 'background:rgba(61,184,122,.12);border:1px solid rgba(61,184,122,.4);' +
      'color:#3DB87A;border-radius:6px;padding:12px 16px;margin-bottom:18px;' +
      'font-size:.88rem;display:flex;align-items:center;gap:10px;font-family:inherit;';
    b.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" ' +
      'stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>' +
      '<span><strong>Email confirmed!</strong>&nbsp; Please sign in to continue.</span>';
    var target = document.getElementById('signinForm') ||
                 document.getElementById('signin-form') ||
                 document.getElementById('loginForm') ||
                 document.querySelector('form');
    if (target) target.insertBefore(b, target.firstChild);
    else document.body.insertBefore(b, document.body.firstChild);
  }

  window.seekreapPostLoginRedirect = function () {
    var redirectTo = queryParams.get('redirect');
    if (redirectTo) {
      try {
        var dest = new URL(redirectTo, window.location.origin);
        if (dest.origin === window.location.origin) {
          window.location.href = dest.href; return;
        }
      } catch (_) {}
    }
    window.location.href = '/certification_portal.html';
  };

  // ── Auto-redirect after email confirmation sign-in ONLY ──────────────────
  // signup_signin.js handles the redirect for normal sign-ins (line 97).
  // We only wire our own listener when the user landed here from a
  // confirmation email — isEmailConfirmed is true in that case.
  // Without this guard, both handlers fire and cause a redirect race.
  var isAuthPage = window.location.pathname.indexOf('signup_signin') !== -1;
  if (isAuthPage && isEmailConfirmed) {
    (function waitAndListen() {
      if (!window.supabaseClient) { setTimeout(waitAndListen, 200); return; }
      window.supabaseClient.auth.onAuthStateChange(function (event, session) {
        if (event === 'SIGNED_IN' && session) {
          // Let signup_signin.js finish its own redirect first (it runs
          // synchronously). If we're still on this page after 400ms, we
          // take over — this covers the email-confirm flow where
          // signup_signin.js may not have a SIGNED_IN listener active.
          setTimeout(async function () {
            var sessionRes = await window.supabaseClient.auth.getSession();
            if (sessionRes && sessionRes.data && sessionRes.data.session && window.location.pathname.indexOf("signup_signin") !== -1) {
              window.seekreapPostLoginRedirect();
            }
          }, 400);
        }
      });
    })();
  }
})();
