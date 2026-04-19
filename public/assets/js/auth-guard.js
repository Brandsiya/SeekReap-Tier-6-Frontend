// SIMPLIFIED AUTH GUARD - No aggressive redirects
(async function authGuard() {
  console.log("🔐 Auth guard starting...");
  
  // Wait for Supabase client
  let sb = window.supabaseClient;
  if (!sb) {
    console.log("⏳ Waiting for Supabase client...");
    await new Promise((resolve) => {
      const check = setInterval(() => {
        if (window.supabaseClient) {
          clearInterval(check);
          sb = window.supabaseClient;
          console.log("✅ Supabase client ready");
          resolve();
        }
      }, 100);
    });
  }
  
  // Get session
  const { data: { session }, error } = await sb.auth.getSession();
  console.log("Session exists:", !!session);
  
  if (session && session.user) {
    console.log("User:", session.user.email);
    console.log("Email confirmed:", session.user.email_confirmed_at);
    window.currentUser = session.user;
    
    // Dispatch event for other scripts
    document.dispatchEvent(new CustomEvent("authReady", { 
      detail: { user: session.user } 
    }));
  } else {
    console.log("No session found");
    window.currentUser = null;
  }
  
  // DO NOT REDIRECT - Let the page handle its own auth requirements
  // The certification portal should check window.currentUser and redirect only when needed
})();
