"""
patch_frontend.py — run from SeekReap-Tier-6-Frontend/

    python3 patch_frontend.py
"""

# ─────────────────────────────────────────────────────────────────────────────
# SHARED: token helper injected into both files
# Gets the Supabase session access_token from supabase.auth.getSession()
# Falls back to window.currentUser if already hydrated by auth-guard.js
# ─────────────────────────────────────────────────────────────────────────────

TOKEN_HELPER = """
  // ── Get Supabase Bearer token ─────────────────────────────────────────────
  async function getAuthToken() {
    // Prefer live session token from Supabase client
    if (window.supabase) {
      try {
        const { data } = await window.supabase.auth.getSession();
        if (data?.session?.access_token) return data.session.access_token;
      } catch (_e) {}
    }
    // Fallback: if auth-guard already set currentUser with a token attached
    if (window.currentUser?._token) return window.currentUser._token;
    return null;
  }

  async function authHeaders() {
    const token = await getAuthToken();
    const h = { 'Content-Type': 'application/json' };
    if (token) h['Authorization'] = 'Bearer ' + token;
    return h;
  }
"""

# ═════════════════════════════════════════════════════════════════════════════
# pay.html
# ═════════════════════════════════════════════════════════════════════════════

PAY_PATH = "public/pay.html"
pay = open(PAY_PATH, encoding="utf-8").read()

# 1. Inject token helper after `'use strict';`
assert "'use strict';" in pay, "❌ 'use strict' not found in pay.html"
pay = pay.replace(
    "'use strict';",
    "'use strict';\n" + TOKEN_HELPER,
    1
)

# 2. Replace the fetch call to use authHeaders()
pay = pay.replace(
    """    const res  = await fetch(TIER4_URL + '/api/payments/initiate', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });""",
    """    const headers = await authHeaders();
    const res  = await fetch(TIER4_URL + '/api/payments/initiate', {
      method:  'POST',
      headers: headers,
      body:    JSON.stringify(payload),
    });"""
)

open(PAY_PATH, "w", encoding="utf-8").write(pay)
print("✅ pay.html — authHeaders() injected into /api/payments/initiate fetch")


# ═════════════════════════════════════════════════════════════════════════════
# payment_success.html
# ═════════════════════════════════════════════════════════════════════════════

SUCCESS_PATH = "public/payment_success.html"
success = open(SUCCESS_PATH, encoding="utf-8").read()

# 1. Inject token helper after `'use strict';`
assert "'use strict';" in success, "❌ 'use strict' not found in payment_success.html"
success = success.replace(
    "'use strict';",
    "'use strict';\n" + TOKEN_HELPER,
    1
)

# 2. Replace the poll fetch to send auth header
success = success.replace(
    "    const res  = await fetch(TIER4_URL + '/api/payments/' + encodeURIComponent(payId));",
    """    const headers = await authHeaders();
    const res  = await fetch(TIER4_URL + '/api/payments/' + encodeURIComponent(payId), {
      headers: headers,
    });"""
)

open(SUCCESS_PATH, "w", encoding="utf-8").write(success)
print("✅ payment_success.html — authHeaders() injected into poll fetch")

print("\n✅ Frontend patches done.")
