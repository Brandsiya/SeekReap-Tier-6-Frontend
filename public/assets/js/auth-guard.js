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
    const { data: { session }, error } = await sb.auth.getSession();

    // Check if we are currently on the pending verification page
    const isVerifyPage = window.location.pathname.includes('email_verify_pending.html');
    
    // HARDENED: Fallback to session email if sessionStorage is lost
    const pendingEmail = 
      sessionStorage.getItem('pendingVerifyEmail') ||
      (session && session.user && session.user.email);

    // Case 1: No session at all
    if (error || !session) {
      // Allow staying on verify page if we have pending email context
      if (isVerifyPage && pendingEmail) return;
      
      // Otherwise, boot to login
      window.location.replace(ROUTES.login);
      return;
    }

    // Case 2: Session exists but email not confirmed (transitional state)
    if (!session.user.email_confirmed_at) {
      // Store email for persistence across page refreshes
      sessionStorage.setItem('pendingVerifyEmail', session.user.email);
      
      // Only redirect if not already on verify page
      if (!isVerifyPage) {
        window.location.replace(ROUTES.verify);
      }
      return;
    }

    // Case 3: Fully authenticated ✅
    // Clear any pending state since email is now confirmed
    sessionStorage.removeItem('pendingVerifyEmail');
    
    // Expose user to the page
    window.currentUser = session.user;
    const meta = session.user.user_metadata || {};
    
    // Update UI elements if they exist
    const emailEl = document.getElementById('userEmail');
    if (emailEl) emailEl.textContent = session.user.email;
    
    const nameEl = document.getElementById('userName');
    if (nameEl) nameEl.textContent = meta.full_name || session.user.email.split('@')[0];
    
    // Dispatch event for any listeners
    document.dispatchEvent(new CustomEvent('authReady', { detail: { user: session.user } }));

  } catch (err) {
    console.error('Auth guard error:', err.message);
    // Don't redirect on verify page if we have context
    const isVerifyPage = window.location.pathname.includes('email_verify_pending.html');
    const pendingEmail = sessionStorage.getItem('pendingVerifyEmail');
    
    if (!(isVerifyPage && pendingEmail)) {
      window.location.replace(ROUTES.login);
    }
  }
})();
