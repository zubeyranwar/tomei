import { defineItem } from '@/registry/define'

export default defineItem({
  title: 'Popover',
  description:
    'A lightweight popover anchored to any trigger: opens beside or above it, stays on screen and escapes scrolling containers, closes on outside click or Escape, and hands a close() to its content.',
  categories: ['overlays'],
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
