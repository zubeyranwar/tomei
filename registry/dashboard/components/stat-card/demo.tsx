import { StatCard } from './stat-card'

const spark = (seed: number) =>
  Array.from({ length: 14 }, (_, i) => Math.round(4 + 3 * Math.sin(i / 2 + seed) + i / 3))

export default function Demo() {
  return (
    <div className="grid w-full max-w-5xl grid-cols-2 gap-3 md:grid-cols-4">
      <StatCard
        label="All users"
        value="1,633"
        hint="Registered accounts"
        info="Every account ever created"
      />
      <StatCard label="New today" value="242" hint="145 yesterday" change={67} />
      <StatCard
        label="Active (30d)"
        value="905"
        hint="Active in the last 30 days"
        spark={spark(1)}
      />
      <StatCard label="Churned" value="44.6%" hint="728 of all users" change={-3} />
    </div>
  )
}
