# Tomei

Award-level components, sections and pages for landing pages and dashboards, distributed as a
[shadcn registry](https://ui.shadcn.com/docs/registry).

```bash
pnpm dlx shadcn@latest add https://tomei.zubeyr.dev/ui/r/<name>.json
# or, with the namespace configured in components.json
pnpm dlx shadcn@latest add @tomei/<name>
```

## Development

```bash
pnpm install
pnpm dev
pnpm new landing components magnetic-button
```

See [AGENT.md](./AGENT.md) for structure and rules.

### Fonts

The site uses PP Neue Montreal (personal-use licence, not redistributable), so the files are
gitignored. Copy the `.woff2` builds into `public/fonts/`. Without them, the site falls back to
metric-matched Arial.

## Contributing

Pre-commit hooks run ESLint and Prettier on staged files; commit messages follow
[Conventional Commits](https://www.conventionalcommits.org). Run `pnpm check` before opening a PR.
