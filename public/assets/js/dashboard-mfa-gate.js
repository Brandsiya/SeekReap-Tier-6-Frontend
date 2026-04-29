/**
 * SeekReap dashboard-mfa-gate.js
 * Gates dashboard access behind Supabase TOTP MFA (AAL2).
 * Usage: SeekReapMFA.init()  then define window.onMfaPass = function(){...}
 */
window.SeekReapMFA = (function () {
  'use strict';
  var _client = null;
  var _state  = { factorId: null };

  var CSS = '#sr-mfa-overlay{position:fixed;inset:0;z-index:9999;' +
    'background:rgba(10,10,12,.88);display:flex;align-items:center;justify-content:center;' +
    'font-family:"DM Sans",system-ui,sans-serif;}' +
    '#sr-mfa-box{background:#111113;border:1px solid #2a2a2a;border-radius:10px;' +
    'width:min(420px,94vw);padding:32px 28px;box-shadow:0 24px 60px rgba(0,0,0,.7);}' +
    '#sr-mfa-box h2{font-size:1.3rem;font-weight:600;color:#FAFAF8;margin:0 0 6px;' +
    'display:flex;align-items:center;gap:10px;}' +
    '#sr-mfa-box p{color:#9a9a9a;font-size:.88rem;margin:0 0 20px;line-height:1.55;}' +
    '.sr-mfa-input{width:100%;box-sizing:border-box;background:#0e0e10;border:1px solid #333;' +
    'border-radius:5px;color:#FAFAF8;font-size:1.6rem;letter-spacing:.35em;' +
    'padding:13px 16px;text-align:center;outline:none;transition:border-color .2s;}' +
    '.sr-mfa-input:focus{border-color:#C9993A;}' +
    '.sr-mfa-btn{margin-top:14px;width:100%;padding:12px;border-radius:5px;' +
    'background:#C9993A;border:none;color:#0e0e10;font-size:.92rem;font-weight:700;' +
    'cursor:pointer;transition:opacity .2s;}' +
    '.sr-mfa-btn:disabled{opacity:.45;cursor:not-allowed;}' +
    '.sr-mfa-err{color:#E05555;font-size:.82rem;margin-top:8px;min-height:18px;}' +
    '#sr-mfa-qr{text-align:center;margin:18px 0;}' +
    '#sr-mfa-qr img{width:170px;height:170px;border-radius:4px;background:#fff;padding:4px;}' +
    '#sr-mfa-secret{background:#0e0e10;border:1px solid #2a2a2a;border-radius:4px;' +
    'padding:7px 12px;font-family:monospace;font-size:.8rem;color:#C9993A;' +
    'word-break:break-all;text-align:center;margin-top:8px;}';

  function _injectStyles() {
    if (document.getElementById('sr-mfa-styles')) return;
    var s = document.createElement('style');
    s.id = 'sr-mfa-styles'; s.textContent = CSS;
    document.head.appendChild(s);
  }

  function _createModal(html) {
    var old = document.getElementById('sr-mfa-overlay');
    if (old) old.remove();
    var overlay = document.createElement('div'); overlay.id = 'sr-mfa-overlay';
    var box = document.createElement('div'); box.id = 'sr-mfa-box';
    box.innerHTML = html; overlay.appendChild(box); document.body.appendChild(overlay);
  }

  function _setErr(msg) {
    var el = document.getElementById('sr-mfa-err'); if (el) el.textContent = msg || '';
  }

  function _showVerify() {
    _createModal(
      '<h2>🔐 Two-Factor Verification</h2>' +
      '<p>Enter the 6-digit code from your authenticator app to access the dashboard.</p>' +
      '<input id="sr-mfa-code" class="sr-mfa-input" type="text" inputmode="numeric" ' +
      'maxlength="6" placeholder="000000" autocomplete="one-time-code">' +
      '<button id="sr-mfa-verify-btn" class="sr-mfa-btn" disabled>Verify</button>' +
      '<div id="sr-mfa-err" class="sr-mfa-err"></div>'
    );
    var input = document.getElementById('sr-mfa-code');
    var btn   = document.getElementById('sr-mfa-verify-btn');
    input.focus();
    input.addEventListener('input', function () {
      btn.disabled = input.value.replace(/\D/g,'').length !== 6;
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !btn.disabled) btn.click();
    });
    btn.addEventListener('click', function () {
      var code = input.value.replace(/\D/g,'');
      if (code.length !== 6) return;
      btn.disabled = true; btn.textContent = 'Verifying…';
      _verify(code);
    });
  }

  async function _verify(code) {
    try {
      var cr = await _client.auth.mfa.challenge({ factorId: _state.factorId });
      if (cr.error) throw cr.error;
      var vr = await _client.auth.mfa.verify({ factorId: _state.factorId,
        challengeId: cr.data.id, code: code });
      if (vr.error) throw vr.error;
      var old = document.getElementById('sr-mfa-overlay'); if (old) old.remove();
      if (typeof window.onMfaPass === 'function') window.onMfaPass();
    } catch (err) {
      _setErr(err.message || 'Invalid code — try again.');
      var btn = document.getElementById('sr-mfa-verify-btn');
      if (btn) { btn.disabled = false; btn.textContent = 'Verify'; }
    }
  }

  async function _showEnroll() {
    try {
      var res = await _client.auth.mfa.enroll({ factorType: 'totp', friendlyName: 'SeekReap Dashboard' });
      if (res.error) throw res.error;
      _state.factorId = res.data.id;
      var secret = res.data.totp.secret;
      var qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=170x170&data=' +
                  encodeURIComponent(res.data.totp.uri);
      _createModal(
        '<h2>🔐 Set Up Authenticator</h2>' +
        '<p>Scan the QR code with Google Authenticator or Authy, then enter the 6-digit code.</p>' +
        '<div id="sr-mfa-qr"><img src="' + qrUrl + '" alt="TOTP QR"></div>' +
        '<div id="sr-mfa-secret">' + secret + '</div>' +
        '<p style="font-size:.76rem;color:#555;margin:8px 0 0">Can\'t scan? Enter the key above manually.</p>' +
        '<input id="sr-mfa-code" class="sr-mfa-input" type="text" inputmode="numeric" ' +
        'maxlength="6" placeholder="000000" style="margin-top:18px;">' +
        '<button id="sr-mfa-verify-btn" class="sr-mfa-btn" disabled>Confirm &amp; Enable</button>' +
        '<div id="sr-mfa-err" class="sr-mfa-err"></div>'
      );
      var input = document.getElementById('sr-mfa-code');
      var btn   = document.getElementById('sr-mfa-verify-btn');
      input.focus();
      input.addEventListener('input', function () {
        btn.disabled = input.value.replace(/\D/g,'').length !== 6;
      });
      btn.addEventListener('click', function () {
        var code = input.value.replace(/\D/g,'');
        if (code.length !== 6) return;
        btn.disabled = true; btn.textContent = 'Confirming…';
        _verify(code);
      });
    } catch (err) {
      console.error('MFA enroll error:', err);
    }
  }

  async function init() {
    _injectStyles(); if (document.getElementById('sr-mfa-overlay')) return;
    var waited = 0;
    while (!window.supabaseClient && waited < 5000) {
      await new Promise(function(r){ setTimeout(r, 100); }); waited += 100;
    }
    _client = window.supabaseClient;
    if (!_client) { console.error('SeekReapMFA: supabaseClient not found'); return; }
    var sessionCheck = await _client.auth.getSession();
    if (!sessionCheck || !sessionCheck.data || !sessionCheck.data.session) {
      console.error("No session for MFA");
      return;
    }

    var aalRes = await _client.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aalRes.error) { console.error('AAL check failed:', aalRes.error); return; }
    var current = aalRes.data.currentLevel;
    var next    = aalRes.data.nextLevel;
    if (current === 'aal2') {
      if (typeof window.onMfaPass === 'function') window.onMfaPass(); return;
    }
    if (next === 'aal2') {
      var listRes = await _client.auth.mfa.listFactors();
      var totp = listRes.data && listRes.data.totp && listRes.data.totp[0];
      if (totp) { _state.factorId = totp.id; _showVerify(); }
      else { _showEnroll(); }
    } else {
      _showEnroll();
    }
  }
  return { init: init };
})();
