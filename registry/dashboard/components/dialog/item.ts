import { defineItem } from '@/registry/define'

export default defineItem({
  title: 'Dialog',
  description:
    'A modal dialog and a confirm dialog: focus moves in and back out, Tab stays inside, Escape and outside clicks close, background scroll locks, nested dialogs stack, and it slides up as a sheet on phones.',
  categories: ['overlays'],
  dependencies: ['lucide-react'],
  cssVars: {
    light: {
      'shadow-overlay': '0 16px 40px rgb(0 0 0 / 0.12), 0 0 0 1px rgb(0 0 0 / 0.08)',
    },
    dark: {
      'shadow-overlay': '0 16px 40px rgb(0 0 0 / 0.5), 0 0 0 1px #0e0e0e',
    },
  },
  date: '2026-11-01',
})
