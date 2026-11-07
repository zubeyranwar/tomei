import { site } from '@/lib/site'

const questions = [
  {
    q: `Is ${site.name} free?`,
    a: 'Yes. Browse, install and edit anything in the registry.',
  },
  {
    q: 'What do I need to use it?',
    a: 'A React project with Tailwind CSS v4 and shadcn set up. If you haven’t yet, run `npx shadcn@latest init` first.',
  },
  {
    q: 'How do I install an item?',
    a: `Copy the command from its page, or add the registry to components.json and run \`npx shadcn@latest add ${site.namespace}/<name>\`. Dependencies and other ${site.name} items it needs come with it.`,
  },
  {
    q: 'Which frameworks does it work with?',
    a: 'Any React setup: Next.js, Vite, React Router, Farm.js, Astro islands and more. Items are plain components styled with shadcn tokens.',
  },
  {
    q: 'Can I change the code?',
    a: 'Yes, it’s yours. Files are copied into `components/<scenario>` in your project, so edit them like any other component.',
  },
  {
    q: 'What is the difference between Landing and Dashboard?',
    a: 'They are scenarios. Landing items aim for motion, typography and character; Dashboard items for dense, practical product UI.',
  },
  {
    q: 'Can I contribute?',
    a: 'Yes. Read CONTRIBUTING.md in the repository. Fixes, docs and tooling are welcome straight away; open an issue first for new items.',
  },
]

export function Faq() {
  return (
    <section className="container-page grid gap-12 py-32 md:grid-cols-[1fr_2fr]">
      <h2 className="text-heading-2 leading-none">Questions</h2>
      <div>
        {questions.map(({ q, a }) => (
          <details
            key={q}
            className="group border-t py-6 [&_summary::-webkit-details-marker]:hidden"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-heading-4 leading-tight">
              {q}
              <span className="text-muted-foreground transition-transform duration-500 ease-(--ease-expo) group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              {a.split('`').map((part, i) =>
                i % 2 ? (
                  <code key={i} className="rounded bg-card px-1 font-mono text-base">
                    {part}
                  </code>
                ) : (
                  part
                ),
              )}
            </p>
          </details>
        ))}
      </div>
    </section>
  )
}
