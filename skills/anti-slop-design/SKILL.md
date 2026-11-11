---
name: anti-slop-design
description: Use when building, redesigning or reviewing any web page, UI or landing page, so the result looks designed by a person for a specific purpose instead of generated. Commits to a brief and specific choices, checks against a catalogue of AI-look tells with a bundled linter, and never invents content.
---

# Anti-slop design

Generated pages look generated because every choice was the most probable one: the same typeface, the same purple gradient, the same three cards, the same words. This skill replaces probable choices with deliberate ones, and then checks the result.

Read this file first. Open a reference only when the step below sends you there.

## The rule underneath all the others

**Every visible choice must be traceable to the subject, the audience or the job of the page.** If you cannot say why a colour, typeface, radius, layout or sentence is there, it is a default, and defaults are what readers recognise as machine-made.

## Process

1. **Brief before code.** Write the brief from `references/brief.md` in six lines: the job of the page, who arrives and what they came to do, the one thing they should do next, three words for the feel, two things the page must not be, and the real content you have. If real content is missing, ask for it or leave a visibly marked gap. Never fill it.
2. **Choose a direction, on purpose.** Pick or invent one from `references/directions.md`, then fix its choices in writing before touching markup: typeface pairing, palette (3 to 5 named colours), spacing scale, radius, how the page is divided (grid, rules, whitespace), and what it does on hover and focus. Take the palette and type from the subject (a material, a trade, a printed tradition, a place), not from what is fashionable.
3. **Build the first screen first.** Get the opening screen right at phone and desktop widths before building the rest. Use the references for the decisions that go wrong most often: `typography.md`, `colour.md`, `layout.md`, `copy.md`, `states-and-motion.md`.
4. **Lint.** Run `node scripts/tells.mjs <path>` from this skill's folder. Fix every `BLOCK`. For each `TELL`, replace it with a deliberate choice, or keep it and record why with `anti-slop-ignore <rule-id>: <reason>` in the file. Treat `NOTE` items as questions.
5. **Review by eye.** Render the page at 390 and 1280 pixels wide and look at it. Run the checks in `references/review.md`: squint test, cover-the-logo test, the sentence test and the delete test. The linter cannot judge taste. You must.
6. **Report.** Say what direction you chose and why, which tells you kept on purpose, and anything you could not check (for example if you could not render the page).

## Non-negotiables (the floor)

These are never traded for style. They are what the `BLOCK` tier checks.

- No invented content: no made-up statistics, testimonials, customer logos, people, prices or dates. See `references/content-integrity.md`.
- Text contrast of at least 4.5 to 1 (3 to 1 for large text). Visible keyboard focus. Motion respects `prefers-reduced-motion`.
- Works at 390 pixels wide with no sideways scroll. Real `lang`, viewport, headings in order, `alt` on every image, one `<main>`.
- No placeholder copy left behind.

## Commands

- Build a page: follow the process above.
- Audit a page: steps 4 and 5 only, report findings and change nothing.
- Redesign a page: keep the content and the behaviour, replace the presentation, then steps 4 to 6.

## When the user pushes back

If the person asks for something this skill flags (a gradient, a testimonial row, a stock typeface), do it, and record it as a deliberate override with their reason. The skill's job is to stop unconsidered defaults, not to overrule a decision.

## Files

- `references/brief.md`, `directions.md`, `typography.md`, `colour.md`, `layout.md`, `copy.md`, `states-and-motion.md`, `content-integrity.md`, `review.md`, `tells.md` (the full catalogue of what the linter looks for and why).
- `scripts/tells.mjs` and `scripts/rules.json`: the linter, which needs only Node 18 or later.
