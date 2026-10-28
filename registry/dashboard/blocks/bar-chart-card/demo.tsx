import { BarChartCard } from './bar-chart-card'

const data = [
  { label: 'Jun 6', current: 8200, previous: 6100 },
  { label: 'Jun 14', current: 5600, previous: 4900 },
  { label: 'Jun 22', current: 4800, previous: 3900 },
  { label: 'Jun 30', current: 3400, previous: 2600 },
  { label: 'Jul 5', current: 1900, previous: 1200 },
]

export default function Demo() {
  return (
    <div className="grid min-h-svh place-items-center p-8">
      <BarChartCard
        title="Net sales"
        value="$15,000"
        change={5}
        data={data}
        currentLabel="Net sales"
        previousLabel="Comparison"
        formatOptions={{ style: 'currency', currency: 'USD', maximumFractionDigits: 0 }}
        className="w-full max-w-lg"
      />
    </div>
  )
}
