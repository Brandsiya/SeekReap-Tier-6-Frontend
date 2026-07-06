// ── helpers ───────────────────────────────────────────────────────────────────
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
  const icon = { error:'exclamation-circle', success:'check-circle', info:'info-circle' }[type] || 'info-circle';
  el.innerHTML = `<div class="msg msg-${type}"><i class="fas fa-${icon}"></i><span>${esc(text)}</span></div>`;
}
function clearMsg() { const el = document.getElementById('message-container'); if (el) el.innerHTML = ''; }

function setBusy(id, busy) {
  const btn = document.getElementById(id);
  if (!btn) return;
  btn.disabled      = busy;
  btn.style.opacity = busy ? '0.6' : '1';
  btn.style.cursor  = busy ? 'not-allowed' : '';
}

function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function raw(id)  { return document.getElementById(id)?.value ?? ''; }
function trim(id) { return raw(id).trim(); }

// Same-origin redirect from ?redirect= param
function getRedirectTarget(defaultPath) {
  const params = new URLSearchParams(window.location.search);
  const r = params.get('redirect');
  if (r) {
    try {
      const url = new URL(decodeURIComponent(r), window.location.origin);
      if (url.origin === window.location.origin) return url.pathname + url.search;
    } catch (_) {}
  }
  return defaultPath;
}

// ── signup field validation ───────────────────────────────────────────────────
function validateSignupFields() {
  const email          = trim('signup-email');
  const password       = raw('signup-password');
  const confirm        = raw('signup-confirm');
  const terms          = document.getElementById('accept-terms')?.checked;

  if (!email)   return { valid: false, msg: 'Please enter your email address.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { valid: false, msg: 'Please enter a valid email.' };
  if (password.length < 8) return { valid: false, msg: 'Password must be at least 8 characters.' };
  if (password !== confirm) return { valid: false, msg: 'Passwords do not match.' };
  if (!terms) return { valid: false, msg: 'Please accept the Terms of Service and Privacy Policy.' };

  return { valid: true, data: { email, password } };
}

// ── sign in → certification_portal.html ──────────────────────────────────────
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
      window.location.href = '/email_verify_pending.html';
      return;
    }

    // After sign-in: go to certification portal (or ?redirect= if set)
    window.location.href = getRedirectTarget('/certification_portal.html');

  } catch (err) {
    const msg = /invalid login|invalid credentials/i.test(err.message)
      ? 'Incorrect email or password. Please try again.'
      : err.message;
    showMsg(msg);
  } finally {
    setBusy('signin-btn', false);
  }
}

// ── sign up → certification_portal.html (or email verify if confirmation required) ───────
async function handleSignUp() {
  clearMsg();
  const validation = validateSignupFields();
  if (!validation.valid) return showMsg(validation.msg);

  const { email, password } = validation.data;

  setBusy('signup-btn', true);
  try {
    const sb = await getClient();
    const { data, error } = await sb.auth.signUp({
      email,
      password,
      options: {
        // After email confirmation link click, land on dashboard
        emailRedirectTo: 'https://seekreap-frontend.onrender.com/certification_portal.html',
      },
    });
    if (error) throw error;

    sessionStorage.setItem('pendingVerifyEmail', email);

    // If Supabase auto-confirmed (email confirmation disabled in project settings)
    if (data.user?.email_confirmed_at) {
      window.location.href = '/certification_portal.html';
    } else {
      window.location.href = '/email_verify_pending.html';
    }

  } catch (err) {
    const msg = /already registered/i.test(err.message)
      ? 'An account with this email already exists. Try signing in.'
      : err.message;
    showMsg(msg);
  } finally {
    setBusy('signup-btn', false);
  }
}

// ── ui helpers ────────────────────────────────────────────────────────────────
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

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('signin-btn')?.addEventListener('click', handleSignIn);
  document.getElementById('signup-btn')?.addEventListener('click', handleSignUp);
  ['signin-email', 'signin-password'].forEach(id => {
    document.getElementById(id)?.addEventListener('keydown', e => { if (e.key === 'Enter') handleSignIn(); });
  });
});
