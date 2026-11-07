import { cn } from '@/lib/utils'

import { combined, coverScale, type Edit, type StageImage } from './edits'

function Art({ image }: { image: StageImage }) {
  if (image.src) {
    return <img src={image.src} alt="" draggable={false} className="size-full object-cover" />
  }
  return (
    <div className="size-full" style={{ background: image.background }}>
      <svg
        viewBox="0 0 200 250"
        className="size-full"
        style={{ transform: `scale(${image.scale ?? 1})` }}
        aria-hidden
      >
        <ellipse cx="100" cy="228" rx="70" ry="8" fill="rgb(0 0 0 / 0.12)" />
        <path
          d="M72 34 L100 44 L128 34 L166 56 L182 112 L160 120 L154 98 L154 222 L46 222 L46 98 L40 120 L18 112 L34 56 Z"
          fill={image.fill}
        />
        <path d="M72 34 L100 64 L128 34" fill="none" stroke="rgb(0 0 0 / 0.25)" strokeWidth="3" />
        <path d="M100 64 V222" stroke="rgb(0 0 0 / 0.2)" strokeWidth="2" />
        {[84, 112, 140, 168, 196].map((y) => (
          <circle key={y} cx="104" cy={y} r="2.5" fill="rgb(255 255 255 / 0.6)" />
        ))}
        <rect x="60" y="92" width="26" height="28" rx="3" fill="rgb(0 0 0 / 0.12)" />
        <rect x="114" y="92" width="26" height="28" rx="3" fill="rgb(0 0 0 / 0.12)" />
      </svg>
    </div>
  )
}

export function Picture({
  image,
  edit,
  crop = true,
  className,
}: {
  image: StageImage
  edit: Edit
  crop?: boolean
  className?: string
}) {
  const a = combined(edit)
  const { zoom, x, y, straighten, turns, flipX, flipY } = edit.crop
  const scale = crop ? zoom * coverScale(edit) : 1
  const transform = crop
    ? `translate(${x}%, ${y}%) rotate(${turns * 90 + straighten}deg) scale(${scale * (flipX ? -1 : 1)}, ${scale * (flipY ? -1 : 1)})`
    : undefined
  const filter = [
    `brightness(${1 + a.exposure / 200})`,
    `contrast(${1 + a.contrast / 100 - a.fade / 400})`,
    `saturate(${1 + a.saturation / 100})`,
    `hue-rotate(${a.hue}deg)`,
  ].join(' ')

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <div className="absolute inset-0" style={{ transform, filter }}>
        <Art image={image} />
      </div>
      {a.warmth !== 0 && (
        <div
          className="absolute inset-0 mix-blend-soft-light"
          style={{
            background: a.warmth > 0 ? '#ff8a00' : '#0066ff',
            opacity: (Math.abs(a.warmth) / 100) * 0.6,
          }}
        />
      )}
      {a.fade > 0 && (
        <div className="absolute inset-0 bg-white" style={{ opacity: (a.fade / 100) * 0.3 }} />
      )}
      {a.vignette > 0 && (
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at center, transparent 45%, rgb(0 0 0 / ${(a.vignette / 100) * 0.75}))`,
          }}
        />
      )}
    </div>
  )
}
