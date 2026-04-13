// ── helpers ──────────────────────────────────────────────────────────────────
function getClient(ms = 6000) {
  if (window.supabaseClient) return Promise.resolve(window.supabaseClient);
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('Auth system unavailable. Refresh and try again.')), ms);
    document.addEventListener('supabaseReady', () => { clearTimeout(t); resolve(window.supabaseClient); }, { once: true });
  });
}

function showMsg(text, type = 'error') {
  const el = document.getElementById('message-container');
  if (!el) return;
  const icon = { error: 'exclamation-circle', success: 'check-circle', info: 'info-circle' }[type] || 'info-circle';
  el.innerHTML = `<div class="msg msg-${type}"><i class="fas fa-${icon}"></i><span>${esc(text)}</span></div>`;
}
function clearMsg() { const el = document.getElementById('message-container'); if (el) el.innerHTML = ''; }

function setBusy(id, busy) {
  const btn = document.getElementById(id);
  if (!btn) return;
  btn.disabled = busy;
  btn.style.opacity = busy ? '0.6' : '1';
  btn.style.cursor  = busy ? 'not-allowed' : '';
}

function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function raw(id)  { return document.getElementById(id)?.value ?? ''; }
function trim(id) { return raw(id).trim(); }

// ── sign in ──────────────────────────────────────────────────────────────────
async function handleSignIn() {
  clearMsg();
  const email    = trim('signin-email');
  const password = raw('signin-password');
  if (!email || !password) return showMsg('Please enter your email and password.');

  setBusy('signin-btn', true);
  try {
    const sb = await getClient();
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;

    if (!data.user.email_confirmed_at) {
      sessionStorage.setItem('pendingVerifyEmail', email);
      window.location.href = ROUTES.verify;
      return;
    }
    window.location.href = ROUTES.home;
  } catch (err) {
    const msg = /invalid login|invalid credentials/i.test(err.message)
      ? 'Incorrect email or password. Please try again.'
      : err.message;
    showMsg(msg);
  } finally {
    setBusy('signin-btn', false);
  }
}

// ── sign up ──────────────────────────────────────────────────────────────────
async function handleSignUp() {
  clearMsg();
  const name     = trim('signup-name');
  const email    = trim('signup-email');
  const password = raw('signup-password');
  const confirm  = raw('signup-confirm');
  const terms    = document.getElementById('accept-terms')?.checked;

  if (!name)           return showMsg('Please enter your full name.');
  if (!email)          return showMsg('Please enter your email address.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showMsg('Please enter a valid email address.');
  if (password.length < 8) return showMsg('Password must be at least 8 characters.');
  if (password !== confirm)  return showMsg('Passwords do not match.');
  if (!terms)          return showMsg('Please accept the Terms of Service and Privacy Policy.');

  setBusy('signup-btn', true);
  try {
    const sb = await getClient();
    const { data, error } = await sb.auth.signUp({
      email,
      password,
      options: { data: { full_name: name }, emailRedirectTo: 'https://seekreap-frontend.onrender.com/certification_portal.html' }
    });
    if (error) throw error;

    // signUp with email confirmation enabled returns no session yet
    sessionStorage.setItem('pendingVerifyEmail', email);
    window.location.href = ROUTES.verify;
  } catch (err) {
    const msg = /already registered/i.test(err.message)
      ? 'An account with this email already exists. Try signing in.'
      : err.message;
    showMsg(msg);
  } finally {
    setBusy('signup-btn', false);
  }
}

// ── tab switching ─────────────────────────────────────────────────────────────
function switchTab(tab) {
  clearMsg();
  const isSignin = tab === 'signin';
  document.getElementById('signin-tab').classList.toggle('active', isSignin);
  document.getElementById('signup-tab').classList.toggle('active', !isSignin);
  document.getElementById('signin-form').classList.toggle('hidden', !isSignin);
  document.getElementById('signup-form').classList.toggle('hidden', isSignin);
}

function togglePassword(inputId, icon) {
  const input = document.getElementById(inputId);
  if (!input) return;
  input.type = input.type === 'password' ? 'text' : 'password';
  icon.classList.toggle('fa-eye');
  icon.classList.toggle('fa-eye-slash');
}

// ── wire events ───────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('signin-btn')?.addEventListener('click', handleSignIn);
  document.getElementById('signup-btn')?.addEventListener('click', handleSignUp);

  // Enter-key submit on sign-in fields
  ['signin-email', 'signin-password'].forEach(id => {
    document.getElementById(id)?.addEventListener('keydown', e => {
      if (e.key === 'Enter') handleSignIn();
    });
  });
});
