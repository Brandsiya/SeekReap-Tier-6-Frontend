#!/usr/bin/env python3
"""
fix_layout_patch.py

Fixes layout issues below the "View Portfolios" button:
1. Removes the content-stack overlay
2. Properly positions portfolio above profile cards
3. Fixes duplicate script tag
4. Properly closes the content-stack div

Usage:
    cd ~/SeekReap-Tier-6-Frontend
    python3 fix_layout_patch.py
"""

import shutil
import sys
import re
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
    backup_path = BACKUP_DIR / f"profile.html.bak_layout_fix_{ts}"
    shutil.copy2(TARGET, backup_path)
    print(f"✅ Backed up original to {backup_path}")

    content = original

    # ─── 1. Remove the content-stack CSS overlay ────────────────────────────
    # Find and remove the entire content-stack CSS block
    content = re.sub(
        r'\s*/\* ─── CONTENT STACK: info cards overlay over portfolio \(not above/below\) ─── \*/\s*'
        r'\.content-stack \{\s*display: grid;\s*\}\s*'
        r'\.content-stack > \.portfolio-display-section,\s*'
        r'\.content-stack > \.profile-layout-grid \{\s*grid-area: 1 / 1;\s*\}\s*'
        r'\.portfolio-display-section \{ position: relative; z-index: 1; \}\s*'
        r'\.profile-layout-grid \{\s*position: relative;\s*z-index: 60;\s*'
        r'align-self: start;\s*background: rgba\(245, 244, 239, 0.98\);\s*'
        r'backdrop-filter: blur\(6px\);\s*-webkit-backdrop-filter: blur\(6px\);\s*'
        r'border-radius: var\(--radius-lg\);\s*border: 1px solid var\(--border\);\s*'
        r'box-shadow: var\(--shadow-lg\);\s*padding: 20px;\s*'
        r'max-height: 85vh;\s*overflow-y: auto;\s*\}\s*',
        '',
        content,
        flags=re.DOTALL
    )
    print("✅ Removed content-stack CSS overlay")

    # ─── 2. Remove the content-stack wrapper divs ───────────────────────────
    # Remove the opening content-stack div
    content = content.replace(
        '<div class="content-stack">',
        ''
    )
    print("✅ Removed content-stack opening div")

    # Remove the closing content-stack div
    content = content.replace(
        '</div><!-- /content-stack -->',
        ''
    )
    print("✅ Removed content-stack closing div")

    # ─── 3. Ensure portfolio-display-section has proper margin-bottom ──────
    # Add margin-bottom to portfolio section if not present
    if '.portfolio-display-section {' in content:
        # Add margin-bottom if not already there
        content = content.replace(
            '.portfolio-display-section {',
            '.portfolio-display-section {\n            margin-bottom: 24px;'
        )
        print("✅ Added margin-bottom to portfolio section")

    # ─── 4. Fix duplicate profile.js script tag ────────────────────────────
    # Count occurrences of profile.js
    script_count = content.count('src="/assets/js/profile.js"')
    if script_count > 1:
        # Remove the duplicate (keep the one near the end)
        content = content.replace(
            '<script src="/assets/js/profile.js"></script>',
            '',
            1  # Remove the first occurrence (the one in the head section)
        )
        print("✅ Removed duplicate profile.js script tag")

    # ─── 5. Ensure profile cards have proper spacing ──────────────────────
    # Add margin-top to profile-layout-grid
    if '.profile-layout-grid {' in content:
        content = content.replace(
            '.profile-layout-grid {',
            '.profile-layout-grid {\n            margin-top: 24px;'
        )
        print("✅ Added margin-top to profile-layout-grid")

    # ─── 6. Fix the section-content toggle to show first section by default ──
    # Make Biography visible by default
    content = content.replace(
        '<div class="profile-card section-content" id="section-biography">',
        '<div class="profile-card section-content active" id="section-biography">'
    )
    print("✅ Made Biography section visible by default")

    # Also ensure the Biography tab is active
    content = content.replace(
        '<button class="section-tab" data-section="biography" onclick="toggleSectionTab(this, \'biography\')">',
        '<button class="section-tab active" data-section="biography" onclick="toggleSectionTab(this, \'biography\')">'
    )
    print("✅ Made Biography tab active by default")

    # ─── 7. Clean up any extra whitespace ──────────────────────────────────
    # Remove extra blank lines
    content = re.sub(r'\n\s*\n\s*\n', '\n\n', content)

    # ─── Write the file ──────────────────────────────────────────────────────
    TARGET.write_text(content)
    print("\n✅ All layout fixes applied successfully!")
    print("\nSummary of changes:")
    print("  • Removed content-stack overlay CSS")
    print("  • Removed content-stack wrapper divs")
    print("  • Added proper spacing between portfolio and profile cards")
    print("  • Removed duplicate profile.js script tag")
    print("  • Biography section now visible by default")
    print("  • Biography tab active by default")
    print("\nNext: Test the page in a browser.")
    print("      The portfolio should display above the profile cards.")
    print("      The Biography section should be visible by default.")

if __name__ == "__main__":
    main()
