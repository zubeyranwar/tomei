import { DonutChartCard } from './donut-chart-card'

const data = [
  { name: 'Mobile', value: 10000, change: 5 },
  { name: 'Desktop', value: 8000, change: 3 },
  { name: 'Tablet', value: 6000, change: 1 },
  { name: 'Other', value: 4000, change: 4 },
  { name: 'TV', value: 1200, change: -2 },
  { name: 'Console', value: 800 },
]

export default function Demo() {
  return (
    <div className="grid min-h-svh place-items-center p-8">
      <DonutChartCard
        title="Sessions by device type"
        change={8}
        data={data}
        className="w-full max-w-md"
      />
    </div>
  )
}
