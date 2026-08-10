#!/usr/bin/env python3
"""
patch_profile_ui.py

Applies 4 targeted UI fixes to profile.html:
  2. Info cards overlay the Portfolio (not stacked above/below it)
  4. Search / notifications / share / more-menu merged into one header
     alongside the hamburger, logo, and plan indicator
  5. Sidebar now renders above (z-index over) the header when it opens
  6. Search field made wider at every breakpoint

(#1 "Member since" badge and #3 "no back button" were already correct.)

Usage:
    cd ~/SeekReap-Tier-6-Frontend
    python3 patch_profile_ui.py

Safe to re-run: exits early if the marker is already present.
"""
import shutil
import sys
from datetime import datetime
from pathlib import Path

TARGET = Path("public/profile.html")
MARKER = "/* ─── CONTENT STACK:"


def replace_once(content: str, old: str, new: str, label: str) -> str:
    count = content.count(old)
    if count != 1:
        print(f"❌ FAILED on step '{label}': expected exactly 1 match, found {count}.")
        print("   The file may differ from what this patch expects — aborting without")
        print("   further changes. Your backup is untouched; no partial edits were saved.")
        sys.exit(1)
    return content.replace(old, new)


def main():
    if not TARGET.exists():
        print(f"ERROR: {TARGET} not found. Run this from ~/SeekReap-Tier-6-Frontend")
        sys.exit(1)

    original = TARGET.read_text()

    if MARKER in original:
        print("UI patch already applied (marker found). Nothing to do.")
        sys.exit(0)

    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = TARGET.with_name(f"profile.html.bak_{ts}")
    shutil.copy2(TARGET, backup_path)
    print(f"Backed up original to {backup_path}")

    c = original

    # ── 5a. Sidebar: always a drawer, z-index above the header ──────────────
    c = replace_once(c, '''        .sidebar {
            position: fixed;
            top: 0;
            left: 0;
            bottom: 0;
            width: var(--sidebar-width);
            background: var(--bg2);
            border-right: 1px solid var(--border);
            display: flex;
            flex-direction: column;
            z-index: 200;
            transition: transform 0.3s ease;
            overflow: hidden;
        }''', '''        .sidebar {
            position: fixed;
            top: 0;
            left: 0;
            bottom: 0;
            width: var(--sidebar-width);
            background: var(--bg2);
            border-right: 1px solid var(--border);
            display: flex;
            flex-direction: column;
            z-index: 400;
            transition: transform 0.3s ease;
            overflow: hidden;
            transform: translateX(-100%);
        }
        .sidebar.mobile-open {
            transform: translateX(0);
        }
        .sidebar.mobile-open .sidebar-close-btn {
            display: block;
        }''', "sidebar z-index + always-drawer")

    # ── 5b. Overlay backdrop sits between header and sidebar ────────────────
    c = replace_once(c, '''        .sidebar-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.3);
            z-index: 150;
            display: none;
            opacity: 0;
            transition: opacity 0.3s ease;
        }''', '''        .sidebar-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.3);
            z-index: 390;
            display: none;
            opacity: 0;
            transition: opacity 0.3s ease;
        }''', "sidebar-overlay z-index")

    # ── 4a. Header always visible (not just <=1024px) ───────────────────────
    c = replace_once(c, '''        .mobile-header {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 56px;
            background: var(--bg2);
            border-bottom: 1px solid var(--border);
            z-index: 300;
            align-items: center;
            padding: 0 12px;
            gap: 10px;
            box-shadow: var(--shadow);
        }''', '''        .mobile-header {
            display: flex;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 56px;
            background: var(--bg2);
            border-bottom: 1px solid var(--border);
            z-index: 300;
            align-items: center;
            padding: 0 12px;
            gap: 10px;
            box-shadow: var(--shadow);
        }''', "header always-on")

    # ── plan-indicator no longer needs to self-push right; search's flex:1
    #    now does that job so everything after it (notif/share/more) sits
    #    at the far right ─────────────────────────────────────────────────
    c = replace_once(c, '''        .mobile-header .plan-indicator {
            background: var(--primary-light);
            color: var(--primary);
            font-size: 9px;
            font-weight: 700;
            padding: 3px 10px;
            border-radius: 12px;
            border: 1px solid var(--primary);
            letter-spacing: 0.05em;
            text-transform: uppercase;
            margin-left: auto;
        }''', '''        .mobile-header .plan-indicator {
            background: var(--primary-light);
            color: var(--primary);
            font-size: 9px;
            font-weight: 700;
            padding: 3px 10px;
            border-radius: 12px;
            border: 1px solid var(--primary);
            letter-spacing: 0.05em;
            text-transform: uppercase;
        }''', "plan-indicator margin fix")

    # ── main-content: no permanent sidebar gutter anymore, header space always reserved ──
    c = replace_once(c, '''        .main-content {
            margin-left: var(--sidebar-width);
            flex: 1;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            width: 100%;
        }''', '''        .main-content {
            margin-left: 0;
            flex: 1;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            width: 100%;
            padding-top: 56px;
        }''', "main-content margin/padding")

    # ── 6. Wider search field at every breakpoint (the rules that actually
    #    win the cascade are the later ones near the bottom of the file) ──
    c = replace_once(c, '''            .portfolio-display-section { grid-template-columns: 1fr 240px; }
            .portfolio-grid-display { grid-template-columns: repeat(2, 1fr); }
            .search-container { width: 350px; max-width: 350px; }
        }
        @media (max-width: 992px) {
            .profile-layout-grid { grid-template-columns: 1fr; gap: 24px; }
            .search-container { width: 250px; max-width: 250px; }
        }''', '''            .portfolio-display-section { grid-template-columns: 1fr 240px; }
            .portfolio-grid-display { grid-template-columns: repeat(2, 1fr); }
            .search-container { width: 450px; max-width: 450px; }
        }
        @media (max-width: 992px) {
            .profile-layout-grid { grid-template-columns: 1fr; gap: 24px; }
            .search-container { width: 320px; max-width: 320px; }
        }''', "search width 1200/992")

    c = replace_once(c, '''            .search-container { width: 160px; max-width: 160px; }''',
                      '''            .search-container { width: 220px; max-width: 220px; }''',
                      "search width 768 (bottom section)")

    c = replace_once(c, '''            .search-container { width: 100px; max-width: 100px; }
            .search-container input::placeholder { font-size: 10px; }
        }''', '''            .search-container { width: 150px; max-width: 150px; }
            .search-container input::placeholder { font-size: 10px; }
        }''', "search width 480 (bottom section)")

    # ── 2. Wrap portfolio display + info-card grid so they overlay ─────────
    insert_css = '''
        /* ─── CONTENT STACK: info cards overlay over portfolio (not above/below) ─── */
        .content-stack {
            display: grid;
        }
        .content-stack > .portfolio-display-section,
        .content-stack > .profile-layout-grid {
            grid-area: 1 / 1;
        }
        .portfolio-display-section { position: relative; z-index: 1; }
        .profile-layout-grid {
            position: relative;
            z-index: 60;
            align-self: start;
            background: rgba(245, 244, 239, 0.98);
            backdrop-filter: blur(6px);
            -webkit-backdrop-filter: blur(6px);
            border-radius: var(--radius-lg);
            border: 1px solid var(--border);
            box-shadow: var(--shadow-lg);
            padding: 20px;
            max-height: 85vh;
            overflow-y: auto;
        }

        /* ─── RESPONSIVE ───────────────────────────────────────────────────── */'''
    c = replace_once(c, '''        /* ─── RESPONSIVE ───────────────────────────────────────────────────── */''',
                      insert_css, "content-stack CSS insertion")

    c = replace_once(c, '<div class="portfolio-display-section" id="portfolioDisplaySection">',
                      '<div class="content-stack">\n        <div class="portfolio-display-section" id="portfolioDisplaySection">',
                      "content-stack open tag")

    c = replace_once(c, '<!-- ─── SCROLL TO TOP ─── -->',
                      '</div><!-- /content-stack -->\n\n<!-- ─── SCROLL TO TOP ─── -->',
                      "content-stack close tag")

    # ── 4b. Move search/notifications/share/more into the unified header ───
    c = replace_once(c, '''<div class="mobile-header" id="mobileHeader">
    <button class="hamburger-btn" id="hamburgerBtn" onclick="toggleMobileSidebar()" aria-label="Toggle sidebar">
        <i class="fas fa-bars"></i>
    </button>
    <a href="/dashboard.html" class="mobile-logo">Seek<span>Reap</span></a>
    <span class="plan-indicator">Free</span>
</div>''', '''<div class="mobile-header" id="mobileHeader">
    <button class="hamburger-btn" id="hamburgerBtn" onclick="toggleMobileSidebar()" aria-label="Toggle sidebar">
        <i class="fas fa-bars"></i>
    </button>
    <a href="/dashboard.html" class="mobile-logo">Seek<span>Reap</span></a>
    <span class="plan-indicator">Free</span>
    <div class="search-container" id="searchContainer">
        <i class="fas fa-search search-icon-inline"></i>
        <input type="text" placeholder="Search by creator or Portfolio name..." id="headerSearch">
        <button class="search-close-btn" onclick="toggleSearch()" aria-label="Close search"><i class="fas fa-times"></i></button>
    </div>
    <button class="topbar-icon-btn" onclick="window.location.href='/notifications.html'" aria-label="Notifications">
        <i class="fas fa-bell"></i>
        <span class="badge-count">3</span>
    </button>
    <button class="topbar-icon-btn" onclick="handleShare()" aria-label="Share">
        <i class="fas fa-share-alt"></i>
    </button>
    <div class="more-dropdown-wrapper topbar-more-wrapper">
        <button class="topbar-icon-btn more-btn" onclick="toggleMoreMenu(event)" aria-label="More options">
            <i class="fas fa-ellipsis-v"></i>
        </button>
        <div class="more-popup-box" id="morePopupBox">
            <div class="more-menu-group">
                <div class="menu-group-header"><i class="fas fa-id-card" style="margin-right:6px;"></i> Identity</div>
                <button class="menu-item" onclick="handleMenuClick('View Credentials')"><i class="fas fa-id-card" style="width:18px;"></i> View Credentials</button>
                <button class="menu-item" onclick="handleMenuClick('View Reputation')"><i class="fas fa-star" style="width:18px;"></i> View Reputation</button>
            </div>
            <div class="more-menu-group">
                <div class="menu-group-header"><i class="fas fa-compass" style="margin-right:6px;"></i> Discovery</div>
                <button class="menu-item" onclick="handleMenuClick('Search Profile')"><i class="fas fa-search" style="width:18px;"></i> Search Profile</button>
                <button class="menu-item" onclick="handleMenuClick('Copy Profile Link')"><i class="fas fa-link" style="width:18px;"></i> Copy Profile Link</button>
                <button class="menu-item" onclick="handleMenuClick('Save Profile')"><i class="fas fa-bookmark" style="width:18px;"></i> Save Profile</button>
            </div>
            <div class="more-menu-group">
                <div class="menu-group-header"><i class="fas fa-handshake" style="margin-right:6px;"></i> Community</div>
                <button class="menu-item" onclick="handleMenuClick('Recommend Creator')"><i class="fas fa-thumbs-up" style="width:18px;"></i> Recommend Creator</button>
            </div>
            <div class="more-menu-group">
                <div class="menu-group-header"><i class="fas fa-shield-alt" style="margin-right:6px;"></i> Safety</div>
                <button class="menu-item text-danger" onclick="handleMenuClick('Report Profile')"><i class="fas fa-flag" style="width:18px;"></i> Report Profile</button>
                <button class="menu-item text-danger" onclick="handleMenuClick('Block User')"><i class="fas fa-ban" style="width:18px;"></i> Block User</button>
            </div>
        </div>
    </div>
</div>''', "merge topbar content into header")

    # ── 4c. Remove the now-redundant separate <header class="topbar"> ──────
    c = replace_once(c, '''    <header class="topbar">
        <div class="topbar-right">
            <div class="search-container" id="searchContainer">
                <i class="fas fa-search search-icon-inline"></i>
                <input type="text" placeholder="Search by creator or Portfolio name..." id="headerSearch">
                <button class="search-close-btn" onclick="toggleSearch()" aria-label="Close search"><i class="fas fa-times"></i></button>
            </div>
            <button class="topbar-icon-btn" onclick="window.location.href='/notifications.html'" aria-label="Notifications">
                <i class="fas fa-bell"></i>
                <span class="badge-count">3</span>
            </button>
            <button class="topbar-icon-btn" onclick="handleShare()" aria-label="Share">
                <i class="fas fa-share-alt"></i>
            </button>
            <div class="more-dropdown-wrapper topbar-more-wrapper">
                <button class="topbar-icon-btn more-btn" onclick="toggleMoreMenu(event)" aria-label="More options">
                    <i class="fas fa-ellipsis-v"></i>
                </button>
                <div class="more-popup-box" id="morePopupBox">
                    <div class="more-menu-group">
                        <div class="menu-group-header"><i class="fas fa-id-card" style="margin-right:6px;"></i> Identity</div>
                        <button class="menu-item" onclick="handleMenuClick('View Credentials')"><i class="fas fa-id-card" style="width:18px;"></i> View Credentials</button>
                        <button class="menu-item" onclick="handleMenuClick('View Reputation')"><i class="fas fa-star" style="width:18px;"></i> View Reputation</button>
                    </div>
                    <div class="more-menu-group">
                        <div class="menu-group-header"><i class="fas fa-compass" style="margin-right:6px;"></i> Discovery</div>
                        <button class="menu-item" onclick="handleMenuClick('Search Profile')"><i class="fas fa-search" style="width:18px;"></i> Search Profile</button>
                        <button class="menu-item" onclick="handleMenuClick('Copy Profile Link')"><i class="fas fa-link" style="width:18px;"></i> Copy Profile Link</button>
                        <button class="menu-item" onclick="handleMenuClick('Save Profile')"><i class="fas fa-bookmark" style="width:18px;"></i> Save Profile</button>
                    </div>
                    <div class="more-menu-group">
                        <div class="menu-group-header"><i class="fas fa-handshake" style="margin-right:6px;"></i> Community</div>
                        <button class="menu-item" onclick="handleMenuClick('Recommend Creator')"><i class="fas fa-thumbs-up" style="width:18px;"></i> Recommend Creator</button>
                    </div>
                    <div class="more-menu-group">
                        <div class="menu-group-header"><i class="fas fa-shield-alt" style="margin-right:6px;"></i> Safety</div>
                        <button class="menu-item text-danger" onclick="handleMenuClick('Report Profile')"><i class="fas fa-flag" style="width:18px;"></i> Report Profile</button>
                        <button class="menu-item text-danger" onclick="handleMenuClick('Block User')"><i class="fas fa-ban" style="width:18px;"></i> Block User</button>
                    </div>
                </div>
            </div>
            <button class="topbar-icon-btn" onclick="toggleSearch()" aria-label="Toggle search" style="display:none;" id="searchToggleBtn">
                <i class="fas fa-search"></i>
            </button>
        </div>
    </header>
''', '', "remove redundant topbar element")

    TARGET.write_text(c)
    print("✅ All patches applied successfully.")
    print()
    print("Summary of changes:")
    print("  #2  Info cards now overlay the portfolio grid (CSS grid-area stacking)")
    print("  #4  Search / notifications / share / more merged into one header")
    print("  #5  Sidebar z-index (400) now renders above header (300) when open")
    print("  #6  Search field widened at 1200/992/768/480px breakpoints")
    print("  (design note: sidebar is now a slide-over drawer at ALL screen sizes,")
    print("   not just <=1024px, since a hamburger + unified header implies that)")
    print()
    print("Next: git add -A && git commit -m 'Profile UI: unify header, overlay cards, drawer sidebar' && git push")


if __name__ == "__main__":
    main()
