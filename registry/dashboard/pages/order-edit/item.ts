import { defineItem } from '@/registry/define'

export default defineItem({
  title: 'Order Edit',
  description:
    'A CRM record edit page: a clickable stage path, editable line items with a product picker, custom items, price and quantity edits and restore, live totals with balance due or refund, a schema-driven record form, a review of unsaved changes, undo/redo and a floating Cancel and Save toolbar. Pass your own sections, values, items and catalog to reuse it for deals, quotes or invoices.',
  categories: ['forms', 'crm'],
  dependencies: ['lucide-react'],
  registryDependencies: ['sidebar', 'button', 'badge', 'record-form', 'use-history', 'toast'],
  date: '2026-11-01',
})
