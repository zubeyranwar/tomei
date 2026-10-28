import { defineItem } from '@/registry/define'

export default defineItem({
  title: 'Button',
  description:
    'A tactile dashboard button with layered inset shadows. Primary, secondary, ghost and danger variants, icon sizes and a loading state.',
  categories: ['buttons'],
  cssVars: {
    light: {
      'shadow-button':
        '0 1px 2px rgb(0 0 0 / 0.05), 0 0 0 1px rgb(0 0 0 / 0.1), inset 0 1px 0 rgb(255 255 255 / 0.8)',
      'shadow-button-primary':
        '0 1px 2px rgb(0 0 0 / 0.2), 0 0 0 1px var(--primary), inset 0 1px 0 rgb(255 255 255 / 0.14)',
    },
    dark: {
      'shadow-button':
        '0 0 0 1px rgb(0 0 0 / 0.4), inset 0 1px 0 rgb(255 255 255 / 0.1), inset 0 0 0 1px rgb(255 255 255 / 0.06)',
      'shadow-button-primary':
        '0 1px 2px rgb(0 0 0 / 0.32), 0 0 0 1px rgb(255 255 255 / 0.9), inset 0 -2px 4px rgb(0 0 0 / 0.06)',
    },
  },
  date: '2026-10-28',
})
