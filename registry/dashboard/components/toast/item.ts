import { defineItem } from '@/registry/define'

export default defineItem({
  title: 'Toast',
  description:
    'Notifications you can raise from anywhere with toast(): success, error, warning, info and loading tones, a promise helper for saves, action buttons like Undo, pause on hover, stacking with “clear all”, and screen-reader announcements.',
  categories: ['feedback', 'overlays'],
  dependencies: ['lucide-react'],
  cssVars: {
    light: {
      'shadow-overlay': '0 16px 40px rgb(0 0 0 / 0.12), 0 0 0 1px rgb(0 0 0 / 0.08)',
    },
    dark: {
      'shadow-overlay': '0 16px 40px rgb(0 0 0 / 0.5), 0 0 0 1px #0e0e0e',
    },
  },
  docs: 'Mount <Toaster /> once near the root of your app, then call toast("Saved") from anywhere.',
  date: '2026-11-01',
})
