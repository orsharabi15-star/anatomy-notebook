# Supraspinatus pilot review

## Local preview

From the repository root, run `python3 -m http.server 8765 --bind 127.0.0.1` and open:

http://127.0.0.1:8765/concepts/supraspinatus.html

The page is standalone and does not require a package install or a build step. The existing lesson shell is unchanged.

## Verified in the real Codex browser on 2026-10-25

- Desktop viewport: 1440 × 1000. Mobile viewport: 390 × 844.
- `dir=rtl`, body font 18px, computed line-height 34.2px (1.9).
- Document scroll width equals viewport width at both sizes. No overflowing text containers found.
- Every text/figure row is side-by-side on desktop and vertically stacked, text first, on mobile. No overlapping bounding boxes.
- All seven rendered image instances load, including all four illustrations inside the expanded SITS gallery.
- The animation loads on demand, and its control returns to a still image when stopped. It never starts automatically.
- Quiz: wrong answer provides a retry hint; correct answer provides the nerve and roots; changing selection clears old feedback; reset clears the answer and feedback. Correct-answer flow checked on mobile too.
- The related Infraspinatus link opens the illustration gallery and navigates to the actual figure.
- Dark model placeholder renders with computed background `rgb(14, 26, 46)` / `#0e1a2e`.
- Hebrew reads in the correct order; Latin terms and C5-C6 are isolated. The initial desktop check found the Latin hero title aligned left; it was corrected and visually rechecked at both widths.
- Browser reported no warning/error logs during these checks.
- JavaScript syntax and `git diff --check` pass.

## Scope and remaining placeholders

Only `concepts/supraspinatus.html` and `assets/concepts/supraspinatus/` are used by the pilot. Existing lessons, the notebook home page, and the separate flashcard application are untouched. No new GLB or deployment configuration is included.

- 3D: awaiting a model reduced to a few MB, with exact license verification and Blender inspection.
- Neurovascular illustrations: individual highlighted nerve and artery illustrations await a verified source. Bony landmarks remain contextual rather than separate highlighted plates.
- Related concept pages are future text labels or links to existing sections of this same page; no additional concept pages were built.
- All three flashcard deck names are plain text, as requested in the follow-up.
- Superior facet, C5-C6 and the muscle's arterial supply retain the user's canonical facts, with a visible course-verification note.

Image credits and adaptation terms: [SOURCES.md](SOURCES.md).
