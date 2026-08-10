#!/usr/bin/env python3
"""
toggle_sections_patch.py

Makes all section cards hidden by default and adds toggle functionality:
- Biography, Identity Record, Accomplishments, History, Passports, Roles, Networks
- Clicking a button shows its corresponding card
- Clicking an active button hides its card (toggle off)

Usage:
    cd ~/SeekReap-Tier-6-Frontend
    python3 toggle_sections_patch.py
"""

import shutil
import sys
from datetime import datetime
from pathlib import Path

TARGET = Path("public/profile.html")
BACKUP_DIR = Path("public/backups")

def main():
    if not TARGET.exists():
        print(f"ERROR: {TARGET} not found.")
        print("Make sure you're in the right directory and the file exists.")
        sys.exit(1)

    # Create backup directory if it doesn't exist
    BACKUP_DIR.mkdir(exist_ok=True)

    # Read the file
    original = TARGET.read_text()
    
    # Create backup
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = BACKUP_DIR / f"profile.html.bak_toggle_{ts}"
    shutil.copy2(TARGET, backup_path)
    print(f"✅ Backed up original to {backup_path}")

    content = original

    # ─── 1. Update CSS to hide all section-content by default ────────────────
    old_css = """        /* ─── SECTION CONTENT ──────────────────────────────────────────────── */
        .section-content { display: none; }
        .section-content:first-of-type { display: block; }"""
    
    new_css = """        /* ─── SECTION CONTENT ──────────────────────────────────────────────── */
        .section-content { 
            display: none !important; 
        }
        .section-content.active { 
            display: block !important; 
        }"""
    
    content = content.replace(old_css, new_css)
    print("✅ Updated CSS for section toggle")

    # ─── 2. Update toggleSectionTab function for toggle behavior ─────────────
    old_function = """// ─── SECTION TABS ──────────────────────────────────────────────────────────
function toggleSectionTab(btn, sectionId) {
    var allTabs = document.querySelectorAll('.section-tab');
    var allSections = document.querySelectorAll('.section-content');
    allTabs.forEach(function(t) { t.classList.remove('active'); });
    allSections.forEach(function(s) { s.style.display = 'none'; });
    btn.classList.add('active');
    var section = document.getElementById('section-' + sectionId);
    if (section) { section.style.display = 'block'; }
}"""

    new_function = """// ─── SECTION TABS ──────────────────────────────────────────────────────────
function toggleSectionTab(btn, sectionId) {
    var section = document.getElementById('section-' + sectionId);
    var isActive = btn.classList.contains('active');
    
    // Remove active class from all tabs and hide all sections
    var allTabs = document.querySelectorAll('.section-tab');
    var allSections = document.querySelectorAll('.section-content');
    
    // If the clicked tab is already active, just hide its section and deactivate it
    if (isActive) {
        btn.classList.remove('active');
        section.classList.remove('active');
        return;
    }
    
    // Otherwise, deactivate all and show the clicked one
    allTabs.forEach(function(t) { t.classList.remove('active'); });
    allSections.forEach(function(s) { s.classList.remove('active'); });
    
    btn.classList.add('active');
    section.classList.add('active');
}"""

    content = content.replace(old_function, new_function)
    print("✅ Updated toggleSectionTab function for toggle behavior")

    # ─── 3. Update the section-nav-tabs to remove the default active state ────
    # Remove "active" class from Biography tab
    content = content.replace(
        '<button class="section-tab active" data-section="biography" onclick="toggleSectionTab(this, \'biography\')">',
        '<button class="section-tab" data-section="biography" onclick="toggleSectionTab(this, \'biography\')">'
    )
    print("✅ Removed default active state from Biography tab")

    # ─── 4. Ensure all section-content divs don't have inline style="display:block" ──
    # Remove any inline display styles from section-content divs
    import re
    content = re.sub(
        r'(<div class="profile-card section-content"[^>]*?)\s+style="display:block;"',
        r'\1',
        content
    )
    content = re.sub(
        r'(<div class="profile-card section-content"[^>]*?)\s+style="display:none;"',
        r'\1',
        content
    )
    print("✅ Cleaned up inline display styles from section content")

    # ─── 5. Add a small note in the UI about clicking tabs ──────────────────
    # Optional: Add a subtle hint that sections are toggleable
    # We'll add a small instruction below the tabs
    hint_html = """
        <!-- ─── SECTION TOGGLE HINT ─── -->
        <div style="font-size:11px;color:var(--text-muted);margin-top:-16px;margin-bottom:16px;text-align:center;">
            <i class="fas fa-info-circle"></i> Click a tab to view its content. Click again to hide it.
        </div>
"""
    
    # Find the section-nav-tabs closing div and insert the hint after it
    content = content.replace(
        '</div><!-- .section-nav-tabs -->',
        '</div><!-- .section-nav-tabs -->' + hint_html
    )
    print("✅ Added toggle hint below section tabs")

    # ─── 6. Remove the "style='display:none;'" from all section-content divs ──
    # We want them all hidden by CSS, not inline styles
    content = re.sub(
        r'(<div class="profile-card section-content" id="section-[^"]+")\s+style="display:none;"',
        r'\1',
        content
    )
    print("✅ Removed inline display:none from section-content divs")

    # ─── Write the file ──────────────────────────────────────────────────────
    TARGET.write_text(content)
    print("\n✅ All patches applied successfully!")
    print("\nSummary of changes:")
    print("  • All section cards (Biography, Identity Record, Accomplishments, History,")
    print("    Passports, Roles, Networks) are now hidden by default")
    print("  • Clicking a tab shows its corresponding card")
    print("  • Clicking an active tab hides its card (toggle off)")
    print("  • Added a subtle hint below the tabs")
    print("\nNext: Test the page by opening it in a browser.")
    print("      All sections should be hidden initially.")
    print("      Click a tab to show its content, click again to hide it.")

if __name__ == "__main__":
    main()
