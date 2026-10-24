import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { sfx } from '@/lib/sfx'

const R = 26
const CIRC = 2 * Math.PI * R

interface CountdownTimerProps {
  seconds: number
  /** Must be stable (useCallback) — a new identity restarts the current second */
  onExpire: () => void
}

/** Circular countdown: green → yellow → red, ticks in the last 3 s, pulses when urgent. */
export function CountdownTimer({ seconds, onExpire }: CountdownTimerProps) {
  const [left, setLeft] = useState(seconds)

  useEffect(() => {
    if (left === 0) return
    const t = setTimeout(() => {
      if (left === 1) onExpire()
      else if (left <= 4) sfx.tick()
      setLeft(left - 1)
    }, 1000)
    return () => clearTimeout(t)
  }, [left, onExpire])

  const frac  = left / seconds
  const color = frac > 0.5 ? '#22c55e' : frac > 0.25 ? '#facc15' : '#ef4444'

  return (
    <motion.div
      className="relative w-16 h-16"
      animate={frac <= 0.25 ? { scale: [1, 1.12, 1] } : { scale: 1 }}
      transition={frac <= 0.25 ? { duration: 0.5, repeat: Infinity } : undefined}
      role="timer"
      aria-label={`${left} seconds left`}
    >
      <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90" aria-hidden>
        <circle cx="32" cy="32" r={R} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
        {/* Ring drains smoothly over the full duration; colour steps with the seconds */}
        <motion.circle
          cx="32" cy="32" r={R} fill="none" strokeWidth="6" strokeLinecap="round"
          stroke={color}
          strokeDasharray={CIRC}
          initial={{ strokeDashoffset: 0 }}
          animate={{ strokeDashoffset: CIRC }}
          transition={{ duration: seconds, ease: 'linear' }}
          style={{ filter: `drop-shadow(0 0 6px ${color})`, transition: 'stroke 0.3s' }}
        />
      </svg>
      <motion.span
        key={left}
        initial={{ scale: 1.6, opacity: 0.3 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`absolute inset-0 flex items-center justify-center font-black ${left ? 'text-2xl' : 'text-xs'}`}
        style={{ color }}
      >
        {left || 'TIME!'}
      </motion.span>
    </motion.div>
  )
}
