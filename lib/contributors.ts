import { site } from '@/lib/site'

export type Contributor = {
  login: string
  avatar_url: string
  html_url: string
  contributions: number
}

const fallback: Contributor[] = [
  {
    login: site.repo.split('/')[0],
    avatar_url: `https://github.com/${site.repo.split('/')[0]}.png`,
    html_url: site.authorUrl,
    contributions: 0,
  },
]

export async function getContributors(): Promise<Contributor[]> {
  try {
    const res = await fetch(`https://api.github.com/repos/${site.repo}/contributors?per_page=48`, {
      next: { revalidate: 86_400 },
    })
    if (!res.ok) return fallback
    const data: Contributor[] = await res.json()
    return data.length ? data : fallback
  } catch {
    return fallback
  }
}
