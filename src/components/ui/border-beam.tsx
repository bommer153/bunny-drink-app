import { useEffect, useRef } from 'react'
import { motion, useMotionValue, animate } from 'motion/react'
import { cn } from '@/lib/utils'

interface BorderBeamProps {
  className?: string
  size?: number
  duration?: number
  colorFrom?: string
  colorTo?: string
}

/**
 * A glowing orb that travels around the perimeter of its parent (which needs
 * `position: relative; overflow: hidden`).
 *
 * Implemented with a motion.div driven by useMotionValue so it respects
 * reduced-motion at the motion library level.
 */
export function BorderBeam({
  className,
  size = 80,
  duration = 5,
  colorFrom = '#a855f7',
  colorTo = '#ec4899',
}: BorderBeamProps) {
  const progress = useMotionValue(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const controls = animate(progress, 1, {
      duration,
      ease: 'linear',
      repeat: Infinity,
    })
    return () => controls.stop()
  }, [duration, progress])

  // Convert 0-1 progress → (left%, top%) along the card perimeter
  const x = useMotionValue('0%')
  const y = useMotionValue('0%')

  useEffect(() => {
    return progress.on('change', (v) => {
      // 4 equal segments: top→right→bottom→left
      const seg = v * 4
      if (seg < 1) {
        // top edge: left 0→100%, top 0%
        x.set(`${seg * 100}%`)
        y.set('0%')
      } else if (seg < 2) {
        // right edge: left 100%, top 0→100%
        x.set('100%')
        y.set(`${(seg - 1) * 100}%`)
      } else if (seg < 3) {
        // bottom edge: left 100→0%, top 100%
        x.set(`${(1 - (seg - 2)) * 100}%`)
        y.set('100%')
      } else {
        // left edge: left 0%, top 100→0%
        x.set('0%')
        y.set(`${(1 - (seg - 3)) * 100}%`)
      }
    })
  }, [progress, x, y])

  return (
    <div
      ref={ref}
      className={cn(
        'pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]',
        className,
      )}
    >
      <motion.div
        style={{
          left: x,
          top: y,
          width: size,
          height: size,
          x: '-50%',
          y: '-50%',
          background: `radial-gradient(circle, ${colorFrom} 0%, ${colorTo} 45%, transparent 75%)`,
          opacity: 0.75,
          filter: `blur(${Math.round(size * 0.25)}px)`,
        }}
        className="absolute"
      />
    </div>
  )
}
