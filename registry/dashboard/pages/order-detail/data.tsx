import type { TimelineEvent } from '@/registry/dashboard/blocks/timeline/timeline'

import type { LineItem } from './line-items'

const swatch = (color: string) => <span className="size-full" style={{ background: color }} />

export const items: LineItem[] = [
  {
    id: '1',
    name: 'Canvas Sneakers',
    variant: '10.5 US',
    price: 235,
    quantity: 1,
    image: swatch('#d6cfc4'),
  },
  {
    id: '2',
    name: 'Button-down Shirt',
    variant: 'Blue / XL',
    price: 65,
    quantity: 2,
    image: swatch('#3b4a6b'),
  },
  {
    id: '3',
    name: 'Knit Beanie',
    variant: 'One size',
    price: 32.5,
    quantity: 1,
    image: swatch('#6b7a4f'),
  },
]

export const customer = {
  name: 'Jordan Ellis',
  email: 'jordan@example.com',
  orders: 4,
  address: ['Jordan Ellis', '184 Kent Ave', 'Brooklyn, NY', 'United States'],
}

export const tags = ['VIP', 'Wholesale']

export const events: TimelineEvent[] = [
  { id: '1', content: 'Order confirmation email was sent to Jordan Ellis.', time: '1:36 PM' },
  { id: '2', content: 'A $322.49 payment was processed on Visa •••• 3840.', time: '1:36 PM' },
  { id: '3', content: 'Jordan Ellis placed this order on the Online Store.', time: '1:35 PM' },
]
