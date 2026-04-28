/**
 * SeekReap auth-guard.js — FIXED
 * Bug fixed: bare `supabase` global → `window.supabaseClient`
 */
(function () {
  'use strict';

  function getClient() {
    return window.supabaseClient || null;
  }

  window.waitForAuth = function (timeoutMs) {
    timeoutMs = timeoutMs || 8000;
    return new Promise(function (resolve) {
      var resolved = false;
      function done(user) {
        if (resolved) return;
        resolved = true;
        window.currentUser = user || null;
        resolve(user || null);
      }
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
        } else if (attempts > 40) {
          clearInterval(iv);
          done(null);
        }
      }, 100);
      function subscribe() {
        var client = getClient();
        if (!client) { setTimeout(subscribe, 250); return; }
        client.auth.onAuthStateChange(function (event, session) {
          if (session && session.user) done(session.user);
          else if (event === 'SIGNED_OUT') done(null);
        });
      }
      subscribe();
      setTimeout(function () { done(null); }, timeoutMs);
    });
  };

  window.requireAuth = function (redirectUrl) {
    redirectUrl = redirectUrl || window.location.href;
    return window.waitForAuth(6000).then(function (user) {
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
