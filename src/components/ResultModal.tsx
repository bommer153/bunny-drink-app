import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring, useReducedMotion, animate, useAnimate } from 'motion/react'
import confetti from 'canvas-confetti'
import type { Player } from '@/lib/storage'
import type { Challenge } from '@/data/challenges'
import { TYPE_META } from '@/data/challenges'
import { BorderBeam } from '@/components/ui/border-beam'
import { CountdownTimer } from '@/components/CountdownTimer'
import { sfx } from '@/lib/sfx'
import { cn } from '@/lib/utils'

const TRIVIA_WRONG_SIPS = 2
const SPEED_FAIL_SIPS   = 2

interface ResultModalProps {
  winner: Player | null
  challenge: Challenge | null
  players: Player[]
  /** Sips for chickening out (scales with intensity) */
  chickenSips: number
  /** Assign sips to players and end the turn. Empty `ids` = nobody drinks. */
  onSips: (ids: string[], sips: number) => void
  onClose: () => void
}

const secondaryBtn = 'flex-1 min-h-[52px] rounded-xl border border-white/20 text-white/80 font-semibold text-sm transition-colors hover:bg-white/10 active:bg-white/15'
const primaryBtn   = 'flex-1 min-h-[52px] rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 text-white font-bold text-sm transition-opacity hover:opacity-90 active:opacity-80'

export function ResultModal({ winner, challenge, players, chickenSips, onSips, onClose }: ResultModalProps) {
  const [isFlipped, setIsFlipped]     = useState(false)
  const [answerShown, setAnswerShown] = useState(false)
  const [picked, setPicked]           = useState<string[]>([])
  const [scope, animateScope]         = useAnimate()
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
      setAnswerShown(false)
      setPicked([])
      rawFlipY.set(0)
    }
  }, [winner, rawFlipY])

  const handleFlip = () => {
    if (isFlipped || !challenge) return
    sfx.flip()
    if (prefersReducedMotion) {
      rawFlipY.set(180)
    } else {
      animate(rawFlipY, 180, { type: 'spring', stiffness: 320, damping: 28 })
    }
    setIsFlipped(true)
  }

  // Time's up: buzz + screen shake
  const handleExpire = useCallback(() => {
    sfx.timeUp()
    if (!prefersReducedMotion) {
      animateScope(scope.current, { x: [0, -16, 16, -12, 12, -6, 6, 0] }, { duration: 0.5 })
    }
  }, [animateScope, scope, prefersReducedMotion])

  const celebrate = () => {
    confetti({
      particleCount: 130,
      spread: 85,
      origin: { x: 0.5, y: 0.4 },
      colors: ['#a855f7', '#ec4899', '#fbbf24', '#34d399', '#60a5fa'],
      disableForReducedMotion: true,
    })
    sfx.win()
    onClose()
  }

  const togglePick = (id: string) => {
    sfx.tap()
    setPicked((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]))
  }

  const meta = challenge ? TYPE_META[challenge.type] : null
  // Timer slot is always reserved below so the card never jumps when it appears
  const showTimer = isFlipped && !!meta?.seconds && !answerShown

  return (
    <AnimatePresence>
      {winner && challenge && meta && (
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
            ref={scope}
            initial={{ y: 48, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 48, opacity: 0 }}
            transition={{ delay: 0.08, duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-5 px-5 py-8 w-full max-w-sm"
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

            {/* ── Countdown slot ────────────────────────────────── */}
            <div className="h-16 flex items-center justify-center">
              {showTimer && <CountdownTimer seconds={meta.seconds!} onExpire={handleExpire} />}
            </div>

            {/* ── 3-D flip card ─────────────────────────────────── */}
            {/* perspective wrapper is required for the 3-D effect */}
            <div
              className="w-full max-w-[320px]"
              style={{ perspective: 1000 }}
            >
              <motion.div
                className="relative w-full card-3d cursor-pointer select-none"
                style={{ rotateY, height: 240 }}
                onClick={handleFlip}
                role="button"
                aria-label={isFlipped ? 'Challenge card' : 'Tap to reveal your challenge'}
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleFlip()}
              >
                {/* ── Front face ── */}
                <div className="card-face absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-900 to-indigo-900 border border-white/10 flex flex-col items-center justify-center gap-3">
                  <motion.span
                    className="text-6xl"
                    aria-hidden
                    // Suspense wobble while the card waits to be tapped
                    animate={prefersReducedMotion ? undefined : { rotate: [0, -8, 8, -4, 4, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 1 }}
                  >
                    {meta.emoji}
                  </motion.span>
                  <p className="text-white font-semibold text-lg">Tap to reveal</p>
                  <p className="text-white/40 text-xs uppercase tracking-widest">{meta.label}</p>
                </div>

                {/* ── Back face ── */}
                <div className="card-face card-face-back absolute inset-0 rounded-2xl overflow-hidden">
                  <div className="relative h-full bg-gradient-to-br from-violet-900 to-indigo-950 border border-violet-500/30 flex flex-col items-center justify-center gap-4 p-6">
                    <BorderBeam colorFrom="#a855f7" colorTo="#ec4899" duration={4} size={70} />

                    {/* Type badge */}
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

                    {/* Question ↔ answer swap happens inside the fixed-height card */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={answerShown ? 'answer' : 'question'}
                        initial={{ opacity: 0, scale: 0.94 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.94 }}
                        transition={{ duration: 0.2 }}
                        className="relative z-10 text-center"
                        aria-live="polite"
                      >
                        {answerShown ? (
                          <>
                            <p className="text-amber-300 text-3xl font-black leading-tight">{challenge.answer}</p>
                            <p className="text-white/75 text-sm mt-3 leading-snug">🤓 {challenge.fact}</p>
                          </>
                        ) : (
                          <p className="text-white text-xl font-bold leading-snug">{challenge.text}</p>
                        )}
                      </motion.div>
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

            {/* ── After flip: actions depend on the card type ───── */}
            <AnimatePresence>
              {isFlipped && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  className="flex flex-col gap-3 w-full max-w-[320px]"
                >
                  {meta.pickSips ? (
                    // Group vote: tap the players who drink
                    <>
                      <p className="text-white/60 text-sm text-center">
                        {challenge.type === 'never' ? 'Tap everyone who HAS done it' : 'Tap who got pointed at'}
                      </p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {players.map((p) => {
                          const on = picked.includes(p.id)
                          return (
                            <button
                              key={p.id}
                              onClick={() => togglePick(p.id)}
                              aria-pressed={on}
                              className={cn(
                                'min-h-[48px] px-4 rounded-full text-sm font-bold transition-all active:scale-95',
                                on ? 'bg-amber-400 text-black scale-105' : 'bg-white/10 text-white/80',
                              )}
                            >
                              {p.name}
                            </button>
                          )
                        })}
                      </div>
                      <button onClick={() => onSips(picked, meta.pickSips!)} className={primaryBtn}>
                        {picked.length ? `🍺 +${meta.pickSips} sip${meta.pickSips === 1 ? '' : 's'} each` : 'Nobody — next'}
                      </button>
                    </>
                  ) : challenge.type === 'trivia' && !answerShown ? (
                    <button onClick={() => { sfx.flip(); setAnswerShown(true) }} className={primaryBtn}>
                      💡 Reveal answer
                    </button>
                  ) : challenge.type === 'trivia' ? (
                    <div className="flex gap-3">
                      <button onClick={() => onSips([winner.id], TRIVIA_WRONG_SIPS)} className={secondaryBtn}>
                        ❌ Wrong +{TRIVIA_WRONG_SIPS}🍺
                      </button>
                      <button onClick={celebrate} className={primaryBtn}>✅ Got it</button>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      {challenge.type === 'speed' ? (
                        <button onClick={() => onSips([winner.id], SPEED_FAIL_SIPS)} className={secondaryBtn}>
                          ❌ Failed +{SPEED_FAIL_SIPS}🍺
                        </button>
                      ) : (
                        <button onClick={() => onSips([winner.id], chickenSips)} className={secondaryBtn}>
                          🐔 Chicken out +{chickenSips}🍺
                        </button>
                      )}
                      <button onClick={meta.celebrate ? celebrate : onClose} className={primaryBtn}>
                        ✅ Done
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
