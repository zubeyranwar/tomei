# Contributing to Tomei

Thanks for helping out. This guide covers how the repo is laid out, how to run it, and what a
good pull request looks like.

## Ground rules

- **Items are designed by the maintainer.** Components, sections, blocks and pages in `registry/`
  follow one visual language. Open an issue before you build or redesign one, so we can agree on
  it first. Bug fixes, accessibility fixes, docs, tooling and site work are welcome straight away.
- **Be kind.** Assume good intent and keep reviews about the code.
- **Security issues** go to the maintainer privately, not to a public issue.

## Setup

You need Node 20.9+ and pnpm 10.

```bash
git clone https://github.com/zubeyranwar/tomei.git
cd tomei
pnpm install
pnpm dev            # indexes the registry, then starts Farm.js
```

## Project layout

```
registry/<scenario>/<kind>/<name>/
  item.ts        metadata: title, description, dependencies, date
  demo.tsx       the preview, never shipped
  docs.mdx       optional docs shown on the item page, never shipped
  <name>.tsx     shipped code, plus any other files in the folder
content/docs/    site docs pages (MDX)
app/             the Farm.js site (App Router-style routes)
components/site/ site-only UI
scripts/         registry indexer and scaffolder
```

Scenarios and kinds: `landing` → `components | sections | pages`, `dashboard` →
`components | blocks | pages`.

## Commands

| Command                             | What it does                                |
| ----------------------------------- | ------------------------------------------- |
| `pnpm dev`                          | Index the registry and start the dev server |
| `pnpm new <scenario> <kind> <name>` | Scaffold an item                            |
| `pnpm registry:index`               | Re-index after adding or renaming an item   |
| `pnpm registry:build`               | Build `public/ui/r/*.json`                  |
| `pnpm registry:validate`            | Validate the registry with the shadcn CLI   |
| `pnpm check`                        | Lint, format check and typecheck            |
| `pnpm build`                        | Production build                            |

## Writing registry code

People install these files into their own projects, so they must work outside this repo.

- Folder name = item name: kebab-case and unique across the whole registry.
- Style with Tailwind and shadcn tokens (`bg-background`, `text-foreground`, `border`...). Don't use
  site tokens (`text-heading-*`, `sand-*`, `ink-*`, `eyebrow`); installers don't have them. Extra
  tokens go in `cssVars` in `item.ts` and are mirrored in `app/globals.css`.
- Import `cn` from `@/lib/utils`. Import another item by its full path
  (`@/registry/dashboard/components/button/button`) and list it in `registryDependencies`. Use
  relative imports between files of the same item.
- List every npm package in `dependencies`.
- Add `'use client'` only to the files that need it.
- Respect `prefers-reduced-motion`.
- Named exports for shipped code, a default export for `demo.tsx`.
- No comments unless the logic is genuinely non-obvious.

Never edit generated files: `registry.json`, `registry/__index__.ts`, `public/ui/r`.

## Writing docs

Docs are MDX, so you can use site components inside Markdown. See the
[Writing docs](https://tomei.zubeyr.dev/docs/writing-docs) page (`content/docs/writing-docs.mdx`)
for the full list.

- A site page: add `content/docs/<slug>.mdx` with `title`, `description` and `order` frontmatter.
- Item docs: add `docs.mdx` next to `item.ts`, then run `pnpm registry:index`.

```mdx
## Validation

<Callout type="tip">Pass a Zod schema as `schema`.</Callout>

<Preview name="record-form" />
```

## Commits

We use [Conventional Commits](https://www.conventionalcommits.org), enforced by commitlint:

```
feat(dashboard): add date range picker
fix(landing): keep the hero marquee paused with reduced motion
docs: explain registry dependencies
chore: bump shadcn
```

Use a scope (`landing`, `dashboard`, `site`, `registry`, `docs`) when it helps. Pre-commit hooks
run ESLint and Prettier on staged files.

## Pull requests

1. Fork the repo and branch off `main` (`fix/record-form-dates`, `docs/theming`).
2. Keep the PR focused on one change.
3. Run `pnpm check` and `pnpm build`, plus `pnpm registry:validate` if you touched `registry/`. All must pass.
4. For anything visual, add before and after screenshots in light and dark mode.
5. Describe what changed and why, and link the issue.

A maintainer reviews every PR. Small follow-up commits are fine, and we squash on merge.

## Reporting bugs

Open an issue with the item name, what you expected, what happened, and a minimal reproduction
(a code snippet or a repo link). Include your React, Tailwind and shadcn versions.
