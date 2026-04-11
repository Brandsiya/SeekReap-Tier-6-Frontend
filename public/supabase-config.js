const SUPABASE_URL     = 'https://hpbxgcszingxpgogctge.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwYnhnY3N6aW5neHBnb2djdGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MTEwMzAsImV4cCI6MjA5MDI4NzAzMH0.wzrn2Yvpfcuzrq8JZLBLv927QHM2BpSQVfmaGHrLI6E';

(function initSupabase() {
  function tryInit() {
    if (typeof supabase !== 'undefined' && typeof supabase.createClient === 'function') {
      window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      console.log('✅ Supabase ready');
      document.dispatchEvent(new CustomEvent('supabaseReady'));
    } else {
      setTimeout(tryInit, 50);
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryInit);
  } else {
    tryInit();
  }
})();
