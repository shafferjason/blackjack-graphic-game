/**
 * Sound effects system using Web Audio API.
 * All sounds are synthesized programmatically — no audio file assets needed (0 KB).
 */

const STORAGE_KEY = 'blackjack-sound-muted'

let audioCtx: AudioContext | null = null
let muted = false

// Restore mute preference
try {
  muted = localStorage.getItem(STORAGE_KEY) === 'true'
} catch {
  // ignore
}

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext()
  }
  // Resume if suspended (autoplay policy)
  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

export function isMuted(): boolean {
  return muted
}

export function setMuted(value: boolean): void {
  muted = value
  try {
    localStorage.setItem(STORAGE_KEY, String(value))
  } catch {
    // ignore
  }
}

export function toggleMute(): boolean {
  setMuted(!muted)
  return muted
}

// ── Sound Generators ──

/** Short percussive flick — card deal */
export function playCardDeal(): void {
  if (muted) return
  const ctx = getCtx()
  const now = ctx.currentTime

  // White noise burst for paper flick
  const duration = 0.06
  const bufferSize = Math.ceil(ctx.sampleRate * duration)
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize)
  }
  const noise = ctx.createBufferSource()
  noise.buffer = buffer

  // Bandpass filter for card-like snap
  const filter = ctx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = 3000
  filter.Q.value = 1.5

  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.25, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration)

  noise.connect(filter)
  filter.connect(gain)
  gain.connect(ctx.destination)
  noise.start(now)
  noise.stop(now + duration)
}

/** Chip clack — placing a bet */
export function playChipPlace(): void {
  if (muted) return
  const ctx = getCtx()
  const now = ctx.currentTime

  // Two short tones simulating ceramic click
  const osc = ctx.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(1800, now)
  osc.frequency.exponentialRampToValueAtTime(800, now + 0.04)

  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.2, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07)

  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(now)
  osc.stop(now + 0.07)

  // Second click slightly delayed
  const osc2 = ctx.createOscillator()
  osc2.type = 'sine'
  osc2.frequency.setValueAtTime(1200, now + 0.03)
  osc2.frequency.exponentialRampToValueAtTime(600, now + 0.06)

  const gain2 = ctx.createGain()
  gain2.gain.setValueAtTime(0.1, now + 0.03)
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.08)

  osc2.connect(gain2)
  gain2.connect(ctx.destination)
  osc2.start(now + 0.03)
  osc2.stop(now + 0.08)
}

/** Chips sliding / collecting */
export function playChipCollect(): void {
  if (muted) return
  const ctx = getCtx()
  const now = ctx.currentTime

  // Multiple rapid clicks for chip stack sliding
  for (let i = 0; i < 4; i++) {
    const t = now + i * 0.04
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(1400 + i * 200, t)
    osc.frequency.exponentialRampToValueAtTime(600, t + 0.03)

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.12, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(t)
    osc.stop(t + 0.04)
  }
}

/** Win fanfare — ascending notes */
export function playWinFanfare(): void {
  if (muted) return
  const ctx = getCtx()
  const now = ctx.currentTime

  const notes = [523.25, 659.25, 783.99] // C5 E5 G5
  notes.forEach((freq, i) => {
    const t = now + i * 0.12
    const osc = ctx.createOscillator()
    osc.type = 'triangle'
    osc.frequency.value = freq

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.18, t)
    gain.gain.setValueAtTime(0.18, t + 0.08)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(t)
    osc.stop(t + 0.25)
  })
}

/** Loss thud — low frequency bump */
export function playLossThud(): void {
  if (muted) return
  const ctx = getCtx()
  const now = ctx.currentTime

  const osc = ctx.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(150, now)
  osc.frequency.exponentialRampToValueAtTime(60, now + 0.2)

  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.3, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)

  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(now)
  osc.stop(now + 0.3)

  // Noise layer for thud texture
  const dur = 0.08
  const bufSz = Math.ceil(ctx.sampleRate * dur)
  const buf = ctx.createBuffer(1, bufSz, ctx.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < bufSz; i++) {
    d[i] = (Math.random() * 2 - 1) * (1 - i / bufSz)
  }
  const noiseSrc = ctx.createBufferSource()
  noiseSrc.buffer = buf

  const lp = ctx.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 300

  const noiseGain = ctx.createGain()
  noiseGain.gain.setValueAtTime(0.15, now)
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + dur)

  noiseSrc.connect(lp)
  lp.connect(noiseGain)
  noiseGain.connect(ctx.destination)
  noiseSrc.start(now)
  noiseSrc.stop(now + dur)
}

/** Blackjack celebration — richer fanfare */
export function playBlackjackCelebration(): void {
  if (muted) return
  const ctx = getCtx()
  const now = ctx.currentTime

  // Arpeggio: C5 E5 G5 C6
  const notes = [523.25, 659.25, 783.99, 1046.5]
  notes.forEach((freq, i) => {
    const t = now + i * 0.1
    const osc = ctx.createOscillator()
    osc.type = 'triangle'
    osc.frequency.value = freq

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.2, t)
    gain.gain.setValueAtTime(0.2, t + 0.1)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(t)
    osc.stop(t + 0.4)
  })

  // Shimmer layer
  const shimmerOsc = ctx.createOscillator()
  shimmerOsc.type = 'sine'
  shimmerOsc.frequency.setValueAtTime(2093, now + 0.3)

  const shimmerGain = ctx.createGain()
  shimmerGain.gain.setValueAtTime(0, now + 0.3)
  shimmerGain.gain.linearRampToValueAtTime(0.08, now + 0.4)
  shimmerGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8)

  shimmerOsc.connect(shimmerGain)
  shimmerGain.connect(ctx.destination)
  shimmerOsc.start(now + 0.3)
  shimmerOsc.stop(now + 0.8)
}

/** Shuffle — rapid card riffling noise */
export function playShuffle(): void {
  if (muted) return
  const ctx = getCtx()
  const now = ctx.currentTime

  const duration = 0.4
  const bufferSize = Math.ceil(ctx.sampleRate * duration)
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)

  // Modulated noise for riffle effect
  for (let i = 0; i < bufferSize; i++) {
    const t = i / ctx.sampleRate
    const envelope = Math.sin(Math.PI * t / duration) // bell curve
    const flutter = 0.5 + 0.5 * Math.sin(t * 80 * Math.PI * 2) // rapid flutter
    data[i] = (Math.random() * 2 - 1) * envelope * flutter * 0.8
  }
  const noise = ctx.createBufferSource()
  noise.buffer = buffer

  const bp = ctx.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = 4000
  bp.Q.value = 0.8

  const gain = ctx.createGain()
  gain.gain.value = 0.15

  noise.connect(bp)
  bp.connect(gain)
  gain.connect(ctx.destination)
  noise.start(now)
  noise.stop(now + duration)
}

/** Subtle click for button presses */
export function playButtonClick(): void {
  if (muted) return
  const ctx = getCtx()
  const now = ctx.currentTime

  const osc = ctx.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(1000, now)
  osc.frequency.exponentialRampToValueAtTime(600, now + 0.03)

  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.1, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05)

  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(now)
  osc.stop(now + 0.05)
}

/** Push / tie sound — neutral tone */
export function playPush(): void {
  if (muted) return
  const ctx = getCtx()
  const now = ctx.currentTime

  const osc = ctx.createOscillator()
  osc.type = 'triangle'
  osc.frequency.value = 440

  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.15, now)
  gain.gain.setValueAtTime(0.15, now + 0.1)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)

  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(now)
  osc.stop(now + 0.3)
}
