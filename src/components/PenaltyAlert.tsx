import { useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import confetti from 'canvas-confetti'
import { sfx } from '@/lib/sfx'

export interface Penalty {
  id: number
  names: string[]
  sips: number
}

interface PenaltyAlertProps {
  penalty: Penalty | null
  /** Must be stable (useCallback) — it drives the auto-dismiss timer */
  onDone: () => void
}

/** Full-screen "TAKE 2 SIPS!" slam with a particle burst. Auto-dismisses; tap to skip. */
export function PenaltyAlert({ penalty, onDone }: PenaltyAlertProps) {
  useEffect(() => {
    if (!penalty) return
    sfx.penalty()
    confetti({
      particleCount: 90,
      spread: 360,
      startVelocity: 38,
      origin: { x: 0.5, y: 0.45 },
      colors: ['#ef4444', '#f97316', '#facc15'],
      shapes: ['circle'],
      disableForReducedMotion: true,
    })
    const t = setTimeout(onDone, 2200)
    return () => clearTimeout(t)
  }, [penalty, onDone])

  const headline = !penalty ? ''
    : penalty.sips >= 5 ? 'FINISH YOUR DRINK!'
    : `TAKE ${penalty.sips} SIP${penalty.sips === 1 ? '' : 'S'}!`

  return (
    <AnimatePresence>
      {penalty && (
        <motion.div
          key={penalty.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onDone}
          role="alert"
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-4 px-6 text-center bg-red-950/90"
        >
          <motion.p
            initial={{ scale: 3, rotate: -14, opacity: 0 }}
            animate={{ scale: 1, rotate: -4, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 14 }}
            className="font-display text-5xl sm:text-6xl leading-none text-yellow-300 drop-shadow-[0_0_24px_rgba(250,204,21,0.6)]"
          >
            🍺 {headline}
          </motion.p>
          <motion.p
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold text-white"
          >
            {penalty.names.join(', ')}
          </motion.p>
          <p className="text-white/40 text-xs">tap to continue</p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
