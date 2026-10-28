'use client'

import { useRef } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react'

type MagneticProps = React.ComponentProps<typeof motion.div> & {
  strength?: number
  contentStrength?: number
  damping?: number
  stiffness?: number
}

export function Magnetic({
  strength = 0.35,
  contentStrength = 0,
  damping = 18,
  stiffness = 180,
  style,
  ...props
}: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)

  const spring = { damping, stiffness, mass: 0.4 }
  const x = useSpring(
    useTransform(rawX, (v) => v * strength),
    spring,
  )
  const y = useSpring(
    useTransform(rawY, (v) => v * strength),
    spring,
  )

  // A second, stiffer offset published as --magnetic-x/y. Descendants that opt in
  // move by strength + contentStrength and settle first, so they read as elastic.
  const contentSpring = { damping: damping + 4, stiffness: stiffness * 1.6, mass: 0.3 }
  const contentX = useSpring(
    useTransform(rawX, (v) => v * contentStrength),
    contentSpring,
  )
  const contentY = useSpring(
    useTransform(rawY, (v) => v * contentStrength),
    contentSpring,
  )
  const varX = useTransform(contentX, (v) => `${v}px`)
  const varY = useTransform(contentY, (v) => `${v}px`)

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (reduced || event.pointerType !== 'mouse') return
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    rawX.set(event.clientX - (rect.left + rect.width / 2))
    rawY.set(event.clientY - (rect.top + rect.height / 2))
  }

  const reset = () => {
    rawX.set(0)
    rawY.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
      onPointerCancel={reset}
      style={{
        x,
        y,
        display: 'inline-flex',
        ...(contentStrength ? { '--magnetic-x': varX, '--magnetic-y': varY } : null),
        ...style,
      }}
      {...props}
    />
  )
}
