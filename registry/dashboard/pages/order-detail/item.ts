import { defineItem } from '@/registry/define'

export default defineItem({
  title: 'Order Detail',
  description:
    'A record detail page: header with status badges and navigation, a customer note, line items, a payment summary and a side panel with contact, address, conversion, tags and timeline.',
  categories: ['detail', 'layout'],
  dependencies: ['lucide-react'],
  registryDependencies: ['sidebar', 'button', 'badge', 'timeline'],
  date: '2026-10-29',
})
