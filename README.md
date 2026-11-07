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

The site uses PP Neue Montreal, licensed for this site and served from `public/fonts/`. The fonts
are for the Tomei site only: don't reuse them in other projects, and don't reference them from
registry items.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). Docs are MDX: site pages live in `content/docs/`, item
docs in a `docs.mdx` next to the item.
