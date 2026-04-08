const SUPABASE_URL = 'https://hpbxczsxngxgpgogctge.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwYnhnY3N6aW5neHBnb2djdGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MTEwMzAsImV4cCI6MjA5MDI4NzAzMH0.wzrn2Yvpfcuzrq8JZLBLv927QHM2BpSQVfmaGHrLI6E';

if (typeof window.supabase === 'undefined' || typeof window.supabase.createClient === 'undefined') {
    console.error("❌ Supabase SDK not loaded!");
} else {
    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log("✅ Supabase ready:", window.supabaseClient);
}
