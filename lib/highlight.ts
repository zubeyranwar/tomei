import { codeToHtml } from 'shiki'

export const highlight = (code: string, path: string) =>
  codeToHtml(code.trimEnd(), {
    lang: path.split('.').pop() ?? 'tsx',
    themes: { light: 'github-light', dark: 'vesper' },
    defaultColor: 'light',
  })
