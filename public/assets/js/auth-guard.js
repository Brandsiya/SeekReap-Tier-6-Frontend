// Include this on every protected page AFTER supabase SDK + config scripts
(async function authGuard() {
  function waitForClient(ms = 6000) {
    if (window.supabaseClient) return Promise.resolve(window.supabaseClient);
    return new Promise((resolve, reject) => {
      const t = setTimeout(() => reject(new Error('Supabase load timeout')), ms);
      document.addEventListener('supabaseReady', () => {
        clearTimeout(t); resolve(window.supabaseClient);
      }, { once: true });
    });
  }

  try {
    const sb = await waitForClient();
    const { data: { session }, error } = await sb.auth.getSession();

    if (error || !session) {
      window.location.replace('/signup_signin.html');
      return;
    }

    // Email not confirmed → send to verify page
    if (!session.user.email_confirmed_at) {
      sessionStorage.setItem('pendingVerifyEmail', session.user.email);
      window.location.replace('/email_verify_pending.html');
      return;
    }

    // ✅ Fully authenticated — expose user to the page
    window.currentUser = session.user;
    const meta = session.user.user_metadata || {};

    const emailEl = document.getElementById('userEmail');
    if (emailEl) emailEl.textContent = session.user.email;

    const nameEl = document.getElementById('userName');
    if (nameEl) nameEl.textContent = meta.full_name || session.user.email.split('@')[0];

  } catch (err) {
    console.error('Auth guard error:', err.message);
    window.location.replace('/email_verify_pending.html');
  }
})();
