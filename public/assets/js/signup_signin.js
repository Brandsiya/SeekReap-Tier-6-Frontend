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

// Validate all required signup fields
function validateSignupFields() {
  const fullName = trim('signup-fullname');
  const title = trim('signup-title');
  const gender = trim('signup-gender');
  const artisticName = trim('signup-artisticname');
  const ownershipTitle = trim('signup-ownershiptitle');
  const ownershipPct = trim('signup-ownershippct');
  const country = trim('signup-country');
  const email = trim('signup-email');
  const password = raw('signup-password');
  const confirm = raw('signup-confirm');
  const terms = document.getElementById('accept-terms')?.checked;

  if (!fullName) return { valid: false, msg: 'Please enter your full name as on ID.' };
  if (!title) return { valid: false, msg: 'Please select your title.' };
  if (!gender) return { valid: false, msg: 'Please select your gender.' };
  if (!artisticName) return { valid: false, msg: 'Please enter your artistic name.' };
  if (!ownershipTitle) return { valid: false, msg: 'Please enter your ownership title (e.g., Co-author, Sole Creator).' };
  if (!ownershipPct) return { valid: false, msg: 'Please enter your ownership percentage.' };
  const pctNum = parseInt(ownershipPct);
  if (isNaN(pctNum) || pctNum < 0 || pctNum > 100) return { valid: false, msg: 'Ownership percentage must be between 0 and 100.' };
  if (!country) return { valid: false, msg: 'Please select your country.' };
  if (!email) return { valid: false, msg: 'Please enter your email address.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { valid: false, msg: 'Please enter a valid email address.' };
  if (password.length < 8) return { valid: false, msg: 'Password must be at least 8 characters.' };
  if (password !== confirm) return { valid: false, msg: 'Passwords do not match.' };
  if (!terms) return { valid: false, msg: 'Please accept the Terms of Service and Privacy Policy.' };

  return { valid: true, data: {
    fullName, title, gender, artisticName, ownershipTitle, ownershipPct: pctNum, country, email, password
  } };
}

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
    const intent = localStorage.getItem('selectedPlan'); 
    if (['pro', 'elite', 'payg'].includes(intent)) { 
      window.location.href = '/checkout.html?plan=' + intent; 
    } else { 
      window.location.href = ROUTES.home; 
    }
  } catch (err) {
    const msg = /invalid login|invalid credentials/i.test(err.message)
      ? 'Incorrect email or password. Please try again.'
      : err.message;
    showMsg(msg);
  } finally {
    setBusy('signin-btn', false);
  }
}

// ── sign up with profile metadata ────────────────────────────────────────────
async function handleSignUp() {
  clearMsg();
  const validation = validateSignupFields();
  if (!validation.valid) return showMsg(validation.msg);

  const { fullName, title, gender, artisticName, ownershipTitle, ownershipPct, country, email, password } = validation.data;

  setBusy('signup-btn', true);
  try {
    const sb = await getClient();
    const { data, error } = await sb.auth.signUp({
      email,
      password,
      options: { 
        data: { 
          full_name: fullName,
          title: title,
          gender: gender,
          artistic_name: artisticName,
          ownership_title: ownershipTitle,
          ownership_percentage: ownershipPct,
          country: country,
          email: email
        }, 
        emailRedirectTo: 'https://seekreap-frontend.onrender.com/certification_portal.html' 
      }
    });
    if (error) throw error;

    // Store profile data for later use
    sessionStorage.setItem('pendingVerifyEmail', email);
    sessionStorage.setItem('pendingUserProfile', JSON.stringify({
      fullName, title, gender, artisticName, ownershipTitle, ownershipPct, country
    }));
    
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
