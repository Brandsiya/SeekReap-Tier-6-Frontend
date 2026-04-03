// Supabase Configuration
// Your actual credentials from Supabase project: hpbxczsxngxgpgogctge

const SUPABASE_URL = 'https://hpbxczsxngxgpgogctge.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_s9We9vq9yOYpao7t0Tzm8g_7nYTzZnf';  // ⚠️ REPLACE WITH YOUR PUBLISHABLE KEY

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('✅ Supabase initialized');
console.log('   URL:', SUPABASE_URL);
console.log('   Project ID: hpbxczsxngxgpgogctge');

// Store user session
window.currentUser = null;

// Listen for auth changes
supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth event:', event);
    if (session) {
        window.currentUser = session.user;
        localStorage.setItem('supabase_user', JSON.stringify(session.user));
        localStorage.setItem('supabase_session', JSON.stringify(session));
    } else {
        window.currentUser = null;
        localStorage.removeItem('supabase_user');
        localStorage.removeItem('supabase_session');
    }
});
