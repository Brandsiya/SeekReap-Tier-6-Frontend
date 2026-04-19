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

// ── INVITE TOKEN HANDLING ─────────────────────────────────────────────────────
const TIER4_URL = 'https://seekreap-tier-4-dev.fly.dev';
let currentInvite = null;

async function fetchInviteByToken(token) {
  try {
    const response = await fetch(`${TIER4_URL}/api/invite?token=${encodeURIComponent(token)}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Invalid invite');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch invite:', error);
    return null;
  }
}

async function prefillSignupWithInvite(invite) {
  if (!invite || !invite.valid) return;
  
  // Prefill all fields
  const fullNameInput = document.getElementById('signup-fullname');
  const titleSelect = document.getElementById('signup-title');
  const genderSelect = document.getElementById('signup-gender');
  const artisticNameInput = document.getElementById('signup-artisticname');
  const ownershipTitleInput = document.getElementById('signup-ownershiptitle');
  const ownershipPctInput = document.getElementById('signup-ownershippct');
  const countrySelect = document.getElementById('signup-country');
  const emailInput = document.getElementById('signup-email');
  
  if (fullNameInput && invite.full_name) fullNameInput.value = invite.full_name;
  if (titleSelect && invite.title) titleSelect.value = invite.title;
  if (genderSelect && invite.gender) genderSelect.value = invite.gender;
  if (artisticNameInput && invite.artistic_name) artisticNameInput.value = invite.artistic_name;
  if (ownershipTitleInput && invite.ownership_title) ownershipTitleInput.value = invite.ownership_title;
  if (ownershipPctInput && invite.split) ownershipPctInput.value = invite.split;
  if (countrySelect && invite.country) countrySelect.value = invite.country;
  if (emailInput && invite.email) {
    emailInput.value = invite.email;
    emailInput.disabled = true;
    emailInput.style.opacity = '0.6';
    emailInput.title = 'Email is locked from invitation';
  }
  
  // Store invite token for signup completion
  const urlParams = new URLSearchParams(window.location.search);
  const inviteToken = urlParams.get('invite_token');
  if (inviteToken) {
    sessionStorage.setItem('pendingInviteToken', inviteToken);
    sessionStorage.setItem('pendingInviteData', JSON.stringify(invite));
  }
}

// Check for invite token on page load
document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const inviteToken = urlParams.get('invite_token');
  
  if (inviteToken) {
    console.log('🔑 Invite token detected:', inviteToken.substring(0, 16) + '...');
    const invite = await fetchInviteByToken(inviteToken);
    
    if (invite && invite.valid) {
      currentInvite = invite;
      await prefillSignupWithInvite(invite);
      // Switch to signup tab
      if (typeof switchTab === 'function') {
        switchTab('signup');
      }
      showMsg('🎉 You\'ve been invited to collaborate! Please complete your registration.', 'info');
    } else {
      showMsg('Invalid or expired invitation link. Please contact the person who invited you.', 'error');
    }
  }
});

// After signup, accept the invite
async function acceptInviteAfterSignup(userId, userEmail, token) {
  try {
    const response = await fetch(`${TIER4_URL}/api/invite/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: token,
        user_id: userId,
        email: userEmail
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) throw new Error(data.error);
    
    console.log('✅ Invite accepted:', data);
    sessionStorage.removeItem('pendingInviteToken');
    sessionStorage.removeItem('pendingInviteData');
    
    return data;
  } catch (error) {
    console.error('Failed to accept invite:', error);
    throw error;
  }
}

// Hook into signup completion
const originalHandleSignUp = window.handleSignUp || function() {};
window.handleSignUp = async function() {
  const result = await originalHandleSignUp();
  
  // Check if we have a pending invite
  const pendingToken = sessionStorage.getItem('pendingInviteToken');
  const pendingData = sessionStorage.getItem('pendingInviteData');
  
  if (pendingToken && pendingData && window.currentUser) {
    const inviteData = JSON.parse(pendingData);
    setTimeout(async () => {
      try {
        await acceptInviteAfterSignup(
          window.currentUser.id,
          window.currentUser.email,
          pendingToken
        );
        showMsg('✅ Invitation accepted! You are now a collaborator.', 'success');
      } catch (error) {
        console.error('Failed to auto-accept invite:', error);
      }
    }, 2000);
  }
  
  return result;
};
