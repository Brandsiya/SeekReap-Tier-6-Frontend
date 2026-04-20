// auth-guard.js — resolves currentUser then dispatches 'authReady'.
// Uses onAuthStateChange which fires after Supabase restores session from
// localStorage (and after processing #access_token from email confirmation).
// NEVER redirects — each page handles its own routing.
(async function authGuard() {

  // 1. Wait for supabaseClient to exist
  let sb = window.supabaseClient;
  if (!sb) {
    await new Promise(resolve => {
      const iv = setInterval(() => {
        if (window.supabaseClient) { clearInterval(iv); sb = window.supabaseClient; resolve(); }
      }, 50);
      // Hard timeout so we never hang
      setTimeout(() => { clearInterval(iv); resolve(); }, 6000);
    });
  }

  if (!sb) {
    window.currentUser = null;
    document.dispatchEvent(new CustomEvent('authReady', { detail: { user: null } }));
    console.warn('[auth-guard] Supabase client never became available');
    return;
  }

  // 2. onAuthStateChange fires with the INITIAL_SESSION event after Supabase
  //    restores from localStorage — this is more reliable than getSession()
  //    because createClient() is async internally.
  await new Promise(resolve => {
    let settled = false;

    const settle = (user) => {
      if (settled) return;
      settled = true;
      window.currentUser = user ?? null;
      try { sub && sub.unsubscribe(); } catch (_) {}
      resolve();
    };

    const { data: { subscription: sub } } = sb.auth.onAuthStateChange((_event, session) => {
      settle(session?.user ?? null);
    });

    // Fallback: if onAuthStateChange never fires (shouldn't happen), use getSession
    setTimeout(async () => {
      if (settled) return;
      try {
        const { data: { session } } = await sb.auth.getSession();
        settle(session?.user ?? null);
      } catch (e) {
        console.warn('[auth-guard] getSession fallback error:', e.message);
        settle(null);
      }
    }, 4000);
  });

  document.dispatchEvent(new CustomEvent('authReady', {
    detail: { user: window.currentUser }
  }));
  console.log('[auth-guard] authReady →', window.currentUser?.email ?? 'no session');

})();
