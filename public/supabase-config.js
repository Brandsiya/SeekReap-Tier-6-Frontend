const SUPABASE_URL = 'https://hpbxgcszingxpgogctge.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwYnhnY3N6aW5neHBnb2djdGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MTEwMzAsImV4cCI6MjA5MDI4NzAzMH0.wzrn2Yvpfcuzrq8JZLBLv927QHM2BpSQVfmaGHrLI6E';

window.addEventListener('load', function() {
    if (typeof supabase !== 'undefined' && supabase.createClient) {
        window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log("✅ Supabase ready");
    } else {
        console.error("❌ Supabase SDK failed to load");
        alert("Auth system failed to load. Please refresh.");
    }
});
