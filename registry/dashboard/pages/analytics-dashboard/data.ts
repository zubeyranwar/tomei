const wave = (i: number, base: number, amp: number, freq: number, phase = 0) =>
  Math.round(base + amp * Math.sin(i / freq + phase) + amp * 0.25 * Math.cos(i / 1.3))

export const totalSales = Array.from({ length: 30 }, (_, i) => ({
  label: `Day ${i + 1}`,
  current: wave(i, 5200, 3600, 2.2),
  previous: wave(i, 4300, 2400, 3.4, 1),
}))

export const netSales = [
  { label: 'Week 1', current: 8200, previous: 6100 },
  { label: 'Week 2', current: 5600, previous: 4900 },
  { label: 'Week 3', current: 4800, previous: 3900 },
  { label: 'Week 4', current: 3400, previous: 2600 },
  { label: 'Week 5', current: 1900, previous: 1200 },
]

export const devices = [
  { name: 'Mobile', value: 10000, change: 5 },
  { name: 'Desktop', value: 8000, change: 3 },
  { name: 'Tablet', value: 6000, change: 1 },
  { name: 'Other', value: 4000, change: 4 },
  { name: 'TV', value: 1200, change: -2 },
]

export const locations = [
  { name: 'Downtown', value: '$11.6K', change: 20 },
  { name: 'Riverside', value: '$7.5K', change: 14 },
  { name: 'Harbor', value: '$2.1K', change: 20 },
  { name: 'Old Town', value: '$987', change: -4 },
  { name: 'Hillcrest', value: '$261', change: 12 },
]

export const products = [
  { name: 'Wool cap', current: 10000, previous: 8200, change: 8 },
  { name: 'Crewneck', current: 9750, previous: 9100, change: 2 },
  { name: 'Blouse', current: 7500, previous: 6800, change: 4 },
  { name: 'T-shirt', current: 8500, previous: 7300, change: 12 },
  { name: 'Long sleeve', current: 6000, previous: 5600, change: 6 },
]

export const visitors = Array.from({ length: 30 }, (_, i) => ({
  label: `Day ${i + 1}`,
  current: wave(i, 2600, 1200, 3, 0.5),
  previous: wave(i, 2100, 900, 2.6, 2),
}))
