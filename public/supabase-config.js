// Supabase Configuration - SeekReap Tier 6
const SUPABASE_URL = 'https://hpbxczsxngxgpgogctge.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_s9We9vq9yOYpao7t0Tzm8g_7nYTzZnf'; 

// Initialize and ensure it's global
if (typeof window.supabase.createClient === 'undefined') {
    console.error("❌ Supabase SDK not loaded! Check script tags.");
} else {
    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log("✅ Supabase Client Globalized");
}
