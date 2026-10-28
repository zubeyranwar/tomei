import { Card, LegendItem } from './card'

export default function Demo() {
  return (
    <Card
      title="Total sales"
      value="$250,000"
      change={42}
      className="w-full max-w-md"
      legend={
        <>
          <LegendItem color="var(--chart-1)">This period</LegendItem>
          <LegendItem color="var(--chart-2)" dashed>
            Previous period
          </LegendItem>
        </>
      }
    >
      <div className="grid h-40 place-items-center rounded-lg bg-muted text-sm text-muted-foreground">
        Your chart here
      </div>
    </Card>
  )
}
