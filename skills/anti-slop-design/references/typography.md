# Typography

Type carries most of a page's character. It is also where defaults hide best.

## Choose, do not inherit

- The default face (Inter, Roboto, Poppins, the bare system stack) is a signal that no choice was made. It is fine for dense product interfaces that already use it. For anything with a point of view, pick on purpose.
- **Pair by contrast, not similarity.** A serif with a monospace. A condensed sans with a book serif. Two similar sans faces look like a mistake.
- **Two families at most, three weights at most.** Use size and spacing for the rest.
- If you cannot load a web font, a deliberate system stack still beats a default: `"Iowan Old Style", "Palatino Linotype", Georgia, serif` or `ui-monospace, "SF Mono", Menlo, Consolas, monospace`.

## Scale and measure

- Pick a ratio and stay on it. 1.25 for calm, 1.5 for confident. Do not invent sizes.
- Body 17 to 20 pixels. Line height 1.5 to 1.65 for text, 1.0 to 1.15 for large headings.
- Measure (line length) 45 to 75 characters. `max-width: 34rem` to `44rem` on text blocks.
- Headlines: tighten letter-spacing slightly as size rises (`-0.01em` to `-0.03em`). Never track out lowercase.
- Use `clamp()` for fluid headline sizes so the phone layout is designed, not shrunk.

## Details that signal care

- Real numerals: tabular figures for tables and prices (`font-variant-numeric: tabular-nums`).
- Proper punctuation: curly quotes, a true multiplication sign, a non-breaking space before units.
- Hanging punctuation and balanced wrapping on headlines (`text-wrap: balance`).
- Links are underlined and the underline offset is set; colour alone is not enough.

## Avoid

- All-caps tracked eyebrow labels over every heading.
- Gradient-filled headline text.
- Centred paragraphs of more than two lines.
- Light grey text (`#999`, `text-gray-400`) on white.
