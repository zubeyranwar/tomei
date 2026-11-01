import { defineItem } from '@/registry/define'

export default defineItem({
  title: 'Date Picker',
  description:
    'Date, date range, date + time, time and month pickers that share the Date Range Picker’s calendar and panel: typed entry in plain words, dayjs-powered locale formatting, translatable labels, min and max limits, Today, Now and This month shortcuts, clear, keyboard navigation and a panel that flips to stay on screen.',
  categories: ['inputs', 'date'],
  dependencies: ['lucide-react', 'dayjs'],
  registryDependencies: ['date-range-picker'],
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
