import { defineItem } from '@/registry/define'

export default defineItem({
  title: 'Sidebar',
  description:
    'A dashboard sidebar for light and dark mode: brand header, titled groups, counts and external links.',
  categories: ['navigation', 'layout'],
  cssVars: {
    light: {
      'shadow-button':
        '0 1px 2px rgb(0 0 0 / 0.05), 0 0 0 1px rgb(0 0 0 / 0.1), inset 0 1px 0 rgb(255 255 255 / 0.8)',
    },
    dark: {
      'shadow-button':
        '0 0 0 1px rgb(0 0 0 / 0.4), inset 0 1px 0 rgb(255 255 255 / 0.1), inset 0 0 0 1px rgb(255 255 255 / 0.06)',
    },
  },
  date: '2026-10-28',
})
