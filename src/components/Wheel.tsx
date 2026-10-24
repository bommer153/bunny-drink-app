import { useRef, useState, useCallback } from 'react'
import { motion, useMotionValue, useMotionValueEvent, animate, useReducedMotion } from 'motion/react'
import type { Player } from '@/lib/storage'
import { ShimmerButton } from '@/components/ui/shimmer-button'
import { sfx } from '@/lib/sfx'
import { cn } from '@/lib/utils'

// ── SVG constants (320 × 320 viewBox) ────────────────────────────────────────
const VB    = 320   // viewBox width = height
const CX    = 160   // wheel centre x
const CY    = 160   // wheel centre y
const R     = 134   // outer radius of the slices
const RIM   = 144   // centre line of the golden rim
const HUB   = 38    // hub circle radius (button sits on top)
const BULBS = 24

// 12 vivid, distinct slice colours
const SLICE_COLORS = [
  '#e63946', '#f4a261', '#2a9d8f', '#457b9d',
  '#e76f51', '#8338ec', '#06d6a0', '#ef476f',
  '#ffd166', '#118ab2', '#a7c957', '#cb4335',
]

// ── Spin math (exported for the self-check) ──────────────────────────────────
// Convention: 0° = 12 o'clock, clockwise positive. Slice i spans [i·s, (i+1)·s].
// Rotating the wheel clockwise by R moves wheel-angle A to (A + R), and the
// pointer sits at 0°, so the wheel-angle under the pointer is (−R) mod 360.

/** Index of the slice under the pointer for a given wheel rotation. */
export function sliceAtPointer(rotation: number, n: number): number {
  const underPointer = (((-rotation) % 360) + 360) % 360
  return Math.floor(underPointer / (360 / n)) % n
}

/** Absolute rotation that lands slice `idx` under the pointer after `turns` full spins. */
export function spinTarget(current: number, idx: number, n: number, turns: number, jitter: number): number {
  const centre = idx * (360 / n) + 180 / n
  // Align to a whole turn first — adding the offset to an arbitrary angle was the old bug.
  const base = current - (((current % 360) + 360) % 360)
  return base + turns * 360 + ((360 - centre) % 360) + jitter
}

// ── Geometry helpers ──────────────────────────────────────────────────────────

/**
 * Convert a polar angle to SVG Cartesian coordinates.
 * `angleDeg` uses our convention: 0° = 12 o'clock, increases clockwise.
 * SVG uses 0° = 3 o'clock, so we subtract 90°.
 */
function toXY(r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) }
}

/** SVG `d` for a pie-slice wedge (angles in our convention). */
function wedgePath(startDeg: number, endDeg: number): string {
  const s = toXY(R, startDeg)
  const e = toXY(R, endDeg)
  const large = endDeg - startDeg > 180 ? 1 : 0
  return [
    `M ${CX} ${CY}`,
    `L ${s.x.toFixed(2)} ${s.y.toFixed(2)}`,
    `A ${R} ${R} 0 ${large} 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)}`,
    'Z',
  ].join(' ')
}

/**
 * Compute a `rotate(deg, tx, ty)` that aligns a label radially.
 * Labels in the lower half are flipped to prevent upside-down text.
 */
function labelRotation(svgMidAngle: number, tx: number, ty: number): string {
  const isLower = ty > CY + 2
  const rot = isLower ? svgMidAngle - 90 : svgMidAngle + 90
  return `rotate(${rot.toFixed(1)},${tx.toFixed(2)},${ty.toFixed(2)})`
}

function truncate(name: string, max: number) {
  return name.length > max ? name.slice(0, max - 1) + '…' : name
}

// ── Component ─────────────────────────────────────────────────────────────────

interface WheelProps {
  players: Player[]
  onResult: (player: Player) => void
}

export function Wheel({ players, onResult }: WheelProps) {
  const [isSpinning, setIsSpinning] = useState(false)
  const [landedIdx, setLandedIdx]   = useState<number | null>(null)
  const rotation      = useMotionValue(0)
  const pointerTilt   = useMotionValue(0)
  const lastWinnerIdx = useRef<number | null>(null)
  const lastPeg       = useRef(0)
  const lastClick     = useRef(0)
  const prefersReducedMotion = useReducedMotion() ?? false

  const n = players.length
  const sliceAngle = n > 0 ? 360 / n : 360

  // Smaller font / shorter labels when there are more players
  const fontSize  = n <= 4 ? 14 : n <= 7 ? 12 : n <= 9 ? 10 : 9
  const maxChars  = n <= 4 ? 10 : n <= 7 ? 7  : n <= 9 ? 5  : 4

  // Each slice boundary passing the pointer flicks it and clicks (like a real peg wheel)
  useMotionValueEvent(rotation, 'change', (v) => {
    const peg = Math.floor(v / sliceAngle)
    if (peg === lastPeg.current) return
    lastPeg.current = peg
    animate(pointerTilt, [-24, 0], { duration: 0.22, ease: 'easeOut' })
    const now = performance.now()
    if (now - lastClick.current > 45) {
      lastClick.current = now
      sfx.click()
    }
  })

  const spin = useCallback(async () => {
    if (isSpinning || n < 2) return
    sfx.tap()
    setLandedIdx(null)

    // Avoid repeating the same player when there are 3+ players.
    let idx: number
    do {
      idx = Math.floor(Math.random() * n)
    } while (n >= 3 && idx === lastWinnerIdx.current)
    lastWinnerIdx.current = idx

    const turns  = 5 + Math.floor(Math.random() * 3)
    const jitter = (Math.random() - 0.5) * sliceAngle * 0.6  // ±30 % of slice, never crosses a boundary
    const target = spinTarget(rotation.get(), idx, n, turns, jitter)

    setIsSpinning(true)
    if (prefersReducedMotion) {
      rotation.set(target)
    } else {
      await animate(rotation, target, { duration: 5.5, ease: [0.12, 0.9, 0.25, 1] })
    }
    setIsSpinning(false)

    // Announce whatever is actually under the pointer, so the result always matches the screen
    const landed = sliceAtPointer(rotation.get(), n)
    setLandedIdx(landed)
    navigator.vibrate?.(60)
    // Brief beat so everyone sees where it stopped before the card opens
    setTimeout(() => onResult(players[landed]), prefersReducedMotion ? 0 : 700)
  }, [isSpinning, n, sliceAngle, rotation, prefersReducedMotion, players, onResult])

  const disabled = n < 2

  // Hub button diameter as a percentage of the SVG viewBox so it scales with it
  const hubPct = ((HUB * 2) / VB) * 100

  return (
    <div className="flex flex-col items-center w-full max-w-sm px-4">
      {/* Width (not height) is capped so the box stays square on short screens */}
      <div className="relative aspect-square" style={{ width: `min(100%, ${VB}px, 55svh)` }}>

        {/* ── Glow behind the wheel ────────────────────────────── */}
        <div
          aria-hidden
          className={cn(
            'absolute inset-[6%] rounded-full blur-2xl transition-opacity duration-500',
            'bg-[conic-gradient(from_0deg,#7c3aed,#db2777,#f59e0b,#06b6d4,#7c3aed)]',
            isSpinning ? 'opacity-80 animate-spin [animation-duration:3s]' : 'opacity-40',
          )}
        />

        {/* ── Rotating wheel layer ─────────────────────────────── */}
        <motion.div
          style={{ rotate: rotation, touchAction: 'none' }}
          className="absolute inset-0"
        >
          <svg
            viewBox={`0 0 ${VB} ${VB}`}
            className="w-full h-full"
            style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
            aria-hidden
          >
            <defs>
              {/* Depth: darker toward the hub and at the very edge */}
              <radialGradient id="wheel-shade" cx={CX} cy={CY} r={R} gradientUnits="userSpaceOnUse">
                <stop offset="0"    stopColor="#000" stopOpacity="0.5" />
                <stop offset="0.45" stopColor="#000" stopOpacity="0" />
                <stop offset="0.9"  stopColor="#fff" stopOpacity="0.06" />
                <stop offset="1"    stopColor="#000" stopOpacity="0.35" />
              </radialGradient>
            </defs>

            <circle cx={CX} cy={CY} r={R} fill="#1e1b4b" />

            {/* Slices + labels */}
            {players.map((player, i) => {
              const start     = i * sliceAngle
              const end       = (i + 1) * sliceAngle
              const midMy     = start + sliceAngle / 2
              const svgMid    = midMy - 90
              const svgMidRad = (svgMid * Math.PI) / 180
              const tr        = R * 0.64
              const tx        = CX + tr * Math.cos(svgMidRad)
              const ty        = CY + tr * Math.sin(svgMidRad)

              return (
                <g key={player.id}>
                  <path
                    d={wedgePath(start, end)}
                    fill={SLICE_COLORS[i % SLICE_COLORS.length]}
                    stroke="rgba(255,255,255,0.35)"
                    strokeWidth={1.5}
                  />
                  <text
                    x={tx}
                    y={ty}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={fontSize}
                    fontWeight={900}
                    fill="white"
                    paintOrder="stroke"
                    stroke="rgba(15,15,26,0.85)"
                    strokeWidth={3}
                    transform={labelRotation(svgMid, tx, ty)}
                    style={{ userSelect: 'none', pointerEvents: 'none', letterSpacing: '0.02em' }}
                  >
                    {truncate(player.name, maxChars)}
                  </text>
                </g>
              )
            })}

            <circle cx={CX} cy={CY} r={R} fill="url(#wheel-shade)" pointerEvents="none" />

            {/* Winning slice flashes once the wheel stops */}
            {landedIdx !== null && landedIdx < n && (
              <motion.path
                d={wedgePath(landedIdx * sliceAngle, (landedIdx + 1) * sliceAngle)}
                fill="white"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.55, 0.1, 0.55, 0.25] }}
                transition={{ duration: 0.7 }}
              />
            )}

            {/* Pegs on every slice boundary */}
            {players.map((p, i) => {
              const { x, y } = toXY(R - 5, i * sliceAngle)
              return <circle key={`peg-${p.id}`} cx={x} cy={y} r={3} fill="#fef3c7" stroke="#78350f" strokeWidth={1} />
            })}

            <circle cx={CX} cy={CY} r={HUB + 6} fill="#0f0f1a" stroke="#fbbf24" strokeWidth={3} />
          </svg>
        </motion.div>

        {/* ── Static overlay: golden rim, bulbs, gloss ─────────── */}
        <svg
          viewBox={`0 0 ${VB} ${VB}`}
          className="absolute inset-0 w-full h-full"
          style={{ pointerEvents: 'none' }}
          aria-hidden
        >
          <defs>
            <linearGradient id="rim-gold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0"    stopColor="#fde68a" />
              <stop offset="0.5"  stopColor="#b45309" />
              <stop offset="1"    stopColor="#fde68a" />
            </linearGradient>
            <linearGradient id="gloss" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0"   stopColor="#fff" stopOpacity="0.28" />
              <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Light from above — stays put while the wheel turns */}
          <ellipse cx={CX} cy={CY - R * 0.45} rx={R * 0.82} ry={R * 0.5} fill="url(#gloss)" />

          <circle cx={CX} cy={CY} r={RIM} fill="none" stroke="url(#rim-gold)" strokeWidth={14} />
          <circle cx={CX} cy={CY} r={RIM + 7} fill="none" stroke="#78350f" strokeWidth={1.5} />

          {/* Marquee bulbs: slow twinkle idle, fast chase while spinning */}
          {Array.from({ length: BULBS }, (_, i) => {
            const { x, y } = toXY(RIM, (i * 360) / BULBS)
            return (
              <circle
                key={i}
                cx={x} cy={y} r={3.2}
                fill={i % 2 ? '#fff7cc' : '#fbbf24'}
                className={prefersReducedMotion ? undefined : 'animate-pulse'}
                style={{
                  animationDuration: isSpinning ? '0.4s' : '2s',
                  animationDelay:    `${(i % 2) * (isSpinning ? 0.2 : 1)}s`,
                  filter: 'drop-shadow(0 0 3px #fde68a)',
                }}
              />
            )
          })}
        </svg>

        {/* ── Pointer (pivots at its top, flicks on each peg) ──── */}
        <motion.div
          aria-hidden
          className="absolute left-1/2 -top-[3%] w-[11%] -translate-x-1/2 origin-top pointer-events-none"
          style={{ rotate: pointerTilt }}
        >
          <svg viewBox="0 0 40 56" className="w-full drop-shadow-[0_3px_4px_rgba(0,0,0,0.6)]">
            <path d="M20 54 L4 18 A17 17 0 1 1 36 18 Z" fill="#ef4444" stroke="#fde68a" strokeWidth="3" strokeLinejoin="round" />
            <circle cx="20" cy="17" r="6" fill="#fde68a" />
          </svg>
        </motion.div>

        {/* ── SPIN button centred over the hub ─────────────────── */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <ShimmerButton
            onClick={spin}
            disabled={disabled || isSpinning}
            aria-label={isSpinning ? 'Spinning…' : 'Spin the wheel'}
            className="pointer-events-auto rounded-full text-xs font-black tracking-[0.15em]"
            style={{
              width:       `${hubPct.toFixed(2)}%`,
              aspectRatio: '1 / 1',
              minWidth:    '48px',
              minHeight:   '48px',
            }}
          >
            {isSpinning ? '…' : 'SPIN'}
          </ShimmerButton>
        </div>
      </div>

      {/* Disabled hint */}
      {disabled && (
        <p className="mt-2 text-white/50 text-sm text-center">
          Add at least 2 players to spin 🎲
        </p>
      )}
    </div>
  )
}
