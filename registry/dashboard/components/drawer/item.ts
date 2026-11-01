import { defineItem } from '@/registry/define'

export default defineItem({
  title: 'Drawer',
  description:
    'A side or bottom drawer for record details and quick edits: header with actions, scrolling body, sticky footer, focus trap, Escape and outside-click close, scroll lock and a bottom sheet on phones.',
  categories: ['overlays'],
  dependencies: ['lucide-react'],
  registryDependencies: ['dialog'],
  date: '2026-11-01',
})
