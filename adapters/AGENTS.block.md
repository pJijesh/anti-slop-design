<!-- anti-slop-design:start -->
## Anti-slop design

Use when building, redesigning or reviewing a web page or UI.

Every visible choice must be traceable to the subject, the audience or the job of the page. If you cannot say why a colour, typeface, radius, layout or sentence is there, it is a default, and defaults read as machine-made.

## Process

1. Brief first, in six lines: the job, the visitor, the one next step, three words for the feel, two things it must not be, and the real content you have. If content is missing, ask or leave a marked gap. Never invent it.
2. Choose a direction on purpose and write the choices down before building: typeface pairing, a palette of 3 to 5 named colours taken from the subject, a spacing scale, one radius, how space is divided, hover and focus behaviour.
3. Build the first screen first, at 390 and 1280 pixels wide.
4. Run the linter: `node {{LINTER}} <path>`. Fix every BLOCK. Replace every TELL with a deliberate choice, or keep it and record why with `anti-slop-ignore <rule-id>: <reason>`. Treat NOTE items as questions.
5. Review by eye: squint test, cover-the-logo test, read the headline aloud, delete test, keyboard test.
6. Report the direction chosen and why, the tells kept on purpose, and anything you could not check.

## The floor (never traded for style)

- No invented statistics, testimonials, logos, people, prices or dates.
- Text contrast of at least 4.5 to 1. Visible keyboard focus. Motion respects prefers-reduced-motion.
- Works at 390 pixels with no sideways scroll. Real lang, viewport, ordered headings, alt on images, one main.
- No placeholder copy.

## Common tells to replace with a deliberate choice

Purple or indigo gradients; gradient headline text; Inter, Roboto or the bare system stack as the main face; frosted glass; large radius on everything; heavy shadows on many cards; scale-up hover; emoji as icons; a small uppercase label above every heading; an announcement pill above the headline; words like seamless, elevate, unlock and supercharge; several long dashes in copy; default Tailwind indigo or violet; blurred glowing blobs; stock names such as Sarah Chen; testimonial rows; three identical feature cards; everything centred; "Get started" and "Learn more" buttons.

## If the person asks for one of these

Do it, and record it as a deliberate override with their reason. The aim is to stop unconsidered defaults, not to overrule a decision.
<!-- anti-slop-design:end -->
