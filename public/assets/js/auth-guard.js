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

    const isVerifyPage = window.location.pathname.includes('email_verify_pending.html');
    const hasToken = window.location.hash.includes('access_token');

    // STEP 1: Wait loop for email confirmation flow
    let session = null;
    let error = null;

    if (hasToken) {
      for (let i = 0; i < 6; i++) {
        await new Promise(r => setTimeout(r, 500));
        const res = await sb.auth.getSession();
        session = res.data.session;
        error = res.error;
        if (session) break;
      }
    } else {
      const res = await sb.auth.getSession();
      session = res.data.session;
      error = res.error;
    }

    const pendingEmail = sessionStorage.getItem('pendingVerifyEmail');

    // STEP 2: No session
    if (error || !session) {
      if (isVerifyPage && pendingEmail) return;
      if (hasToken) return; // IMPORTANT: don't redirect during email flow
      window.location.replace(ROUTES.login);
      return;
    }

    // STEP 3: Not confirmed yet
    if (!session.user.email_confirmed_at) {
      sessionStorage.setItem('pendingVerifyEmail', session.user.email);

      if (!isVerifyPage) {
        window.location.replace(ROUTES.verify);
      }
      return;
    }

    // STEP 4: Auth success
    sessionStorage.removeItem('pendingVerifyEmail');

    window.currentUser = session.user;

    const meta = session.user.user_metadata || {};

    const emailEl = document.getElementById('userEmail');
    if (emailEl) emailEl.textContent = session.user.email;

    const nameEl = document.getElementById('userName');
    if (nameEl) nameEl.textContent = meta.full_name || session.user.email.split('@')[0];

    document.dispatchEvent(
      new CustomEvent('authReady', { detail: { user: session.user } })
    );

  } catch (err) {
    console.error('Auth guard error:', err.message);

    const isVerifyPage = window.location.pathname.includes('email_verify_pending.html');
    const pendingEmail = sessionStorage.getItem('pendingVerifyEmail');

    if (!(isVerifyPage && pendingEmail)) {
      window.location.replace(ROUTES.login);
    }
  }

})();
