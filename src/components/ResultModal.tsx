import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring, useReducedMotion, animate } from 'motion/react'
import confetti from 'canvas-confetti'
import type { Player } from '@/lib/storage'
import type { Challenge } from '@/data/challenges'
import { TYPE_META } from '@/data/challenges'
import { BorderBeam } from '@/components/ui/border-beam'
import { cn } from '@/lib/utils'

interface ResultModalProps {
  winner: Player | null
  challenge: Challenge | null
  onClose: () => void
}

export function ResultModal({ winner, challenge, onClose }: ResultModalProps) {
  const [isFlipped, setIsFlipped]     = useState(false)
  const [chickenedOut, setChickenedOut] = useState(false)
  const prefersReducedMotion = useReducedMotion() ?? false

  // Spring-driven card flip
  const rawFlipY  = useMotionValue(0)
  const springY   = useSpring(rawFlipY, { stiffness: 320, damping: 28 })
  // For reduced motion we bypass the spring
  const rotateY   = prefersReducedMotion ? rawFlipY : springY

  // Reset card state whenever a new winner is shown
  useEffect(() => {
    if (winner) {
      setIsFlipped(false)
      setChickenedOut(false)
      rawFlipY.set(0)
    }
  }, [winner, rawFlipY])

  const handleFlip = () => {
    if (isFlipped || !challenge) return

    if (!prefersReducedMotion) {
      confetti({
        particleCount: 130,
        spread: 85,
        origin: { x: 0.5, y: 0.4 },
        colors: ['#a855f7', '#ec4899', '#fbbf24', '#34d399', '#60a5fa'],
        disableForReducedMotion: true,
      })
      navigator.vibrate?.([180, 60, 180])
    }

    if (prefersReducedMotion) {
      rawFlipY.set(180)
    } else {
      animate(rawFlipY, 180, { type: 'spring', stiffness: 320, damping: 28 })
    }
    setIsFlipped(true)
  }

  const handleChickenOut = () => {
    setChickenedOut(true)
    if (!prefersReducedMotion) navigator.vibrate?.([100])
  }

  const meta = challenge ? TYPE_META[challenge.type] : null
  const displayText = chickenedOut
    ? 'Drink 2 instead. 🐔  No shame at all.'
    : (challenge?.text ?? '')

  return (
    <AnimatePresence>
      {winner && challenge && (
        <motion.div
          key="result-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          // Full-screen backdrop, flex-centred; overflows to scroll on very short screens
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overscroll-contain p-6"
          style={{
            background: 'rgba(8, 5, 18, 0.96)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            paddingTop:    'max(env(safe-area-inset-top, 0px), 24px)',
            paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 24px)',
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 48, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 48, opacity: 0 }}
            transition={{ delay: 0.08, duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-6 px-5 py-8 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── Winner name ───────────────────────────────────── */}
            <div className="text-center">
              <p className="text-white/50 text-xs uppercase tracking-[0.2em] mb-1">
                🎉 The wheel chose
              </p>
              <h2 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-pink-400 leading-tight">
                {winner.name}
              </h2>
            </div>

            {/* ── 3-D flip card ─────────────────────────────────── */}
            {/* perspective wrapper is required for the 3-D effect */}
            <div
              className="w-full max-w-[320px]"
              style={{ perspective: 1000 }}
            >
              <motion.div
                className="relative w-full card-3d cursor-pointer select-none"
                style={{ rotateY, minHeight: 192 }}
                onClick={handleFlip}
                role="button"
                aria-label={isFlipped ? 'Challenge card' : 'Tap to reveal your challenge'}
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleFlip()}
              >
                {/* ── Front face ── */}
                <div className="card-face absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-900 to-indigo-900 border border-white/10 flex flex-col items-center justify-center gap-3">
                  <span className="text-6xl" aria-hidden>🃏</span>
                  <p className="text-white font-semibold text-lg">Tap to reveal</p>
                  {!prefersReducedMotion && (
                    <span className="text-white/40 text-sm animate-pulse">✨ tap me ✨</span>
                  )}
                </div>

                {/* ── Back face ── */}
                <div className="card-face card-face-back absolute inset-0 rounded-2xl overflow-hidden">
                  <div className="relative h-full bg-gradient-to-br from-violet-900 to-indigo-950 border border-violet-500/30 flex flex-col items-center justify-center gap-4 p-6">
                    <BorderBeam colorFrom="#a855f7" colorTo="#ec4899" duration={4} size={70} />

                    {/* Type badge */}
                    {meta && (
                      <span
                        className={cn(
                          'relative z-10 flex items-center gap-1.5 px-3 py-1 rounded-full',
                          'text-sm font-bold text-white bg-gradient-to-r',
                          meta.gradient,
                        )}
                      >
                        <span aria-hidden>{meta.emoji}</span>
                        {meta.label}
                      </span>
                    )}

                    {/* Challenge text — animates when chickenedOut */}
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={chickenedOut ? 'chicken' : challenge.id}
                        initial={{ opacity: 0, scale: 0.94 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.94 }}
                        transition={{ duration: 0.2 }}
                        className="relative z-10 text-white text-center text-xl font-bold leading-snug"
                      >
                        {displayText}
                      </motion.p>
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* ── Before flip: tap hint ─────────────────────────── */}
            {!isFlipped && (
              <p className="text-white/35 text-sm" aria-live="polite">
                Tap the card to reveal the challenge
              </p>
            )}

            {/* ── After flip: action buttons ────────────────────── */}
            <AnimatePresence>
              {isFlipped && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  className="flex gap-3 w-full max-w-[320px]"
                >
                  {!chickenedOut && (
                    <button
                      onClick={handleChickenOut}
                      className="flex-1 min-h-[48px] rounded-xl border border-white/20 text-white/70 font-semibold text-sm transition-colors hover:bg-white/10 active:bg-white/15"
                    >
                      🐔 Chicken out
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="flex-1 min-h-[48px] rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 text-white font-bold text-sm transition-opacity hover:opacity-90 active:opacity-80"
                  >
                    ✅ Done
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
