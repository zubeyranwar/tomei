import { MagneticButton } from '@/registry/landing/components/magnetic-button/magnetic-button'
import { getContributors } from '@/lib/contributors'
import { githubUrl } from '@/lib/site'

export async function Contributors() {
  const contributors = await getContributors()

  return (
    <section className="container-page flex flex-col items-center gap-10 py-24 text-center">
      <p className="eyebrow text-muted-foreground">Contributors</p>
      <h2 className="max-w-3xl text-heading-2 leading-none">
        Built in the open, by people who care
      </h2>
      <ul className="flex max-w-3xl flex-wrap justify-center gap-2">
        {contributors.map((c) => (
          <li key={c.login}>
            <a href={c.html_url} title={c.login} className="group block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={c.avatar_url}
                alt={c.login}
                width={64}
                height={64}
                loading="lazy"
                className="size-16 rounded-full bg-card grayscale transition-[filter,scale] duration-500 group-hover:scale-110 group-hover:grayscale-0"
              />
            </a>
          </li>
        ))}
      </ul>
      <MagneticButton href={`${githubUrl}/blob/main/AGENT.md`} arrow>
        Contribute
      </MagneticButton>
    </section>
  )
}
