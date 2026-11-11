# States and motion

## Every interactive element has five states

Default, hover, focus, active and disabled. Loading and error where they apply. Design them, do not leave browser defaults on some and custom styles on others.

- **Focus is visible.** Use `:focus-visible` with a 3 pixel outline and an offset. Never `outline: none` without a replacement.
- **Hover changes something meaningful** (colour, underline, an offset, a reveal). Not a scale-up on every card.
- **Errors say what happened and what to do**, in plain words, next to the field, not in colour alone.
- **Empty states** explain what will appear here and how to start.

## Motion

- Use motion to explain a change (something appeared, moved, finished), not to decorate.
- Keep it short: 100 to 200 milliseconds for feedback, up to 400 for larger changes. Ease out.
- Respect reduced motion:

```css
@media (prefers-reduced-motion: no-preference) {
  .action { transition: background-color 120ms ease-out; }
}
```

- No parallax, no floating shapes, no auto-playing loops that carry no information.
- Never animate layout properties for a hover effect; it shifts the page.
