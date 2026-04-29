/**
 * SeekReap cert-api-auth-injector.js
 * Injects Authorization: Bearer <supabase_token> into every fetch()
 * call that targets TIER4_URL. Load AFTER auth-guard.js and BEFORE
 * certification_portal.js.
 */
(function () {
  'use strict';
  var _origFetch = window.fetch.bind(window);
  var _token = null;

  function _setToken(session) {
    _token = session && session.access_token ? session.access_token : null;
  }

  function _initToken() {
    var client = window.supabaseClient;
    if (!client) { setTimeout(_initToken, 200); return; }
    client.auth.getSession().then(function (r) {
      _setToken(r && r.data && r.data.session);
    });
    client.auth.onAuthStateChange(function (_, session) {
      _setToken(session);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _initToken);
  } else {
    _initToken();
  }

  window.fetch = function (url, options) {
    var tier4 = (typeof API_CONFIG !== 'undefined' && API_CONFIG.TIER4_URL)
    ? API_CONFIG.TIER4_URL
    : ((typeof TIER4_URL !== 'undefined') ? TIER4_URL : '');
    if (tier4 && typeof url === 'string' && url.indexOf(tier4) === 0 && _token) {
      options = options ? Object.assign({}, options) : {};
      var headers = Object.assign({}, options.headers || {});
      if (!headers['Authorization'] && !headers['authorization']) {
        headers['Authorization'] = 'Bearer ' + _token;
      }
      options.headers = headers;
    }
    return _origFetch(url, options);
  };
})();
