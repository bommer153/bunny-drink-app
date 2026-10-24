// Tiny Web Audio synth + haptics, so the app ships no audio files.

const SOUND_KEY = 'bdg:sound'

let ctx: AudioContext | null = null
let enabled = (() => {
  try { return localStorage.getItem(SOUND_KEY) !== 'off' } catch { return true }
})()

export const isSoundOn = () => enabled

export function setSoundOn(on: boolean) {
  enabled = on
  try { localStorage.setItem(SOUND_KEY, on ? 'on' : 'off') } catch { /* private mode: session-only */ }
}

function tone(freq: number, ms: number, type: OscillatorType = 'triangle', delay = 0) {
  if (!enabled) return
  ctx ??= new AudioContext()
  if (ctx.state === 'suspended') ctx.resume() // iOS starts contexts suspended
  const t = ctx.currentTime + delay
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  gain.gain.setValueAtTime(0.2, t)
  gain.gain.exponentialRampToValueAtTime(0.001, t + ms / 1000)
  osc.connect(gain).connect(ctx.destination)
  osc.start(t)
  osc.stop(t + ms / 1000)
}

const vibrate = (pattern: number | number[]) => navigator.vibrate?.(pattern)

export const sfx = {
  tap:     () => { tone(660, 60); vibrate(15) },
  flip:    () => { tone(440, 90); tone(880, 140, 'triangle', 0.08); vibrate([40, 30, 40]) },
  tick:    () => { tone(1000, 50, 'square'); vibrate(20) },
  timeUp:  () => { tone(140, 500, 'sawtooth'); vibrate([300, 80, 300]) },
  penalty: () => { tone(220, 150, 'square'); tone(160, 320, 'square', 0.15); vibrate([120, 60, 220]) },
  win:     () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, 160, 'triangle', i * 0.09)); vibrate([60, 40, 60]) },
}
