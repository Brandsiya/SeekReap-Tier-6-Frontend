// auth-guard.js — handles normal sessions AND email confirmation redirects
(async function authGuard() {

  var ROUTES = (typeof window.ROUTES !== 'undefined') ? window.ROUTES : {
    login:  '/signup_signin.html',
    verify: '/email_verify_pending.html',
    home:   '/certification_portal.html'
  };

  var path = window.location.pathname;
  var hash = window.location.hash || '';
  var isVerifyPage  = path.includes('email_verify_pending');
  var isLoginPage   = path.includes('signup_signin');
  var hasAuthToken  = hash.includes('access_token');

  // ── STEP 1: If the URL contains an auth hash (email confirmation link),
  //   let Supabase process it FIRST before doing any session check.
  if (hasAuthToken) {
    // Wait for the SDK to be ready
    await waitForClient();
    // Supabase auto-processes the hash when getSession() is called — give it time
    await new Promise(function(r){ setTimeout(r, 800); });
    var result = await window.supabaseClient.auth.getSession();
    var session = result.data.session;

    if (session && session.user && session.user.email_confirmed_at) {
      // Clean the URL hash so it doesn't linger
      history.replaceState(null, '', window.location.pathname + window.location.search);
      sessionStorage.removeItem('pendingVerifyEmail');
      window.currentUser = session.user;
      setUserUI(session.user);
      document.dispatchEvent(new CustomEvent('authReady', { detail: { user: session.user } }));
      return; // ✅ Stay on page (certification_portal)
    }

    // Token present but exchange failed — show error and go to login
    console.warn('Auth guard: access_token present but session not established');
    window.location.replace(ROUTES.login + '?error=verification_failed');
    return;
  }

  // ── STEP 2: Normal page load — check existing session
  try {
    var sb = await waitForClient();
    var res = await sb.auth.getSession();
    var session = res.data.session;
    var err     = res.error;

    if (err || !session) {
      if (isVerifyPage && sessionStorage.getItem('pendingVerifyEmail')) {
        return; // allow staying on verify page
      }
      if (!isLoginPage) window.location.replace(ROUTES.login);
      return;
    }

    if (!session.user.email_confirmed_at) {
      sessionStorage.setItem('pendingVerifyEmail', session.user.email);
      if (!isVerifyPage) window.location.replace(ROUTES.verify);
      return;
    }

    // ✅ Fully authenticated
    sessionStorage.removeItem('pendingVerifyEmail');
    window.currentUser = session.user;
    setUserUI(session.user);
    document.dispatchEvent(new CustomEvent('authReady', { detail: { user: session.user } }));

  } catch (e) {
    console.error('Auth guard error:', e.message);
    if (!isVerifyPage && !isLoginPage) {
      window.location.replace(ROUTES.login);
    }
  }

  function waitForClient(ms) {
    ms = ms || 6000;
    if (window.supabaseClient) return Promise.resolve(window.supabaseClient);
    return new Promise(function(resolve, reject) {
      var t = setTimeout(function(){ reject(new Error('Supabase timeout')); }, ms);
      document.addEventListener('supabaseReady', function() {
        clearTimeout(t);
        resolve(window.supabaseClient);
      }, { once: true });
    });
  }

  function setUserUI(user) {
    var meta = user.user_metadata || {};
    var emailEl = document.getElementById('userEmail');
    if (emailEl) emailEl.textContent = user.email;
    var nameEl = document.getElementById('userName');
    if (nameEl) nameEl.textContent = meta.full_name || user.email.split('@')[0];
  }

})();
