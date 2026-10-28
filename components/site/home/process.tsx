const steps = [
  {
    title: 'Pick a scenario',
    body: 'Landing pages want motion and character, dashboards want density and clarity. Everything is grouped by where it lives.',
  },
  {
    title: 'Install with one command',
    body: 'Every item is a shadcn registry item. Run the command and the files, dependencies and imports land in your project.',
  },
  {
    title: 'Or copy the prompt',
    body: 'Not on shadcn? Hand your AI assistant the prompt: full source, dependencies and setup in one paste.',
  },
  {
    title: 'Own the code',
    body: 'No package to update, no black box. It is your file now, so bend it until it fits the brand.',
  },
]

export function Process() {
  return (
    <section className="container-page grid gap-12 py-32 md:grid-cols-[1fr_2fr]">
      <h2 className="text-heading-2 leading-none">How it works</h2>
      <ol>
        {steps.map((step, i) => (
          <li key={step.title} className="grid gap-4 border-t py-8 md:grid-cols-[auto_1fr_1.4fr]">
            <span className="w-10 pt-1.5 eyebrow text-muted-foreground">0{i + 1}</span>
            <h3 className="text-heading-4 leading-tight">{step.title}</h3>
            <p className="text-lg text-muted-foreground">{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
