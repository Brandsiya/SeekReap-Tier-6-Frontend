// supabase-client.js — loaded by pages that use window.supabaseClient directly
// Note: supabase-config.js is the canonical initializer. This file is a
// compatibility shim for any page that loads it independently.
(function() {
  function tryInit() {
    if (typeof supabase !== 'undefined' && typeof supabase.createClient === 'function') {
      if (!window.supabaseClient) {
        const url  = 'https://hpbxgcszingxpgogctge.supabase.co';
        const key  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwYnhnY3N6aW5neHBnb2djdGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MTEwMzAsImV4cCI6MjA5MDI4NzAzMH0.wzrn2Yvpfcuzrq8JZLBLv927QHM2BpSQVfmaGHrLI6E';
        window.supabaseClient = supabase.createClient(url, key);
        console.log('✅ supabase-client.js: client ready');
        document.dispatchEvent(new CustomEvent('supabaseReady'));
      }
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
