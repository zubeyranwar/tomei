import { defineItem } from '@/registry/define'

export default defineItem({
  title: 'Image Edit',
  description:
    'A product image editor: light and colour adjustments, stackable filter presets, crop with aspect ratios, zoom, straighten, rotate, flip and drag to reposition, hold-to-compare, undo/redo and a floating Cancel and Save toolbar.',
  categories: ['media', 'editor'],
  dependencies: ['lucide-react'],
  registryDependencies: ['sidebar', 'button', 'use-history'],
  date: '2026-10-29',
})
