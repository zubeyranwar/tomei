# AGENT.md

Tomei is a shadcn-compatible registry of award-level UI, split into **scenarios** (`landing`,
`dashboard`). One Next.js app: the site and the registry source live together.

## Ownership

The author designs and builds every component, section and page. Agents work on the
tooling, site and docs. Don't write or redesign registry items unless explicitly asked.

## Layout

```
registry/
  config.ts                       scenarios and their kinds
  define.ts                       defineItem() + types
  <scenario>/<kind>/<name>/
    item.ts                       metadata (title, description, deps, date...)
    demo.tsx                      preview only, never shipped
    prompt.md                     optional, replaces the generated prompt intro
    <name>.tsx                    shipped, plus any other files in the folder
  __index__.ts                    generated, gitignored
app/(site)/                       showcase site
app/preview/[name]/               bare demo render, loaded in iframes
components/site/                  site-only UI (home/ = home page sections, docs/ = item page)
scripts/registry-index.ts         builds registry.json + registry/__index__.ts
public/ui/r/                      built registry JSON, gitignored
```

Kinds: landing → `components | sections | pages`, dashboard → `components | blocks | pages`.

## Commands

```bash
pnpm dev                                   # indexes the registry, then next dev
pnpm new <scenario> <kind> <name>          # scaffold an item
pnpm registry:build                        # registry.json → public/ui/r/*.json
pnpm check                                 # lint + format:check + typecheck
pnpm build
```

Re-run `pnpm registry:index` (or restart dev) after adding or renaming an item.

## Registry item rules

- Folder name = item name: kebab-case, unique across the whole registry.
- Style with standard Tailwind and shadcn semantic tokens (`bg-background`, `text-foreground`,
  `border`, ...). Never use site-only tokens (`text-heading-*`, `sand-*`,
  `ink-*`, `eyebrow`); consumers don't have them. Need custom vars? Declare `cssVars` in item.ts.
- Import `cn` from `@/lib/utils`. Import another item via its full path
  (`@/registry/landing/components/x/x`) and list it in `registryDependencies`; shadcn rewrites it on
  install. Use relative imports between files of the same item.
- List every npm package in `dependencies`.
- Add `'use client'` only to files that need it. Keep it on the smallest piece (e.g. `magnetic.tsx`,
  not `magnetic-button.tsx`) so items stay usable from server components with `as={Link}`.
- Respect `prefers-reduced-motion` for animation.
- Install targets: single-file items → `components/<scenario>/<file>`, multi-file →
  `components/<scenario>/<name>/...`.

## Site theming

The site is light (sand) by default. Add the `dark` class to a section to flip it to ink; every
shadcn token inside follows.

## Code style

- TypeScript, function components, named exports for shipped code, default export for `demo.tsx`.
- No comments unless the logic is genuinely non-obvious.
- Match surrounding code. Prettier and ESLint decide formatting; don't fight them.
- Conventional commits (`feat:`, `fix:`, `chore:` ...), enforced by commitlint.

## Don'ts

- Never commit, push or open PRs unless asked.
- Never commit font files: PP Neue Montreal is licensed for personal use only.
- Don't edit generated files (`registry.json`, `registry/__index__.ts`, `public/ui/r`).
