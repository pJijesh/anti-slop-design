# The tells catalogue

Generated from `scripts/rules.json` by `node scripts/build.mjs`. Do not edit by hand.

## BLOCK

Do not ship. Accessibility, honesty and basic correctness. Fix it or record why it does not apply.

### `no-viewport`: No viewport meta tag

Why: Phones render the desktop layout shrunk down.

Instead: Add <meta name="viewport" content="width=device-width, initial-scale=1">.

### `no-lang`: No lang attribute on <html>

Why: Screen readers and translation tools guess the language.

Instead: Add lang="en-GB" or the right code.

### `img-no-alt`: Image without alt text

Why: Content is invisible to screen readers; decorative images need alt="".

Instead: Describe the image, or use alt="" if it is decoration.

### `focus-removed`: Focus outline removed with no replacement

Why: Keyboard users lose track of where they are.

Instead: Style :focus-visible with a clear ring instead of removing the outline.

### `no-reduced-motion`: Animation with no prefers-reduced-motion handling

Why: Motion can cause real discomfort for some people.

Instead: Wrap motion in @media (prefers-reduced-motion: no-preference) or switch it off in the reduce case.

### `placeholder-text`: Placeholder copy left in

Why: Lorem ipsum or template text means the page is not finished.

Instead: Write the real copy, or leave the section out.

### `invented-claims`: Statistics or claims with no source

Why: Figures such as '10k+ users' or '99.9% uptime' are invented unless you can point to where they come from.

Instead: Use a figure you can source and cite it, or describe what the thing does instead.

### `ignore-without-reason`: An override with no reason

Why: An ignore comment must say why, or it is just hiding the problem.

Instead: Write: anti-slop-ignore <rule-id>: <reason>.

## TELL

A common default that makes a page read as machine-made. Replace it with a deliberate choice, or record why it is deliberate here.

### `gradient-purple`: Purple or indigo gradient

Why: The single most common default colour treatment from language models.

Instead: Choose a colour from the subject (a material, a place, a brand, a print tradition) and use it flat.

### `gradient-text`: Gradient-filled headline text

Why: Clipped gradient text is a reflex used to make a heading feel designed.

Instead: Set the heading in one colour and get emphasis from size, weight or position.

### `default-font`: Default typeface as the main face

Why: Inter, Roboto, Poppins or the bare system stack signals that no typographic choice was made.

Instead: Pick a face for a reason and pair it with a contrasting one; see references/typography.md.

### `glass`: Frosted glass panels

Why: Blurred translucent cards are a trend default that hurts contrast.

Instead: Use a solid surface and a border, and keep the glass for places where seeing through helps.

### `big-radius`: Large radius on everything

Why: Uniform rounded-2xl corners make every element the same soft shape.

Instead: Choose one radius scale, keep most things sharper, and round only what should feel touchable.

### `shadow-stack`: Heavy shadows on many elements

Why: Large soft shadows everywhere flatten hierarchy into a pile of floating cards.

Instead: Use borders and spacing for grouping, and a shadow only for things that truly float.

### `hover-scale`: Scale-up on hover as the hover effect

Why: A hover:scale-105 on every card is a stock interaction.

Instead: Change what matters (underline, colour, offset, reveal) and keep layout still.

### `emoji-icons`: Emoji used as icons

Why: Emoji in headings, buttons and feature lists read as filler and render differently on every platform.

Instead: Use a consistent icon set, or no icons.

### `eyebrow-labels`: Small uppercase label above every heading

Why: The tracked-out eyebrow is repeated on every section by habit.

Instead: Keep one at most, and only where it carries information.

### `badge-pill`: Announcement pill above the headline

Why: 'New', 'Now in beta' and sparkle pills are a template opener.

Instead: Cut it, or say something specific and dated in the headline itself.

### `buzzwords`: Stock marketing vocabulary

Why: Words such as seamless, elevate, unlock and supercharge carry no information.

Instead: Say what the product does, to whom, in plain words.

### `dash-copy`: Long dashes through the copy

Why: Several em or en dashes in page text is a recognisable machine habit.

Instead: Use full stops, commas, colons or brackets.

### `default-palette`: Default Tailwind indigo, violet or purple

Why: The framework's stock accent colours appear on a huge share of generated pages.

Instead: Define your own palette as variables and name the colours for what they are for.

### `ambient-blobs`: Blurred glowing blobs in the background

Why: Large blurred circles are a decorative reflex with no meaning.

Instead: Use real imagery, a pattern with a purpose, or plain space.

### `stock-names`: Stock person names

Why: Names such as Sarah Chen or John Doe are the first ones a model reaches for.

Instead: Use real, permitted names, or remove the person.

### `testimonials`: Testimonial section

Why: A row of quotes with names and job titles is almost always invented in generated pages.

Instead: Keep it only if the quotes are real and you have permission, and link to the source.

## NOTE

Worth a look. A pattern that is often a symptom, not a fault.

### `triplet-grid`: Three identical cards in a row

Why: Icon, heading and sentence in three equal columns is the default way to list features.

Instead: Vary the scale and the order, or write it as prose or a table.

### `centred-everything`: Almost everything centred

Why: Centring every block removes the reading edge and any sense of structure.

Instead: Set body text left aligned on a clear column, and centre only short, single lines.

### `generic-cta`: Generic button labels

Why: 'Get started' and 'Learn more' say nothing about what happens next.

Instead: Name the action: 'Download the checklist', 'Book a 20 minute call'.

### `no-main`: No <main> landmark

Why: Assistive technology uses landmarks to jump to the content.

Instead: Wrap the primary content in <main>.

### `h1-count`: Not exactly one <h1>

Why: A page needs one top-level heading that says what it is.

Instead: Use one <h1> and keep the rest in order.

## Overriding a rule

Add a comment in the file: `anti-slop-ignore <rule-id>: <reason>`. The reason is required. Overrides are listed in the linter output so they stay visible.
