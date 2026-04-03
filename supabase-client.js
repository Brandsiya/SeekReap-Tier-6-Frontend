// Supabase Client Configuration
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';  // Replace with your URL
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';  // Replace with your anon key

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('✅ Supabase client initialized');
