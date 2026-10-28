import { cn } from '@/lib/utils'

export type StackedCard = {
  title: string
  description?: string
  points?: string[]
  icon?: React.ReactNode
  className?: string
}

type StackedCardsProps = {
  cards: StackedCard[]
  step?: number
  top?: string
  className?: string
}

const tones = [
  'bg-card text-card-foreground',
  'bg-secondary text-secondary-foreground',
  'bg-primary text-primary-foreground',
]

const pad = (i: number) => String(i + 1).padStart(2, '0')

export function StackedCards({ cards, step = 5.75, top = '20vh', className }: StackedCardsProps) {
  return (
    <div className={cn('flex flex-col', className)}>
      {cards.map((card, index) => (
        <div
          key={card.title}
          className={cn(
            'sticky rounded-t-3xl px-6 md:px-10',
            card.className ?? tones[index % tones.length],
          )}
          style={{
            top: `calc(${top} + ${index * step}em)`,
            paddingBottom: `${(cards.length - index) * step}em`,
          }}
        >
          <div className="flex items-center gap-4 text-4xl font-semibold md:grid md:grid-cols-12 md:gap-10 md:text-6xl">
            <span className="md:col-span-2">({pad(index)})</span>
            <h3 className="py-7 md:col-span-6 md:col-start-6">{card.title}</h3>
            {card.icon && (
              <span className="hidden justify-self-end opacity-60 xl:flex">{card.icon}</span>
            )}
          </div>

          <div className="flex min-h-[30vh] flex-col pt-1 md:grid md:min-h-[40vh] md:grid-cols-12 md:gap-10">
            <div className="flex flex-col gap-5 pt-5 md:col-span-7 md:col-start-6">
              {card.description && (
                <p className="max-w-[40ch] text-base font-medium text-balance opacity-70">
                  {card.description}
                </p>
              )}
              {card.points?.length ? (
                <ul className="divide-y divide-current/15 text-2xl font-bold">
                  {card.points.map((point, i) => (
                    <li key={point} className="flex items-start gap-5 py-2 xl:gap-8 xl:py-3">
                      <span className="font-mono text-base leading-[200%] font-medium opacity-60">
                        {pad(i)}
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
