import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { usePlayers } from '@/hooks/usePlayers'
import { useIntensity } from '@/hooks/useIntensity'
import { pickChallenge } from '@/data/challenges'
import type { IntensityLevel } from '@/lib/storage'
import type { Player } from '@/lib/storage'
import type { Challenge } from '@/data/challenges'
import { Wheel } from '@/components/Wheel'
import { PlayerManager } from '@/components/PlayerManager'
import { ResultModal } from '@/components/ResultModal'
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text'
import { cn } from '@/lib/utils'

// ── Intensity selector ────────────────────────────────────────────────────────

const INTENSITY_OPTIONS: {
  level: IntensityLevel
  label: string
  emoji: string
  desc: string
}[] = [
  { level: 1, label: 'Chill',  emoji: '😊', desc: 'Light & fun'  },
  { level: 2, label: 'Spicy',  emoji: '🌶️', desc: 'Getting bold' },
  { level: 3, label: 'Chaos',  emoji: '🔥', desc: 'No rules'     },
]

interface IntensitySelectorProps {
  intensity: IntensityLevel
  onChange: (l: IntensityLevel) => void
}

function IntensitySelector({ intensity, onChange }: IntensitySelectorProps) {
  return (
    <div className="flex gap-2 w-full max-w-sm px-4" role="group" aria-label="Intensity level">
      {INTENSITY_OPTIONS.map((opt) => (
        <button
          key={opt.level}
          onClick={() => onChange(opt.level)}
          aria-pressed={intensity === opt.level}
          className={cn(
            'flex-1 flex flex-col items-center gap-0.5 rounded-xl py-2 px-1',
            'min-h-[60px] text-xs font-semibold transition-all duration-200',
            'touch-manipulation', // disable double-tap zoom
            intensity === opt.level
              ? 'bg-white/20 text-white ring-1 ring-white/30 shadow-[0_0_12px_rgba(139,92,246,0.3)]'
              : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80',
          )}
        >
          <span className="text-xl leading-none" aria-hidden>{opt.emoji}</span>
          <span>{opt.label}</span>
          <span className="text-[10px] text-white/40 font-normal hidden sm:block">{opt.desc}</span>
        </button>
      ))}
    </div>
  )
}

// ── Loading splash ────────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-bunny-dark">
      <motion.div
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        className="text-4xl"
        aria-label="Loading…"
      >
        🐰
      </motion.div>
    </div>
  )
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const { players, loaded: playersLoaded, addPlayer, removePlayer, clearPlayers, maxPlayers } =
    usePlayers()
  const { intensity, setIntensity, loaded: intensityLoaded } = useIntensity()

  const [winner, setWinner]     = useState<Player | null>(null)
  const [challenge, setChallenge] = useState<Challenge | null>(null)

  const handleResult = (player: Player) => {
    setChallenge(pickChallenge(intensity))
    setWinner(player)
  }

  const handleClose = () => {
    setWinner(null)
    setChallenge(null)
  }

  // Prevent rendering until both IndexedDB reads have resolved (avoids empty-list flash)
  if (!playersLoaded || !intensityLoaded) return <LoadingScreen />

  return (
    <>
      {/* ── Animated background blobs ───────────────────────── */}
      <div className="fixed inset-0 -z-10 overflow-hidden" aria-hidden>
        <div className="absolute top-[15%] left-[10%] w-64 h-64 rounded-full bg-violet-700/25 blur-3xl animate-blob" />
        <div className="absolute top-[50%] right-[8%] w-56 h-56 rounded-full bg-pink-600/20 blur-3xl animate-blob [animation-delay:3s]" />
        <div className="absolute bottom-[12%] left-[40%] w-72 h-72 rounded-full bg-indigo-600/15 blur-3xl animate-blob [animation-delay:6s]" />
      </div>

      {/* ── Main scroll container with iOS safe-area padding ── */}
      <div
        className="flex flex-col items-center gap-4 sm:gap-6 min-h-dvh pb-8 overflow-x-hidden w-full"
        style={{
          paddingTop:    'max(env(safe-area-inset-top, 0px), 20px)',
          paddingLeft:   'env(safe-area-inset-left, 0px)',
          paddingRight:  'env(safe-area-inset-right, 0px)',
          paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 32px)',
        }}
      >
        {/* ── Title ─────────────────────────────────────────── */}
        <header className="pt-2 text-center">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            <AnimatedGradientText>🐰 Bunny Drinking Games</AnimatedGradientText>
          </h1>
          <p className="text-white/40 text-xs mt-1">spin · reveal · drink</p>
        </header>

        {/* ── Intensity selector ─────────────────────────────── */}
        <IntensitySelector intensity={intensity} onChange={setIntensity} />

        {/* ── Landscape: side-by-side; portrait: stacked ────────── */}
        <div className="flex flex-col landscape:flex-row landscape:items-start landscape:gap-6 landscape:px-4 w-full max-w-2xl">
          {/* Wheel shrinks in landscape so both panels fit on screen */}
          <div className="flex-shrink-0 landscape:flex-1 landscape:max-w-xs">
            <Wheel players={players} onResult={handleResult} />
          </div>

          <div className="landscape:flex-1 landscape:pt-2 landscape:overflow-y-auto landscape:max-h-[calc(100svh-4rem)]">
            <PlayerManager
              players={players}
              maxPlayers={maxPlayers}
              onAdd={addPlayer}
              onRemove={removePlayer}
              onClear={clearPlayers}
            />
          </div>
        </div>

        {/* ── Footer ────────────────────────────────────────── */}
        <footer className="text-center text-white/30 text-xs px-6 max-w-xs">
          Play responsibly — water and mocktails count 🌊
        </footer>
      </div>

      {/* ── Result modal (portalled via AnimatePresence in the component) ── */}
      <AnimatePresence>
        <ResultModal
          key="modal"
          winner={winner}
          challenge={challenge}
          onClose={handleClose}
        />
      </AnimatePresence>
    </>
  )
}

