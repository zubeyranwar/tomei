import { site } from '@/lib/site'

export function Statement() {
  return (
    <section className="container-page py-32 text-center">
      <p className="mx-auto max-w-5xl text-heading-3 leading-[1.1] tracking-tight">
        {site.name} is a growing registry of motion-first UI. The elements, techniques and code
        behind award-level sites, ready to drop into your React project.
      </p>
    </section>
  )
}
