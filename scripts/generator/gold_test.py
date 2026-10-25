#!/usr/bin/env python3
"""
Gold Test for Knowbody Concept Generator
Runs generator on supraspinatus.md and compares to live page
"""

import os
import sys
import tempfile
import difflib
from pathlib import Path

# Add parent to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from generate_concept import parse_markdown, validate_data, generate_html


def normalize_html(html: str) -> str:
    """Normalize HTML for comparison (remove extra whitespace, etc.)"""
    import re

    # Remove comments
    html = re.sub(r'<!--.*?-->', '', html, flags=re.DOTALL)

    # Normalize whitespace in tags
    html = re.sub(r'\s+', ' ', html)

    # Normalize newlines
    html = html.replace('\r\n', '\n')

    # Remove trailing/leading whitespace per line
    lines = [line.strip() for line in html.split('\n')]

    # Remove empty lines
    lines = [line for line in lines if line]

    return '\n'.join(lines)


def compare_files(file1: str, file2: str) -> tuple:
    """Compare two files and return (is_identical, diff_lines)"""
    with open(file1, 'r', encoding='utf-8') as f1:
        content1 = f1.read()

    with open(file2, 'r', encoding='utf-8') as f2:
        content2 = f2.read()

    # Normalize
    norm1 = normalize_html(content1)
    norm2 = normalize_html(content2)

    if norm1 == norm2:
        return True, []

    # Generate diff
    lines1 = norm1.split('\n')
    lines2 = norm2.split('\n')

    diff = list(difflib.unified_diff(lines1, lines2, lineterm='', n=3))

    return False, diff


def main():
    # Determine paths
    script_dir = Path(__file__).parent.parent.parent
    md_source = "/Users/orsharabi/Downloads/Knowbody 2/03_research/גף-עליון/supraspinatus.md"
    live_page = script_dir / 'concepts' / 'supraspinatus.html'
    assets_dir = script_dir / 'assets'
    shared_dir = script_dir / 'concepts' / 'shared'

    print("=" * 70)
    print("GOLD TEST: Knowbody Concept Generator")
    print("=" * 70)
    print()

    # Check if supraspinatus.md exists
    if not os.path.exists(md_source):
        print(f"❌ Error: Source markdown not found: {md_source}")
        print("Please provide the path to supraspinatus.md")
        sys.exit(1)

    print(f"📄 Source: {md_source}")
    print(f"🎯 Target: {live_page}")
    print()

    # Step 1: Parse
    print("Step 1: Parsing markdown...")
    try:
        data = parse_markdown(md_source)
        print(f"  ✅ Parsed successfully")
        print(f"     - Hebrew name: {data.get('hebrew_name', 'MISSING')}")
        print(f"     - Latin name: {data.get('latin_name', 'MISSING')}")
        print(f"     - Color: {data.get('color', 'MISSING')}")
    except Exception as e:
        print(f"  ❌ Parse failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

    print()

    # Step 2: Validate
    print("Step 2: Validating data...")
    errors = validate_data(data, md_source, str(assets_dir))

    if errors:
        print(f"  ❌ Validation failed with {len(errors)} errors:")
        for error in errors:
            print(f"     - {error}")
        sys.exit(1)

    print("  ✅ Validation passed")
    print()

    # Step 3: Generate
    print("Step 3: Generating HTML...")
    try:
        generated_html = generate_html(data, str(shared_dir))
        print("  ✅ Generation complete")
    except Exception as e:
        print(f"  ❌ Generation failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

    print()

    # Step 4: Compare
    print("Step 4: Comparing to live page...")

    # Write generated to temp file
    with tempfile.NamedTemporaryFile(mode='w', suffix='.html', delete=False, encoding='utf-8') as tmp:
        tmp.write(generated_html)
        tmp_path = tmp.name

    try:
        is_identical, diff_lines = compare_files(str(live_page), tmp_path)

        if is_identical:
            print("  ✅ GOLD TEST PASSED")
            print("     Generated HTML is identical to live page!")
            print()
            print("=" * 70)
            print("🎉 SUCCESS: Generator produces correct output")
            print("=" * 70)
            return 0
        else:
            print("  ❌ GOLD TEST FAILED")
            print(f"     Found {len([l for l in diff_lines if l.startswith('+') or l.startswith('-')])} differences")
            print()

            # Show first 50 lines of diff
            print("Diff (first 50 lines):")
            print("-" * 70)
            for i, line in enumerate(diff_lines[:50]):
                print(line)
                if i >= 49 and len(diff_lines) > 50:
                    print(f"... ({len(diff_lines) - 50} more lines)")
                    break
            print("-" * 70)
            print()

            # Save full diff
            diff_file = script_dir / 'scripts' / 'generator' / 'gold_test_diff.txt'
            with open(diff_file, 'w', encoding='utf-8') as f:
                f.write('\n'.join(diff_lines))
            print(f"Full diff saved to: {diff_file}")
            print()

            print("=" * 70)
            print("⚠️  FAILED: Generator output differs from live page")
            print("    Review diff and fix generator, not live page!")
            print("=" * 70)
            return 1

    finally:
        # Clean up temp file
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)


if __name__ == '__main__':
    sys.exit(main())
