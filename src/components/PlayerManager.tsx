import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import type { Player } from '@/lib/storage'
import { cn } from '@/lib/utils'

interface PlayerManagerProps {
  players: Player[]
  maxPlayers: number
  onAdd: (name: string) => void
  onRemove: (id: string) => void
  onClear: () => void
}

export function PlayerManager({
  players,
  maxPlayers,
  onAdd,
  onRemove,
  onClear,
}: PlayerManagerProps) {
  const [inputName, setInputName] = useState('')
  const [error, setError]         = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = inputName.trim()
    if (!trimmed) return

    if (players.length >= maxPlayers) {
      setError(`Maximum ${maxPlayers} players reached`)
      return
    }
    if (players.some((p) => p.name.toLowerCase() === trimmed.toLowerCase())) {
      setError(`"${trimmed}" is already in the list`)
      return
    }

    onAdd(trimmed)
    setInputName('')
    setError(null)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputName(e.target.value)
    if (error) setError(null)
  }

  const isFull = players.length >= maxPlayers

  return (
    <div className="w-full max-w-sm px-4 flex flex-col gap-4">

      {/* ── Header row ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <h2 className="text-white font-bold text-base">
          Players{' '}
          <span className={cn('text-sm font-normal', isFull ? 'text-amber-400' : 'text-white/50')}>
            {players.length}/{maxPlayers}
          </span>
        </h2>
        {players.length > 0 && (
          <button
            onClick={onClear}
            className="text-white/40 text-xs hover:text-rose-400 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-end"
            aria-label="Clear all players"
          >
            Clear all
          </button>
        )}
      </div>

      {/* ── Add-player form ─────────────────────────────────────── */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={inputName}
          onChange={handleChange}
          placeholder="Player name…"
          maxLength={24}
          disabled={isFull}
          className={cn(
            'flex-1 min-h-[48px] rounded-xl bg-white/8 border border-white/15',
            'px-4 text-white text-sm placeholder:text-white/35',
            'focus:outline-none focus:border-violet-500 focus:bg-white/12',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            'transition-colors',
          )}
          aria-label="Enter player name"
          aria-invalid={error !== null}
        />
        <button
          type="submit"
          disabled={isFull || !inputName.trim()}
          className={cn(
            'min-h-[48px] min-w-[64px] px-4 rounded-xl font-bold text-sm',
            'bg-violet-600 text-white',
            'hover:bg-violet-500 active:bg-violet-700 transition-colors',
            'disabled:opacity-40 disabled:cursor-not-allowed',
          )}
          aria-label="Add player"
        >
          Add
        </button>
      </form>

      {/* ── Inline error ────────────────────────────────────────── */}
      <AnimatePresence>
        {error && (
          <motion.p
            key="error"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="text-rose-400 text-xs -mt-2"
            role="alert"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* ── Player chips ─────────────────────────────────────────── */}
      {players.length > 0 && (
        <motion.ul
          layout
          className="flex flex-wrap gap-2"
          aria-label="Current players"
        >
          <AnimatePresence mode="popLayout">
            {players.map((player) => (
              <motion.li
                key={player.id}
                layout
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                className="flex items-center gap-1 bg-white/10 border border-white/15 rounded-full pl-3 overflow-hidden"
              >
                <span className="text-white text-sm font-medium py-1.5 max-w-[120px] truncate">
                  {player.name}
                </span>
                <button
                  onClick={() => onRemove(player.id)}
                  aria-label={`Remove ${player.name}`}
                  // 44 × 44 touch target (the button itself is ≥ 44 px tall via min-h)
                  className="flex items-center justify-center min-w-[44px] min-h-[44px] text-white/50 hover:text-rose-400 hover:bg-white/10 transition-colors"
                >
                  ×
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}

      {players.length === 0 && (
        <p className="text-white/30 text-sm text-center py-4">
          No players yet — add some above 👆
        </p>
      )}
    </div>
  )
}
