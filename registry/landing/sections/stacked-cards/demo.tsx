import { StackedCards } from './stacked-cards'

const colors = [
  'bg-white text-neutral-950',
  'bg-[#d4ff3f] text-neutral-950',
  'bg-[#6b4eff] text-white',
  'bg-neutral-950 text-white',
]

const cards = colors.map((className, i) => ({
  title: `Card title ${i + 1}`,
  description: 'A short description of this card. Replace it with your own content.',
  points: ['First point', 'Second point', 'Third point'],
  className,
}))

export default function Demo() {
  return <StackedCards cards={cards} className="px-4 pt-[20vh] md:px-8" />
}
