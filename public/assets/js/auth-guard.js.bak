/**
 * SeekReap auth-guard.js — v2
 * Fixes:
 *   1. Listens for supabaseReady event (fired by supabase-init) in addition to polling
 *   2. Increased client-discovery timeout: 40→100 attempts (10s) to survive Render cold starts
 *   3. requireAuth timeout raised 6000→12000ms
 *   4. waitForAuth default raised 8000→12000ms
 */
(function () {
  'use strict';

  function getClient() {
    return window.supabaseClient || null;
  }

  window.waitForAuth = function (timeoutMs) {
    timeoutMs = timeoutMs || 12000;
    return new Promise(function (resolve) {
      var resolved = false;

      function done(user) {
        if (resolved) return;
        resolved = true;
        window.currentUser = user || null;
        resolve(user || null);
      }

      // ── Path A: poll for supabaseClient ──────────────────────────────────
      var attempts = 0;
      var iv = setInterval(function () {
        attempts++;
        var client = getClient();
        if (client) {
          clearInterval(iv);
          client.auth.getSession().then(function (result) {
            var session = result && result.data && result.data.session;
            if (session && session.user) done(session.user);
          }).catch(function () {});
        } else if (attempts > 100) {   // 10 seconds
          clearInterval(iv);
          done(null);
        }
      }, 100);

      // ── Path B: supabaseReady event (fires when init script completes) ───
      document.addEventListener('supabaseReady', function () {
        var client = getClient();
        if (!client || resolved) return;
        clearInterval(iv);
        client.auth.getSession().then(function (result) {
          var session = result && result.data && result.data.session;
          if (session && session.user) done(session.user);
        }).catch(function () {});
      }, { once: true });

      // ── Path C: onAuthStateChange subscription ───────────────────────────
      function subscribe() {
        var client = getClient();
        if (!client) { setTimeout(subscribe, 250); return; }
        client.auth.onAuthStateChange(function (event, session) {
          if (session && session.user) done(session.user);
          else if (event === 'SIGNED_OUT') done(null);
        });
      }
      subscribe();

      // ── Hard timeout ─────────────────────────────────────────────────────
      setTimeout(function () { done(null); }, timeoutMs);
    });
  };

  window.requireAuth = function (redirectUrl) {
    redirectUrl = redirectUrl || window.location.href;
    return window.waitForAuth(12000).then(function (user) {
      if (!user) {
        window.location.href = '/signup_signin.html?redirect=' +
          encodeURIComponent(redirectUrl);
      }
      return user;
    });
  };

  window.seekreapSignOut = function () {
    var client = getClient();
    if (!client) return;
    client.auth.signOut().then(function () {
      window.currentUser = null;
      window.location.href = '/signup_signin.html';
    });
  };
})();
