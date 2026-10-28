import { Badge } from '@/registry/dashboard/components/badge/badge'
import type { Column, Filter, View } from '@/registry/dashboard/components/data-table/data-table'

export type Order = {
  id: string
  placed: number
  date: string
  customer: string
  total: number
  payment: 'Paid' | 'Payment pending' | 'Refunded'
  fulfillment: 'Unfulfilled' | 'Fulfilled' | 'On hold'
  items: number
}

const names = [
  'Ava Brooks',
  'Leo Turner',
  'Mia Patel',
  'Noah Kim',
  'Zoe Carter',
  'Eli Morgan',
  'Ivy Chen',
]
const payments: Order['payment'][] = ['Paid', 'Paid', 'Payment pending', 'Paid', 'Refunded']
const fulfillments: Order['fulfillment'][] = ['Unfulfilled', 'Fulfilled', 'On hold', 'Unfulfilled']

export const orders: Order[] = Array.from({ length: 40 }, (_, i) => ({
  id: `#${2050 - i}`,
  placed: 16 - i,
  date:
    i < 4
      ? `Today at ${9 - i * 2}:${String(55 - i * 7).padStart(2, '0')} a.m.`
      : `${i - 3} ${i === 4 ? 'day' : 'days'} ago`,
  customer: names[i % names.length],
  total: [98.99, 396.84, 54.2, 1210.5, 18][i % 5],
  payment: payments[i % payments.length],
  fulfillment: fulfillments[i % fulfillments.length],
  items: (i % 3) + 1,
}))

const paymentTone = {
  Paid: 'neutral',
  'Payment pending': 'attention',
  Refunded: 'critical',
} as const
const fulfillmentTone = {
  Unfulfilled: 'warning',
  Fulfilled: 'success',
  'On hold': 'warning',
} as const
const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

export const columns: Column<Order>[] = [
  {
    key: 'order',
    header: 'Order',
    sortValue: (o) => o.placed,
    cell: (o) => <span className="font-semibold">{o.id}</span>,
  },
  { key: 'date', header: 'Date', sortValue: (o) => o.placed, cell: (o) => o.date },
  { key: 'customer', header: 'Customer', sortValue: (o) => o.customer, cell: (o) => o.customer },
  {
    key: 'total',
    header: 'Total',
    align: 'right',
    sortValue: (o) => o.total,
    cell: (o) => currency.format(o.total),
  },
  {
    key: 'payment',
    header: 'Payment status',
    cell: (o) => (
      <Badge tone={paymentTone[o.payment]} indicator={o.payment === 'Paid' ? 'dot' : 'ring'}>
        {o.payment}
      </Badge>
    ),
  },
  {
    key: 'fulfillment',
    header: 'Fulfillment status',
    cell: (o) => (
      <Badge
        tone={fulfillmentTone[o.fulfillment]}
        indicator={o.fulfillment === 'Fulfilled' ? 'dot' : 'ring'}
      >
        {o.fulfillment}
      </Badge>
    ),
  },
  {
    key: 'items',
    header: 'Items',
    sortValue: (o) => o.items,
    cell: (o) => `${o.items} ${o.items === 1 ? 'item' : 'items'}`,
  },
]

export const views: View<Order>[] = [
  { label: 'Unfulfilled', filter: (o) => o.fulfillment === 'Unfulfilled' },
  { label: 'Unpaid', filter: (o) => o.payment === 'Payment pending' },
  { label: 'On hold', filter: (o) => o.fulfillment === 'On hold' },
  { label: 'Refunded', filter: (o) => o.payment === 'Refunded' },
]

export const filters: Filter<Order>[] = [
  {
    key: 'payment',
    label: 'Payment status',
    options: ['Paid', 'Payment pending', 'Refunded'],
    value: (o) => o.payment,
  },
  {
    key: 'fulfillment',
    label: 'Fulfillment status',
    options: ['Unfulfilled', 'Fulfilled', 'On hold'],
    value: (o) => o.fulfillment,
  },
]

const spark = (seed: number) =>
  Array.from({ length: 14 }, (_, i) => Math.round(4 + 3 * Math.sin(i / 2 + seed) + i / 3))

export const stats = [
  { label: 'Orders', value: '1,271', hint: 'Last 30 days', change: 45, spark: spark(1) },
  { label: 'Ordered items', value: '31', hint: '24 the month before', change: 29 },
  {
    label: 'Returned items',
    value: '6',
    hint: 'Within 30 days of delivery',
    info: 'Items marked as returned',
  },
  { label: 'Fulfilled', value: '41', hint: 'Shipped or picked up', change: 11, spark: spark(3) },
  { label: 'Delivered', value: '22', hint: 'Confirmed by the carrier', change: 45 },
]
