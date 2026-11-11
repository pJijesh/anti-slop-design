# Contributing

Thanks for taking an interest. This is a small skill with a small linter: standard library only, deterministic output, plain wording. Changes should keep it that way.

## Ground rules

1. **Every rule needs a reason.** A new tell goes in `skills/anti-slop-design/scripts/rules.json` with a tier, why it matters and what to do instead. It also needs a detector in `tells.mjs` and a positive sample in `test/linter.test.mjs`. A test fails if any of the three is missing.
2. **Prefer fewer, sharper rules.** A rule that fires on good pages is worse than no rule. Set thresholds so a single instance is fine.
3. **Blocks are for accessibility and honesty only.** Taste belongs in the tell and note tiers.
4. **No dependencies** in the skill or the linter. Test tooling uses `node:test`.
5. **Do not copy other projects.** Write your own wording and your own examples. All examples are fictional.
6. **British English, plain tone, no long dashes.** A test fails if an em dash or en dash appears in a text file.

## Development

```bash
node --test                  # all tests
node scripts/build.mjs       # regenerate tells.md and the adapters after editing rules.json or core.md
node scripts/build.mjs --check
node scripts/shots.mjs       # re-render the screenshots (needs Playwright)
```

## Suggesting a direction or a rule

Open a suggestion. Show a page that has the pattern, say why it reads as generated, and say what a person would do instead. A real example beats an argument.
