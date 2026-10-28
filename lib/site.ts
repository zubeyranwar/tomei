export const site = {
  name: 'Tomei',
  description: 'Award-level components, sections and pages for landing pages and dashboards.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tomei.zubeyr.dev',
  author: 'Zubeyr',
  authorUrl: 'https://zubeyr.dev',
  repo: 'zubeyranwar/tomei',
  namespace: '@tomei',
  registryPath: '/ui/r',
}

export const registryUrl = (name: string) => `${site.url}${site.registryPath}/${name}.json`

export const githubUrl = `https://github.com/${site.repo}`
