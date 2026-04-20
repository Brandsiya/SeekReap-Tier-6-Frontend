// auth-guard.js — sets window.currentUser then dispatches 'authReady'.
// NEVER redirects. Let each page decide what to do with the auth result.
(async function authGuard() {
  // Wait for supabaseClient
  let sb = window.supabaseClient;
  if (!sb) {
    await new Promise(resolve => {
      const iv = setInterval(() => {
        if (window.supabaseClient) { clearInterval(iv); sb = window.supabaseClient; resolve(); }
      }, 50);
    });
  }

  try {
    const { data: { session } } = await sb.auth.getSession();
    window.currentUser = session?.user ?? null;
  } catch (e) {
    console.warn('auth-guard getSession error:', e.message);
    window.currentUser = null;
  }

  // Always dispatch — pages waiting on this event need it whether user is set or null
  document.dispatchEvent(new CustomEvent('authReady', {
    detail: { user: window.currentUser }
  }));

  console.log('authReady dispatched, user:', window.currentUser?.email ?? 'none');
})();
