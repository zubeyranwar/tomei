import { site } from '@/lib/site'

const questions = [
  {
    q: `Is ${site.name} free?`,
    a: 'Yes. Browse, install and copy anything in the registry.',
  },
  {
    q: 'What do I need to use it?',
    a: 'A React project with Tailwind CSS v4. For the one-command install, run `npx shadcn@latest init` first.',
  },
  {
    q: 'Does it work outside Next.js?',
    a: 'Yes. Items are plain React components, so Vite, React Router, Astro islands and others all work.',
  },
  {
    q: 'What is the difference between Landing and Dashboard?',
    a: 'They are scenarios. Landing items aim for motion, typography and character; Dashboard items for dense, practical product UI.',
  },
  {
    q: 'What does "Copy prompt" do?',
    a: 'It copies a ready-made prompt with the full source, dependencies and setup steps, so an AI assistant can add the item for you.',
  },
  {
    q: 'Can I contribute?',
    a: 'Yes. Read AGENT.md in the repository, scaffold an item with `pnpm new`, and open a pull request.',
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
