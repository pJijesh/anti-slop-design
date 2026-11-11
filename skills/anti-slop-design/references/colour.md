# Colour

## Source the palette

A palette is taken from something, not generated from a mood. Take it from a material, a place, a printed tradition, a photograph the page uses, or the client's existing identity. Name each colour for its role.

```css
:root {
  --paper: #f4efe4;   /* background */
  --ink: #1b1a17;     /* text */
  --ink-soft: #4a463d;/* secondary text */
  --rule: #cfc6b2;    /* lines */
  --signal: #b8431c;  /* the one thing that needs action */
}
```

## Rules

- **Three to five colours.** One neutral for the ground, one for text, one accent, and one state colour per meaning.
- **The accent is for action.** If everything is accented, nothing is.
- **Flat before gradient.** If you use a gradient, it should model light on a real surface, not decorate a background. Never a purple-to-blue gradient by reflex.
- **Do not use framework default accents** (Tailwind indigo, violet, purple) unless the project's identity is that colour.
- **Dark mode is a design, not an inversion.** If you offer it, choose the dark palette separately and check contrast again.

## Contrast

- Text: 4.5 to 1 minimum, 3 to 1 for large text and for the boundaries of controls.
- State must not rely on colour alone: pair it with text, an icon or position.
- Check the pair, not the swatch. Test grey text on your actual background.

## Avoid

- Glowing, blurred colour blobs behind content.
- Frosted-glass panels over a gradient.
- Neon accents on near-black as a default "tech" look.
