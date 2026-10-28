import { defineItem } from '@/registry/define'

export default defineItem({
  title: 'Stat Card',
  description:
    'A compact metric card: uppercase label with an optional info hint, the value, a supporting line, an optional change and an optional bar sparkline.',
  categories: ['metrics', 'cards'],
  cssVars: {
    light: { 'shadow-card': '0 1px 2px rgb(0 0 0 / 0.04), 0 0 0 1px rgb(0 0 0 / 0.07)' },
    dark: {
      'shadow-card':
        '0 4px 4px rgb(42 42 42 / 0.32), 0 0 0 1px #0e0e0e, inset 0 1px 0 rgb(255 255 255 / 0.08), inset 0 0 0 1px rgb(255 255 255 / 0.08)',
    },
  },
  date: '2026-10-28',
})
