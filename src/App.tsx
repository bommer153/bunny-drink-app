import { useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { usePlayers } from '@/hooks/usePlayers'
import { useIntensity } from '@/hooks/useIntensity'
import { pickChallenge, CATEGORIES } from '@/data/challenges'
import type { IntensityLevel } from '@/lib/storage'
import type { Player } from '@/lib/storage'
import type { Challenge, Category } from '@/data/challenges'
import { Wheel } from '@/components/Wheel'
import { PlayerManager } from '@/components/PlayerManager'
import { ResultModal } from '@/components/ResultModal'
import { PenaltyAlert } from '@/components/PenaltyAlert'
import type { Penalty } from '@/components/PenaltyAlert'
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text'
import { isSoundOn, setSoundOn, sfx } from '@/lib/sfx'
import { cn } from '@/lib/utils'

// ── Intensity selector ────────────────────────────────────────────────────────

const INTENSITY_OPTIONS: {
  level: IntensityLevel
  label: string
  emoji: string
  desc: string
}[] = [
  { level: 1, label: 'Casual',  emoji: '😊', desc: 'Light & fun'  },
  { level: 2, label: 'Spicy',   emoji: '🌶️', desc: 'Getting bold' },
  { level: 3, label: 'Chaotic', emoji: '🔥', desc: 'No rules'     },
  { level: 4, label: 'Extreme', emoji: '💀', desc: 'No mercy'     },
]

// Active colour per tier; --edge is the btn-3d bottom edge
const INTENSITY_ACTIVE: Record<IntensityLevel, string> = {
  1: 'bg-emerald-500 [--edge:#065f46]',
  2: 'bg-orange-500 [--edge:#9a3412]',
  3: 'bg-red-600 [--edge:#7f1d1d]',
  4: 'bg-fuchsia-700 [--edge:#4a044e] shadow-[0_0_18px_rgba(192,38,211,0.5)]',
}

interface IntensitySelectorProps {
  intensity: IntensityLevel
  onChange: (l: IntensityLevel) => void
}

function IntensitySelector({ intensity, onChange }: IntensitySelectorProps) {
  return (
    <div className="flex gap-2 w-full" role="group" aria-label="Intensity level">
      {INTENSITY_OPTIONS.map((opt) => (
        <button
          key={opt.level}
          onClick={() => { sfx.tap(); onChange(opt.level) }}
          aria-pressed={intensity === opt.level}
          className={cn(
            'btn-3d flex-1 flex flex-col items-center gap-0.5 rounded-xl py-2 px-1',
            'min-h-[64px] text-xs font-extrabold',
            'touch-manipulation', // disable double-tap zoom
            intensity === opt.level
              ? cn('text-white', INTENSITY_ACTIVE[opt.level])
              : 'bg-white/5 text-white/55 hover:bg-white/10 hover:text-white/80',
          )}
        >
          <span className="text-xl leading-none" aria-hidden>{opt.emoji}</span>
          <span>{opt.label}</span>
          <span className="text-[10px] opacity-60 font-normal hidden sm:block">{opt.desc}</span>
        </button>
      ))}
    </div>
  )
}

// ── Category selector ─────────────────────────────────────────────────────────

interface CategorySelectorProps {
  category: Category
  onChange: (c: Category) => void
}

function CategorySelector({ category, onChange }: CategorySelectorProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2 w-full" role="group" aria-label="Game mode">
      {CATEGORIES.map((c) => (
        <button
          key={c.id}
          onClick={() => { sfx.tap(); onChange(c.id) }}
          aria-pressed={category === c.id}
          className={cn(
            'btn-3d min-h-[48px] px-3 rounded-full text-xs font-extrabold touch-manipulation',
            category === c.id
              ? 'bg-gradient-to-r from-violet-600 to-pink-600 text-white [--edge:#701a75] shadow-[0_0_14px_rgba(219,39,119,0.45)]'
              : 'bg-white/5 text-white/55 hover:bg-white/10 hover:text-white/80',
          )}
        >
          <span aria-hidden>{c.emoji}</span> {c.label}
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
  const {
    players, loaded: playersLoaded, addPlayer, removePlayer, clearPlayers, addSips, resetSips, maxPlayers,
  } = usePlayers()
  const { intensity, setIntensity, loaded: intensityLoaded } = useIntensity()

  const [category, setCategory]   = useState<Category>('mix')
  const [winner, setWinner]       = useState<Player | null>(null)
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [penalty, setPenalty]     = useState<Penalty | null>(null)
  const [soundOn, setSound]       = useState(isSoundOn)

  const handleResult = (player: Player) => {
    setChallenge(pickChallenge(intensity, category))
    setWinner(player)
  }

  const handleClose = () => {
    setWinner(null)
    setChallenge(null)
  }

  // End the turn; anyone who has to drink gets tallied and a penalty slam
  const handleSips = (ids: string[], sips: number) => {
    handleClose()
    if (ids.length === 0) return
    addSips(ids, sips)
    setPenalty({ id: Date.now(), sips, names: players.filter((p) => ids.includes(p.id)).map((p) => p.name) })
  }

  const dismissPenalty = useCallback(() => setPenalty(null), [])

  const toggleSound = () => {
    setSoundOn(!soundOn)
    setSound(!soundOn)
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
        <header className="relative pt-2 text-center w-full max-w-sm px-14">
          <button
            onClick={toggleSound}
            aria-pressed={soundOn}
            aria-label={soundOn ? 'Mute sounds' : 'Unmute sounds'}
            className="panel absolute right-2 top-2 min-h-[48px] min-w-[48px] rounded-full text-xl"
          >
            {soundOn ? '🔊' : '🔇'}
          </button>
          <h1 className="font-display text-3xl sm:text-4xl leading-none -rotate-2 drop-shadow-[0_4px_0_rgba(0,0,0,0.5)]">
            <span aria-hidden>🐰 </span>
            <AnimatedGradientText>Bunny Drinking Games</AnimatedGradientText>
          </h1>
          <p className="kicker mt-3">spin · reveal · drink</p>
        </header>

        {/* ── Settings: intensity + game mode ────────────────── */}
        <section className="w-full max-w-sm px-4">
          <div className="panel p-3 flex flex-col gap-3">
            <h2 className="kicker px-1">Intensity</h2>
            <IntensitySelector intensity={intensity} onChange={setIntensity} />
            <h2 className="kicker px-1 mt-1">Game mode</h2>
            <CategorySelector category={category} onChange={setCategory} />
          </div>
        </section>

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
              onResetSips={resetSips}
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
          players={players}
          chickenSips={intensity + 1}
          onSips={handleSips}
          onClose={handleClose}
        />
      </AnimatePresence>

      <PenaltyAlert penalty={penalty} onDone={dismissPenalty} />
    </>
  )
}

