import { CreditCard, FileText, MapPin, ShoppingBag, User } from 'lucide-react'

import type {
  FormSection,
  FormValues,
} from '@/registry/dashboard/components/record-form/record-form'

import type { EditItem, Product } from './line-item-editor'

export const sections: FormSection[] = [
  {
    id: 'order',
    title: 'Order details',
    icon: <ShoppingBag />,
    columns: 2,
    defaultOpen: true,
    fields: [
      {
        name: 'stage',
        label: 'Stage',
        type: 'select',
        required: true,
        options: ['Draft', 'Confirmed', 'Invoiced', 'Paid', 'Fulfilled'],
      },
      {
        name: 'owner',
        label: 'Owner',
        type: 'select',
        options: ['Sam Rivera', 'Alex Chen', 'Priya Nair', 'Unassigned'],
      },
      { name: 'priority', label: 'Priority', type: 'radio', options: ['Low', 'Normal', 'High'] },
      {
        name: 'due',
        label: 'Delivery date',
        type: 'date',
        min: 'today',
        messages: { min: 'Delivery can’t be in the past' },
      },
      {
        name: 'source',
        label: 'Source',
        type: 'select',
        options: ['Online store', 'Phone', 'Email', 'Sales rep', 'Wholesale portal'],
      },
      {
        name: 'po',
        label: 'PO number',
        type: 'text',
        pattern: '^PO-\\d{4,}$',
        placeholder: 'PO-1234',
        messages: { pattern: 'Use the format PO-1234', required: 'Wholesale orders need a PO' },
        requiredWhen: { field: 'source', is: 'Wholesale portal' },
      },
      {
        name: 'tags',
        label: 'Tags',
        type: 'multiselect',
        creatable: true,
        options: ['VIP', 'Wholesale', 'Gift', 'Rush'],
        span: 2,
      },
      {
        name: 'giftMessage',
        label: 'Gift message',
        type: 'textarea',
        maxLength: 200,
        span: 2,
        visibleWhen: { field: 'tags', is: 'Gift' },
      },
    ],
  },
  {
    id: 'customer',
    title: 'Customer',
    icon: <User />,
    columns: 2,
    defaultOpen: true,
    fields: [
      { name: 'name', label: 'Full name', type: 'text', required: true },
      { name: 'company', label: 'Company', type: 'text' },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'phone', label: 'Phone', type: 'phone' },
    ],
  },
  {
    id: 'shipping',
    title: 'Shipping address',
    icon: <MapPin />,
    columns: 2,
    fields: [
      { name: 'address', label: 'Address', type: 'text', span: 2 },
      { name: 'city', label: 'City', type: 'text' },
      { name: 'region', label: 'State / region', type: 'text' },
      { name: 'postal', label: 'Postal code', type: 'text' },
      {
        name: 'country',
        label: 'Country',
        type: 'select',
        options: ['United States', 'Canada', 'United Kingdom', 'Germany', 'Ethiopia'],
      },
    ],
  },
  {
    id: 'pricing',
    title: 'Pricing',
    icon: <CreditCard />,
    columns: 2,
    fields: [
      { name: 'code', label: 'Discount code', type: 'text' },
      {
        name: 'discount',
        label: 'Discount (%)',
        type: 'number',
        min: 0,
        max: 100,
        visibleWhen: { field: 'code', filled: true },
      },
      {
        name: 'method',
        label: 'Shipping method',
        type: 'select',
        options: ['Standard', 'Express', 'Overnight', 'Local pickup'],
      },
      {
        name: 'shipping',
        label: 'Shipping cost',
        type: 'currency',
        min: 0,
        visibleWhen: { field: 'method', not: 'Local pickup' },
      },
    ],
  },
  {
    id: 'notes',
    title: 'Notes',
    icon: <FileText />,
    fields: [
      {
        name: 'note',
        label: 'Internal note',
        type: 'textarea',
        hint: 'Only your team can see this',
      },
    ],
  },
]

export const values: FormValues = {
  stage: 'Confirmed',
  owner: 'Sam Rivera',
  priority: 'Normal',
  due: '',
  source: 'Online store',
  po: '',
  tags: ['VIP'],
  name: 'Jordan Ellis',
  company: '',
  email: 'jordan@example.com',
  phone: '+1 718 555 0142',
  address: '184 Kent Ave',
  city: 'Brooklyn',
  region: 'NY',
  postal: '11249',
  country: 'United States',
  code: 'WELCOME10',
  discount: '10',
  method: 'Express',
  shipping: '4.99',
  note: '',
  giftMessage: '',
}

export const totalFields = { discount: 'discount', shipping: 'shipping', code: 'code' }

export const badges: { label: string; tone?: 'neutral' | 'warning' }[] = [
  { label: 'Paid' },
  { label: 'Unfulfilled', tone: 'warning' },
]

export const items: EditItem[] = [
  {
    id: 'sneakers',
    name: 'Canvas Sneakers',
    variant: '10.5 US',
    price: 235,
    quantity: 1,
    color: '#d6cfc4',
  },
  {
    id: 'shirt',
    name: 'Button-down Shirt',
    variant: 'Blue / XL',
    price: 65,
    quantity: 2,
    color: '#3b4a6b',
  },
  {
    id: 'beanie',
    name: 'Knit Beanie',
    variant: 'One size',
    price: 32.5,
    quantity: 1,
    color: '#6b7a4f',
  },
]

export const catalog: Product[] = [
  ...items.map(({ id, name, variant, price, color }) => ({ id, name, variant, price, color })),
  { id: 'tote', name: 'Canvas Tote', variant: 'Natural', price: 28, color: '#e8dcc2' },
  { id: 'socks', name: 'Wool Socks', variant: '3 pack', price: 24, color: '#8a5a44' },
  { id: 'jacket', name: 'Chore Jacket', variant: 'Olive / L', price: 189, color: '#55613d' },
  { id: 'cap', name: 'Six-panel Cap', variant: 'Navy', price: 38, color: '#1f2a44' },
]
