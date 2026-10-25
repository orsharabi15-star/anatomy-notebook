#!/usr/bin/env python3
"""
Knowbody Concept Page Generator
Generates HTML concept pages from markdown source files.
"""

import re
import os
import sys
from pathlib import Path
from typing import Dict, List, Optional

# Locked color palette
VALID_COLORS = {
    '#E11D48': 'pink',
    '#0891B2': 'cyan',
    '#D97706': 'amber',
    '#65A30D': 'green',
    '#7C3AED': 'purple',
    '#1E3A8A': 'royal-blue'
}

# OIAI row colors (fixed)
OIAI_ROW_COLORS = {
    'origin': '#e11d48',
    'insertion': '#0891b2',
    'innervation': '#d97706',
    'action': '#65a30d',
    'blood': '#7c3aed'
}


class ValidationError(Exception):
    """Raised when validation fails"""
    pass


def parse_markdown(md_path: str) -> Dict:
    """Parse markdown file and extract all fields"""
    with open(md_path, 'r', encoding='utf-8') as f:
        content = f.read()

    data = {}

    # Extract identification section
    id_match = re.search(r'## 1\. זיהוי\n(.*?)\n##', content, re.DOTALL)
    if id_match:
        id_section = id_match.group(1)
        hebrew_match = re.search(r'- שם עברי: (.+)', id_section)
        if hebrew_match:
            data['hebrew_name'] = hebrew_match.group(1)

        latin_match = re.search(r'- שם לטיני: (.+)', id_section)
        if latin_match:
            data['latin_name'] = latin_match.group(1)

        color_match = re.search(r'- צבע המבנה: (.+)', id_section)
        if color_match:
            color_text = color_match.group(1).strip()
            # Extract hex color code
            hex_match = re.search(r'#[0-9A-Fa-f]{6}', color_text)
            if hex_match:
                data['color'] = hex_match.group(0).upper()
            else:
                data['color'] = color_text.upper()

        verify_match = re.search(r'- סטטוס אימות: (.+)', id_section)
        if verify_match:
            data['verification'] = verify_match.group(1)

    # Extract summary
    summary_match = re.search(r'## 2\. תקציר - 2 משפטים\n\n(.+?)(?=\n##)', content, re.DOTALL)
    if summary_match:
        data['summary'] = summary_match.group(1).strip()

    # Extract OIAI table
    oiai_match = re.search(r'## 3\. טבלת עובדות מפתח - OIAI\n(.*?)(?=\n## )', content, re.DOTALL)
    if oiai_match:
        oiai_section = oiai_match.group(1)

        origin_match = re.search(r'- מוצא: (.+)', oiai_section)
        if origin_match:
            data['origin'] = origin_match.group(1)

        insertion_match = re.search(r'- אחז: (.+)', oiai_section)
        if insertion_match:
            data['insertion'] = insertion_match.group(1)

        innervation_match = re.search(r'- עצבוב: (.+)', oiai_section)
        if innervation_match:
            data['innervation'] = innervation_match.group(1)

        action_match = re.search(r'- פעולה: (.+)', oiai_section)
        if action_match:
            data['action'] = action_match.group(1)

        blood_match = re.search(r'- אספקת דם: (.+)', oiai_section)
        if blood_match:
            data['blood_supply'] = blood_match.group(1)

    # Extract clinical significance
    clinical_match = re.search(r'## 4\. משמעות קלינית - תיבה נפרדת\n\n(.+?)(?=\n##)', content, re.DOTALL)
    if clinical_match:
        data['clinical'] = clinical_match.group(1).strip()

    # Extract illustration info
    illus_match = re.search(r'## 5\. איור\n(.*?)(?=\n## )', content, re.DOTALL)
    if illus_match:
        illus_section = illus_match.group(1)

        file_match = re.search(r'- קובץ איור מדויק: (.+)', illus_section)
        if file_match:
            data['illustration_file'] = file_match.group(1).strip()

        desc_match = re.search(r'- תיאור האיור הרצוי במשפט אחד: (.+)', illus_section)
        if desc_match:
            data['illustration_desc'] = desc_match.group(1).strip()

    # Extract quiz questions
    quiz_match = re.search(r'## 6\. למידה אקטיבית - בוחן / תוויות נסתרות\n(.*?)(?=\n##)', content, re.DOTALL)
    if quiz_match:
        quiz_section = quiz_match.group(1)
        questions = re.findall(r'\d+\. (.+)', quiz_section)
        data['quiz_questions'] = questions

    # Extract deck names
    decks_match = re.search(r'## 7\. חפיסות קשורות - שמות בלבד\n(.*?)(?=\n##)', content, re.DOTALL)
    if decks_match:
        decks_section = decks_match.group(1)
        decks = re.findall(r'- (.+)', decks_section)
        data['deck_names'] = decks

    return data


def validate_data(data: Dict, md_path: str, assets_dir: str) -> List[str]:
    """Validate all required fields and constraints. Returns list of errors."""
    errors = []

    # Required fields
    required_fields = [
        'hebrew_name', 'latin_name', 'color', 'verification',
        'summary', 'origin', 'insertion', 'innervation', 'action',
        'clinical', 'quiz_questions'
    ]

    for field in required_fields:
        if field not in data or not data[field]:
            errors.append(f"Missing required field: {field}")

    # Validate color is in locked palette
    if 'color' in data:
        if data['color'] not in VALID_COLORS:
            errors.append(f"Color {data['color']} not in locked palette. Valid colors: {list(VALID_COLORS.keys())}")

    # Validate illustration file exists if specified
    if 'illustration_file' in data and data['illustration_file']:
        illus_path = data['illustration_file']
        # Extract just the filename
        if '/' in illus_path:
            illus_filename = illus_path.split('/')[-1]
        else:
            illus_filename = illus_path

        # Check in assets/knowbody-atlas/
        full_path = os.path.join(assets_dir, 'knowbody-atlas', illus_filename)
        if not os.path.exists(full_path):
            errors.append(f"Illustration file not found: {full_path}")

    # Validate quiz has exactly 3 questions
    if 'quiz_questions' in data:
        if len(data['quiz_questions']) != 3:
            errors.append(f"Quiz must have exactly 3 questions, found {len(data['quiz_questions'])}")

    # Check for forbidden patterns (URLs in deck names)
    if 'deck_names' in data:
        for deck in data['deck_names']:
            if 'http' in deck.lower():
                errors.append("No URLs allowed in deck names")

    # Check for secrets (basic check)
    secret_patterns = [
        r'api[_-]?key',
        r'password',
        r'secret',
        r'token',
        r'credentials'
    ]

    content_str = str(data)
    for pattern in secret_patterns:
        if re.search(pattern, content_str, re.IGNORECASE):
            errors.append(f"Possible secret detected: {pattern}")

    return errors


def generate_html(data: Dict, shared_dir: str) -> str:
    """Generate HTML from validated data with inline CSS/JS"""

    # Read shared CSS and JS
    css_path = os.path.join(shared_dir, 'knowbody-concept.css')
    js_path = os.path.join(shared_dir, 'knowbody-concept.js')

    with open(css_path, 'r', encoding='utf-8') as f:
        css_content = f.read()

    with open(js_path, 'r', encoding='utf-8') as f:
        js_content = f.read()

    # Build HTML
    html = f'''<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{data['hebrew_name']} | Knowbody - דפי מושג</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@900&family=Heebo:wght@400;500;700;900&display=swap" rel="stylesheet">
<style>
{css_content}
</style>
</head>
<body>
<header class="topbar">
  <div class="topbar-in">
    <a class="brand" href="../index.html">
      <img class="brand-logo" src="../assets/knowbody-logo/knowbody-logo-H-topbar.svg" alt="Knowbody">
      <span><small>דפי מושג • שנה ב'</small></span>
    </a>
    <nav class="topnav">
      <a href="supraspinatus.html" class="active">דפי מושג</a>
      <span style="color: #dbeafe; font-size: 16px; font-weight: 500; padding: 8px 13px;">מערכות הגוף</span>
      <a href="decks.html">חפיסות</a>
      <span style="color: #dbeafe; font-size: 16px; font-weight: 500; padding: 8px 13px;">ההתקדמות שלי</span>
    </nav>
    <button class="menu-toggle" id="menuToggle" aria-label="תפריט ניווט" aria-expanded="false">☰</button>
  </div>
  <div class="mobile-menu" id="mobileMenu">
    <a href="supraspinatus.html" class="active">דפי מושג</a>
    <span>מערכות הגוף</span>
    <a href="decks.html">חפיסות</a>
    <span>ההתקדמות שלי</span>
  </div>
</header>

<div class="wrap">
  <div class="crumb"><span>מערכות הגוף</span> &gt; <span>שרירים</span> &gt; <span>גף עליון</span> &gt; {data['hebrew_name']}</div>
  <div class="layout">
    <aside class="side">
      <h3>ניווט</h3>
      <a href="../index.html">דף הבית</a>
      <a href="supraspinatus.html">שרירי גף עליון</a>
      <a href="decks.html">חפיסות</a>
      <h3>שרירי גף עליון</h3>
      <a href="supraspinatus.html"><span class="dot" style="background:#e11d48"></span>סופראספינאטוס</a>
      <a href="infraspinatus.html"><span class="dot" style="background:#0891b2"></span>אינפראספינאטוס</a>
      <a href="teres-minor.html"><span class="dot" style="background:#d97706"></span>טרס מינור</a>
      <a href="subscapularis.html"><span class="dot" style="background:#7c3aed"></span>סאבסקפולריס</a>
      <h3>החפיסות שלי</h3>
      <a href="decks.html#topic">OIAI שרירי גף עליון</a>
      <a href="decks.html#topic">זיהוי שרירים מהתמונה</a>
      <a href="decks.html#topic">אטלס שרירי הגפה העליונה</a>
    </aside>

    <main>
      <div class="hero">
        <span class="pilot">פיילוט - Knowbody דפי מושג</span>
        <h1>{data['hebrew_name']}</h1>
        <div class="latin">{data['latin_name']}</div>
        <p>{data['summary']}</p>
      </div>

      <div class="glass sec" style="--ac:#1e3a8a; padding: 18px 24px;">
        <p style="margin:0;"><b>כרטיסיות לנושא זה:</b> הבחירה קורית בדף החפיסות הראשי, לפני שנכנסים לדף השריר - לא כאן. <a href="decks.html#topic">לדף החפיסות</a>.</p>
      </div>

      <div class="glass sec" style="--ac:{data['color'].lower()}">
        <div class="grid">
          <div>
            <h2>טבלת עובדות מפתח - OIAI</h2>
            <table>
              <tr style="--rc:{OIAI_ROW_COLORS['origin']}"><th>מוצא</th><td>{data['origin']}</td></tr>
              <tr style="--rc:{OIAI_ROW_COLORS['insertion']}"><th>אחז</th><td>{data['insertion']}</td></tr>
              <tr style="--rc:{OIAI_ROW_COLORS['innervation']}"><th>עצבוב</th><td>{data['innervation']}</td></tr>
              <tr style="--rc:{OIAI_ROW_COLORS['action']}"><th>פעולה</th><td>{data['action']}</td></tr>'''

    # Add blood supply if present
    if 'blood_supply' in data and data['blood_supply']:
        html += f'''
              <tr style="--rc:{OIAI_ROW_COLORS['blood']}"><th>אספקת דם</th><td>{data['blood_supply']}</td></tr>'''

    html += f'''
            </table>
          </div>
          <div>
            <h2>צופה תלת-ממד</h2>
            <div class="viewer"><div>
              <p><b>מקום שמור למודל תלת-ממדי</b></p>
              <p class="small">בפיילוט הזה אין עדיין מודל GLB - האזור מסמן מקום בלבד, ללא טענת קרדיט למקור ספציפי</p>
            </div></div>
          </div>
        </div>
      </div>

      <div class="glass sec" style="--ac:#65a30d">
        <h2>נקודה קלינית</h2>
        <div class="clinical"><p>{data['clinical']}</p></div>
      </div>'''

    # Add illustration if present
    if 'illustration_file' in data and data['illustration_file']:
        illus_filename = data['illustration_file'].split('/')[-1]
        illus_path = f"../assets/knowbody-atlas/{illus_filename}"
        illus_desc = data.get('illustration_desc', 'איור')

        html += f'''

      <div class="glass sec" style="--ac:{data['color'].lower()}">
        <h2>איור - אטלס שרירי כתף</h2>
        <p class="sub">{illus_desc}</p>
        <img src="{illus_path}" alt="{illus_desc}" class="atlas-img">
        <p class="credit">UBC Clinical Anatomy via LibreTexts, CC BY-NC-SA 4.0</p>
      </div>'''

    # Add quiz
    html += f'''

      <div class="glass sec quiz" style="--ac:#7c3aed">
        <h2>בדוק את עצמך - למידה אקטיבית</h2>
        <p>לחצי על כל שאלה כדי לחשוף את התשובה, כמו תווית נסתרת בכרטיסייה.</p>'''

    for question in data['quiz_questions']:
        html += f'''
        <details><summary>{question}</summary><p>תשובה מקובץ המקור</p></details>'''

    html += '''
      </div>'''

    # Add deck names if present
    if 'deck_names' in data and data['deck_names']:
        html += f'''

      <div class="glass sec" style="--ac:#d97706">
        <h2>חפיסות קשורות</h2>
        <p class="sub">שמות חפיסות בלבד, בלי קישורים מומצאים.</p>
        <div class="decks">'''

        colors = ['#e11d48', '#0891b2', '#d97706']
        for i, deck in enumerate(data['deck_names']):
            color = colors[i % len(colors)]
            html += f'''
          <div class="deck" style="--c:{color}"><b>{deck}</b><span>חפיסה</span></div>'''

        html += '''
        </div>
      </div>'''

    # Add verification note
    verification = data.get('verification', 'מאומת')
    html += f'''

      <div class="note"><b>הערת פיילוט:</b> {verification}</div>
    </main>
  </div>
</div>

<footer class="footbar">
  <div class="footbar-in">
    <div><b>Knowbody - דפי מושג</b><br>לימוד לפי מערכות, מושג אחד בכל פעם. קודם בוחרים חפיסה בדף הראשי, ורק אחר כך נכנסים לדף מושג.</div>
    <div><b>ניווט</b><a href="supraspinatus.html">דפי מושג</a><a href="decks.html">חפיסות</a><a href="../index.html">חזרה למחברת</a></div>
    <div><b>מקורות</b><a href="https://flashcards-bd849.web.app">אפליקציית הכרטיסיות</a><span style="color: #dbeafe; display: block; margin: 6px 0;">היקף לפי חומרי הקורס; עובדות מאומתות מול אתרים ותיקים.</span></div>
  </div>
</footer>
<script>
{js_content}
</script>
</body>
</html>
'''

    return html


def main():
    if len(sys.argv) < 2:
        print("Usage: python generate_concept.py <markdown_file> [output_file]")
        print("Example: python generate_concept.py infraspinatus.md infraspinatus.html")
        sys.exit(1)

    md_path = sys.argv[1]
    output_path = sys.argv[2] if len(sys.argv) > 2 else None

    # Determine paths
    script_dir = Path(__file__).parent.parent.parent
    assets_dir = script_dir / 'assets'
    shared_dir = script_dir / 'concepts' / 'shared'

    if not os.path.exists(md_path):
        print(f"Error: Markdown file not found: {md_path}")
        sys.exit(1)

    print(f"Parsing {md_path}...")
    try:
        data = parse_markdown(md_path)
    except Exception as e:
        print(f"Error parsing markdown: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

    print("Validating data...")
    errors = validate_data(data, md_path, str(assets_dir))

    if errors:
        print("\n❌ Validation failed:")
        for error in errors:
            print(f"  - {error}")
        sys.exit(1)

    print("✅ Validation passed")

    print("Generating HTML...")
    try:
        html = generate_html(data, str(shared_dir))
    except Exception as e:
        print(f"Error generating HTML: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

    if output_path:
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(html)
        print(f"✅ Generated: {output_path}")
    else:
        print(html)


if __name__ == '__main__':
    main()
