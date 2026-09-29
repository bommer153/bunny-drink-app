import { useRef, useState, useCallback } from 'react'
import { motion, useMotionValue, animate, useReducedMotion } from 'motion/react'
import type { Player } from '@/lib/storage'
import { ShimmerButton } from '@/components/ui/shimmer-button'

// ── SVG constants (320 × 320 viewBox) ────────────────────────────────────────
const VB   = 320   // viewBox width = height
const CX   = 160   // wheel centre x
const CY   = 160   // wheel centre y
const R    = 144   // outer radius of the wheel
const HUB  = 38    // hub circle radius (button sits on top)

// 12 vivid, distinct slice colours
const SLICE_COLORS = [
  '#e63946', '#f4a261', '#2a9d8f', '#457b9d',
  '#e76f51', '#8338ec', '#06d6a0', '#ef476f',
  '#ffd166', '#118ab2', '#a7c957', '#cb4335',
]

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

/**
 * Build the SVG `d` attribute for a pie-slice wedge.
 * Both angles are in our convention (0 = top, clockwise).
 */
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
 * Compute a CSS `rotate(deg, tx, ty)` that aligns a text label radially.
 * Labels in the lower half are flipped to prevent upside-down text.
 */
function labelRotation(svgMidAngle: number, tx: number, ty: number): string {
  // svgMidAngle is in SVG convention (0 = 3 o'clock).
  // `isLower`: text centre is below the wheel horizontal midline.
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
  const rotation = useMotionValue(0)
  const lastWinnerIdx = useRef<number | null>(null)
  const prefersReducedMotion = useReducedMotion() ?? false

  const n = players.length
  const sliceAngle = n > 0 ? 360 / n : 360

  // Smaller font / shorter labels when there are more players
  const fontSize  = n <= 4 ? 13 : n <= 7 ? 11 : n <= 9 ? 10 : 9
  const maxChars  = n <= 4 ? 10 : n <= 7 ? 7  : n <= 9 ? 5  : 4

  const spin = useCallback(async () => {
    if (isSpinning || n < 2) return

    // ── Pick winner ────────────────────────────────────────────────────
    // Avoid repeating the same player when there are 3+ players.
    let idx: number
    do {
      idx = Math.floor(Math.random() * n)
    } while (n >= 3 && idx === lastWinnerIdx.current)
    lastWinnerIdx.current = idx

    // ── Angle math ─────────────────────────────────────────────────────
    // Convention: 0° = 12 o'clock, clockwise positive.
    // Slice i occupies [i·sliceAngle, (i+1)·sliceAngle].
    // Winner's slice centre (in wheel-local degrees from top):
    const winnerCenter = idx * sliceAngle + sliceAngle / 2

    // When the wheel has rotated clockwise by R°, a point originally at A°
    // (from top) moves to (A + R) % 360. The pointer is fixed at 0° (top).
    // We need: (winnerCenter + R) % 360 = 0  →  R = (360 − winnerCenter) % 360
    const landingOffset = (360 - (winnerCenter % 360)) % 360

    // 5–7 full extra spins (randomised for variety) + landing offset + jitter
    const extraSpins = (5 + Math.floor(Math.random() * 3)) * 360
    const jitter     = (Math.random() - 0.5) * sliceAngle * 0.6  // ±30 % of slice

    const target = rotation.get() + extraSpins + landingOffset + jitter

    setIsSpinning(true)

    if (prefersReducedMotion) {
      // Skip the 5.5 s animation entirely
      rotation.set(target)
      setIsSpinning(false)
      onResult(players[idx])
      return
    }

    await animate(rotation, target, {
      duration: 5.5,
      ease: [0.16, 1, 0.3, 1], // easeOutExpo-like strong deceleration
    })

    setIsSpinning(false)
    onResult(players[idx])
  }, [isSpinning, n, sliceAngle, rotation, prefersReducedMotion, players, onResult])

  const disabled = n < 2

  // Hub button diameter as a percentage of the SVG viewBox so it scales with it
  const hubPct = ((HUB * 2) / VB) * 100  // ≈ 23.75 %

  return (
    <div className="flex flex-col items-center w-full max-w-sm px-4">
      {/* Aspect-ratio container keeps the wheel square */}
      <div className="relative w-full aspect-square" style={{ maxWidth: VB }}>

        {/* ── Rotating wheel layer ─────────────────────────────── */}
        <motion.div
          // motion rotates around the element's CSS transform-origin (50 % 50 % by default),
          // which is the centre of this square div = centre of the SVG wheel. ✓
          style={{ rotate: rotation, touchAction: 'none' }}
          className="absolute inset-0"
        >
          <svg
            viewBox={`0 0 ${VB} ${VB}`}
            className="w-full h-full"
            style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
            aria-hidden
          >
            {/* Base circle */}
            <circle cx={CX} cy={CY} r={R} fill="#1e1b4b" />

            {/* Slices + labels */}
            {players.map((player, i) => {
              const start     = i * sliceAngle
              const end       = (i + 1) * sliceAngle
              const midMy     = start + sliceAngle / 2          // our convention
              const svgMid    = midMy - 90                      // SVG convention
              const svgMidRad = (svgMid * Math.PI) / 180
              const tr        = R * 0.62
              const tx        = CX + tr * Math.cos(svgMidRad)
              const ty        = CY + tr * Math.sin(svgMidRad)

              return (
                <g key={player.id}>
                  <path
                    d={wedgePath(start, end)}
                    fill={SLICE_COLORS[i % SLICE_COLORS.length]}
                    stroke="#0f0f1a"
                    strokeWidth={1.5}
                  />
                  <text
                    x={tx}
                    y={ty}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={fontSize}
                    fontWeight="bold"
                    fill="white"
                    paintOrder="stroke"
                    stroke="#0f0f1a"
                    strokeWidth={2.5}
                    transform={labelRotation(svgMid, tx, ty)}
                    style={{ userSelect: 'none', pointerEvents: 'none' }}
                  >
                    {truncate(player.name, maxChars)}
                  </text>
                </g>
              )
            })}

            {/* Hub disc (rotates with wheel — uniform circle so rotation is invisible) */}
            <circle
              cx={CX} cy={CY} r={HUB + 4}
              fill="#0f0f1a"
              stroke="#4c1d95"
              strokeWidth={2}
            />
          </svg>
        </motion.div>

        {/* ── Static overlay: outer ring + pointer ─────────────── */}
        <svg
          viewBox={`0 0 ${VB} ${VB}`}
          className="absolute inset-0 w-full h-full"
          style={{ pointerEvents: 'none' }}
          aria-hidden
        >
          {/* Decorative outer ring */}
          <circle
            cx={CX} cy={CY} r={R + 2}
            fill="none"
            stroke="#6d28d9"
            strokeWidth={5}
          />
          {/* Pointer triangle fixed at 12 o'clock */}
          <polygon
            points={`${CX},${CY - R - 5} ${CX - 11},${CY - R + 11} ${CX + 11},${CY - R + 11}`}
            fill="#FCD34D"
            stroke="#0f0f1a"
            strokeWidth={1.5}
          />
        </svg>

        {/* ── SPIN button centred over the hub ─────────────────── */}
        {/* pointer-events-none on the wrapper, auto on the button itself */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <ShimmerButton
            onClick={spin}
            disabled={disabled || isSpinning}
            aria-label={isSpinning ? 'Spinning…' : 'Spin the wheel'}
            className="pointer-events-auto rounded-full text-xs font-black tracking-[0.15em]"
            style={{
              // Scale proportionally with the SVG so the button always covers the hub
              width:     `${hubPct.toFixed(2)}%`,
              aspectRatio: '1 / 1',
              minWidth:  '44px',  // iOS touch-target floor
              minHeight: '44px',
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
