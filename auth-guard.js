// Auth Guard - Protects pages that require authentication
(async function() {
    console.log('🔐 Auth guard checking...');
    
    // Wait for Supabase to be ready
    if (typeof supabase === 'undefined') {
        console.error('Supabase not loaded!');
        return;
    }
    
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
        console.log('❌ No session found, redirecting to login');
        window.location.href = '/supabase-auth.html';
    } else {
        console.log('✅ User authenticated:', session.user.email);
        
        // Store user info for the page
        window.currentUser = session.user;
        
        // Update UI with user info if elements exist
        const userEmailEl = document.getElementById('userEmail');
        if (userEmailEl) {
            userEmailEl.textContent = session.user.email;
        }
        
        const userNameEl = document.getElementById('userName');
        if (userNameEl) {
            userNameEl.textContent = session.user.user_metadata?.full_name || session.user.email.split('@')[0];
        }
    }
})();
