import { LineChartCard } from './line-chart-card'

const data = Array.from({ length: 30 }, (_, i) => ({
  label: `Jun ${i + 6}`,
  current: Math.round(5200 + 3600 * Math.sin(i / 2.2) + 900 * Math.cos(i / 1.3)),
  previous: Math.round(4300 + 2400 * Math.sin(i / 3.4 + 1) + 700 * Math.cos(i / 1.7)),
}))

export default function Demo() {
  return (
    <div className="grid min-h-svh place-items-center p-8">
      <LineChartCard
        title="Total sales"
        value="$250,000"
        change={42}
        data={data}
        currentLabel="Jun 6–Jul 5, 2026"
        previousLabel="May 7–Jun 5, 2026"
        formatOptions={{ style: 'currency', currency: 'USD', maximumFractionDigits: 0 }}
        className="w-full max-w-lg"
      />
    </div>
  )
}
