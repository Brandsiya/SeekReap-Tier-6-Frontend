(async function authGuard() {
  function waitForClient(ms = 8000) {
    if (window.supabaseClient) return Promise.resolve(window.supabaseClient);
    return new Promise((resolve, reject) => {
      const t = setTimeout(() => reject(new Error("Supabase timeout")), ms);
      document.addEventListener(
        "supabaseReady",
        () => {
          clearTimeout(t);
          resolve(window.supabaseClient);
        },
        { once: true }
      );
    });
  }

  const ROUTES = window.ROUTES || {
    login: "/signup_signin.html",
    verify: "/email_verify_pending.html",
    home: "/certification_portal.html",
  };

  const isVerifyPage = location.pathname.includes("email_verify_pending.html");
  const isLoginPage = location.pathname.includes("signup_signin.html");
  const isCertPage = location.pathname.includes("certification_portal.html");

  // CRITICAL FIX: Don't redirect if we just came from signup (has sessionStorage flag)
  const justSignedUp = sessionStorage.getItem('justSignedUp');
  const justSignedIn = sessionStorage.getItem('justSignedIn');
  
  // Clear these flags after using them
  if (justSignedUp) {
    sessionStorage.removeItem('justSignedUp');
  }
  if (justSignedIn) {
    sessionStorage.removeItem('justSignedIn');
  }

  let sb = await waitForClient();

  // ─────────────────────────────────────────────
  // STEP 1: WAIT FOR SUPABASE TO FINISH HYDRATION
  // ─────────────────────────────────────────────
  let session = null;

  // first attempt
  let res = await sb.auth.getSession();
  session = res.data.session;

  // email callback case (critical fix)
  const isEmailFlow = location.hash.includes("access_token");

  if (!session && isEmailFlow) {
    // Retry up to 5 times for email confirmation
    for (let i = 0; i < 5; i++) {
      await new Promise((r) => setTimeout(r, 1000));
      res = await sb.auth.getSession();
      session = res.data.session;
      if (session) break;
    }
  }

  // ─────────────────────────────────────────────
  // STEP 2: AUTH STATE LISTENER (SOURCE OF TRUTH)
  // ─────────────────────────────────────────────
  sb.auth.onAuthStateChange((_event, newSession) => {
    if (newSession?.user) {
      window.currentUser = newSession.user;
      sessionStorage.removeItem("pendingVerifyEmail");
      
      // Clear any redirect flags
      sessionStorage.removeItem('justSignedUp');
      sessionStorage.removeItem('justSignedIn');

      const emailEl = document.getElementById("userEmail");
      if (emailEl) emailEl.textContent = newSession.user.email;

      const nameEl = document.getElementById("userName");
      if (nameEl) {
        const meta = newSession.user.user_metadata || {};
        nameEl.textContent =
          meta.full_name || newSession.user.email.split("@")[0];
      }

      document.dispatchEvent(
        new CustomEvent("authReady", { detail: { user: newSession.user } })
      );
      
      // CRITICAL: If we're on login page and just got session, redirect to intended page
      if (isLoginPage && !justSignedUp && !justSignedIn) {
        const redirectTo = sessionStorage.getItem('redirectAfterLogin') || ROUTES.home;
        sessionStorage.removeItem('redirectAfterLogin');
        window.location.href = redirectTo;
      }
    }
  });

  // ─────────────────────────────────────────────
  // STEP 3: ROUTING LOGIC (ONLY AFTER STABLE CHECK)
  // ─────────────────────────────────────────────

  // CRITICAL FIX: If we just signed up/in, allow the page to load without redirect
  if (justSignedUp || justSignedIn) {
    // Don't redirect - let the page render
    if (session?.user) {
      window.currentUser = session.user;
      document.dispatchEvent(
        new CustomEvent("authReady", { detail: { user: session.user } })
      );
    }
    return;
  }

  if (!session) {
    if (isEmailFlow) {
      // DO NOT REDIRECT — wait for auth event to resolve
      return;
    }

    // Store the current page to redirect back after login
    if (!isLoginPage && !isVerifyPage) {
      sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
      location.replace(ROUTES.login);
    }
    return;
  }

  if (!session.user.email_confirmed_at) {
    sessionStorage.setItem("pendingVerifyEmail", session.user.email);

    if (!isVerifyPage) {
      location.replace(ROUTES.verify);
    }
    return;
  }

  // ─────────────────────────────────────────────
  // STEP 4: SUCCESS STATE
  // ─────────────────────────────────────────────
  window.currentUser = session.user;
  sessionStorage.removeItem("pendingVerifyEmail");

  const emailEl = document.getElementById("userEmail");
  if (emailEl) emailEl.textContent = session.user.email;

  const nameEl = document.getElementById("userName");
  if (nameEl) {
    const meta = session.user.user_metadata || {};
    nameEl.textContent =
      meta.full_name || session.user.email.split("@")[0];
  }

  document.dispatchEvent(
    new CustomEvent("authReady", { detail: { user: session.user } })
  );
})();
