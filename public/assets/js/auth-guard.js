(async function authGuard() {
  function waitForClient(ms = 6000) {
    if (window.supabaseClient) return Promise.resolve(window.supabaseClient);
    return new Promise((resolve, reject) => {
      const t = setTimeout(() => reject(new Error('Supabase load timeout')), ms);
      document.addEventListener('supabaseReady', () => {
        clearTimeout(t);
        resolve(window.supabaseClient);
      }, { once: true });
    });
  }

  try {
    const sb = await waitForClient();
    
    // Give Supabase a tiny window to parse the URL hash if it just landed from an email
    let { data: { session }, error } = await sb.auth.getSession();

    // If no session, wait briefly to see if an auth event triggers (handling the #access_token)
    if (!session && window.location.hash.includes('access_token')) {
       await new Promise(res => setTimeout(res, 1000));
       const retry = await sb.auth.getSession();
       session = retry.data.session;
    }

    const isVerifyPage = window.location.pathname.includes('email_verify_pending.html');
    const pendingEmail = sessionStorage.getItem('pendingVerifyEmail') || (session?.user?.email);

    if (error || !session) {
      if (isVerifyPage && pendingEmail) return;
      window.location.replace(ROUTES.login);
      return;
    }

    if (!session.user.email_confirmed_at) {
      sessionStorage.setItem('pendingVerifyEmail', session.user.email);
      if (!isVerifyPage) window.location.replace(ROUTES.verify);
      return;
    }

    // Success state
    sessionStorage.removeItem('pendingVerifyEmail');
    window.currentUser = session.user;
    
    // UI Updates
    const emailEl = document.getElementById('userEmail');
    if (emailEl) emailEl.textContent = session.user.email;
    const nameEl = document.getElementById('userName');
    if (nameEl) nameEl.textContent = session.user.user_metadata?.full_name || session.user.email.split('@')[0];

    document.dispatchEvent(new CustomEvent('authReady', { detail: { user: session.user } }));

  } catch (err) {
    console.error('Auth guard error:', err.message);
    if (!window.location.pathname.includes('email_verify_pending.html')) {
       window.location.replace(ROUTES.login);
    }
  }
})();
