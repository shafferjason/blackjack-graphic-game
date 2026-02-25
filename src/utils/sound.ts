/**
 * Premium sound effects system using Web Audio API.
 * All sounds are synthesized programmatically — no audio file assets needed (0 KB).
 * High-fidelity layered synthesis with:
 *  - Proper ADSR envelopes for natural attack/decay
 *  - Convolution reverb for spatial depth
 *  - Multiband filtering for warmth
 *  - Normalized output levels across all effects
 *  - Configurable master volume with smooth ramping
 */

const MUTE_KEY = 'blackjack-sound-muted'
const VOLUME_KEY = 'blackjack-sound-volume'

let audioCtx: AudioContext | null = null
let masterGain: GainNode | null = null
let limiterNode: DynamicsCompressorNode | null = null
let muted = false

// Default master volume (0-1)
const DEFAULT_VOLUME = 0.55
let masterVolume = DEFAULT_VOLUME

// Restore preferences
try {
  muted = localStorage.getItem(MUTE_KEY) === 'true'
  const storedVol = localStorage.getItem(VOLUME_KEY)
  if (storedVol !== null) {
    const parsed = parseFloat(storedVol)
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
      masterVolume = parsed
    }
  }
} catch {
  // ignore
}

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext()
    // Limiter to prevent clipping
    limiterNode = audioCtx.createDynamicsCompressor()
    limiterNode.threshold.value = -6
    limiterNode.knee.value = 12
    limiterNode.ratio.value = 8
    limiterNode.attack.value = 0.002
    limiterNode.release.value = 0.05
    limiterNode.connect(audioCtx.destination)

    masterGain = audioCtx.createGain()
    masterGain.gain.value = muted ? 0 : masterVolume
    masterGain.connect(limiterNode)
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

function getMaster(): GainNode {
  getCtx()
  return masterGain!
}

// ── Public API: Mute ──

export function isMuted(): boolean {
  return muted
}

export function setMuted(value: boolean): void {
  muted = value
  try { localStorage.setItem(MUTE_KEY, String(value)) } catch { /* ignore */ }
  if (masterGain && audioCtx) {
    const now = audioCtx.currentTime
    masterGain.gain.cancelScheduledValues(now)
    masterGain.gain.setValueAtTime(masterGain.gain.value, now)
    masterGain.gain.linearRampToValueAtTime(value ? 0 : masterVolume, now + 0.05)
  }
}

export function toggleMute(): boolean {
  setMuted(!muted)
  return muted
}

// ── Public API: Volume ──

export function getVolume(): number {
  return masterVolume
}

export function setVolume(value: number): void {
  masterVolume = Math.max(0, Math.min(1, value))
  try { localStorage.setItem(VOLUME_KEY, String(masterVolume)) } catch { /* ignore */ }
  if (masterGain && audioCtx && !muted) {
    const now = audioCtx.currentTime
    masterGain.gain.cancelScheduledValues(now)
    masterGain.gain.setValueAtTime(masterGain.gain.value, now)
    masterGain.gain.linearRampToValueAtTime(masterVolume, now + 0.04)
  }
}

// ── Helpers ──

/** Create convolution reverb impulse response */
function createReverb(ctx: AudioContext, duration: number, decay: number): ConvolverNode {
  const length = Math.ceil(ctx.sampleRate * duration)
  const impulse = ctx.createBuffer(2, length, ctx.sampleRate)
  for (let ch = 0; ch < 2; ch++) {
    const data = impulse.getChannelData(ch)
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay)
    }
  }
  const conv = ctx.createConvolver()
  conv.buffer = impulse
  return conv
}

/** Generate noise buffer with envelope shaping */
function noiseBuffer(ctx: AudioContext, duration: number, envelope: (t: number) => number): AudioBuffer {
  const len = Math.ceil(ctx.sampleRate * duration)
  const buf = ctx.createBuffer(1, len, ctx.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < len; i++) {
    data[i] = (Math.random() * 2 - 1) * envelope(i / len)
  }
  return buf
}

// ── Sound Generators ──

/** Card deal — crisp paper snap with table thud and air movement */
export function playCardDeal(): void {
  if (muted) return
  const ctx = getCtx()
  const dest = getMaster()
  const now = ctx.currentTime

  // Layer 1: Crisp high-frequency transient (card snap)
  const snapDur = 0.035
  const snapBuf = noiseBuffer(ctx, snapDur, t => Math.pow(1 - t, 4))
  const snap = ctx.createBufferSource()
  snap.buffer = snapBuf
  const snapBP = ctx.createBiquadFilter()
  snapBP.type = 'bandpass'
  snapBP.frequency.value = 5000
  snapBP.Q.value = 0.9
  const snapGain = ctx.createGain()
  snapGain.gain.setValueAtTime(0.28, now)
  snapGain.gain.exponentialRampToValueAtTime(0.001, now + snapDur)
  snap.connect(snapBP).connect(snapGain).connect(dest)
  snap.start(now)
  snap.stop(now + snapDur)

  // Layer 2: Mid-body paper texture
  const bodyDur = 0.055
  const bodyBuf = noiseBuffer(ctx, bodyDur, t => Math.pow(1 - t, 2.5))
  const body = ctx.createBufferSource()
  body.buffer = bodyBuf
  const bodyBP = ctx.createBiquadFilter()
  bodyBP.type = 'bandpass'
  bodyBP.frequency.value = 2400
  bodyBP.Q.value = 0.7
  const bodyGain = ctx.createGain()
  bodyGain.gain.setValueAtTime(0.14, now)
  bodyGain.gain.exponentialRampToValueAtTime(0.001, now + bodyDur)
  body.connect(bodyBP).connect(bodyGain).connect(dest)
  body.start(now)
  body.stop(now + bodyDur)

  // Layer 3: Warm table thud
  const thump = ctx.createOscillator()
  thump.type = 'sine'
  thump.frequency.setValueAtTime(180, now + 0.008)
  thump.frequency.exponentialRampToValueAtTime(70, now + 0.045)
  const thumpGain = ctx.createGain()
  thumpGain.gain.setValueAtTime(0.06, now + 0.008)
  thumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.055)
  thump.connect(thumpGain).connect(dest)
  thump.start(now + 0.008)
  thump.stop(now + 0.055)

  // Layer 4: Air movement (very subtle)
  const airDur = 0.04
  const airBuf = noiseBuffer(ctx, airDur, t => Math.sin(Math.PI * t) * 0.5)
  const airSrc = ctx.createBufferSource()
  airSrc.buffer = airBuf
  const airHP = ctx.createBiquadFilter()
  airHP.type = 'highpass'
  airHP.frequency.value = 6000
  const airGain = ctx.createGain()
  airGain.gain.value = 0.03
  airSrc.connect(airHP).connect(airGain).connect(dest)
  airSrc.start(now)
  airSrc.stop(now + airDur)
}

/** Chip place — ceramic chip with ring and settle */
export function playChipPlace(): void {
  if (muted) return
  const ctx = getCtx()
  const dest = getMaster()
  const now = ctx.currentTime

  // Primary ceramic impact
  const osc = ctx.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(2000, now)
  osc.frequency.exponentialRampToValueAtTime(850, now + 0.025)
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.16, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05)
  osc.connect(gain).connect(dest)
  osc.start(now)
  osc.stop(now + 0.05)

  // Ceramic ring resonance
  const ring = ctx.createOscillator()
  ring.type = 'sine'
  ring.frequency.setValueAtTime(3200, now)
  ring.frequency.exponentialRampToValueAtTime(2400, now + 0.035)
  const ringGain = ctx.createGain()
  ringGain.gain.setValueAtTime(0.04, now)
  ringGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06)
  ring.connect(ringGain).connect(dest)
  ring.start(now)
  ring.stop(now + 0.06)

  // Secondary settle click
  const osc2 = ctx.createOscillator()
  osc2.type = 'sine'
  osc2.frequency.setValueAtTime(1300, now + 0.012)
  osc2.frequency.exponentialRampToValueAtTime(650, now + 0.04)
  const gain2 = ctx.createGain()
  gain2.gain.setValueAtTime(0.08, now + 0.012)
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.055)
  osc2.connect(gain2).connect(dest)
  osc2.start(now + 0.012)
  osc2.stop(now + 0.055)

  // Impact texture
  const nDur = 0.02
  const nBuf = noiseBuffer(ctx, nDur, t => Math.pow(1 - t, 5))
  const nSrc = ctx.createBufferSource()
  nSrc.buffer = nBuf
  const nHP = ctx.createBiquadFilter()
  nHP.type = 'highpass'
  nHP.frequency.value = 3500
  const nGain = ctx.createGain()
  nGain.gain.setValueAtTime(0.05, now)
  nGain.gain.exponentialRampToValueAtTime(0.001, now + nDur)
  nSrc.connect(nHP).connect(nGain).connect(dest)
  nSrc.start(now)
  nSrc.stop(now + nDur)
}

/** Chips collecting — cascading ceramic chips sliding */
export function playChipCollect(): void {
  if (muted) return
  const ctx = getCtx()
  const dest = getMaster()
  const now = ctx.currentTime

  // Cascading ceramic clicks
  for (let i = 0; i < 6; i++) {
    const t = now + i * 0.03
    const freq = 1400 + i * 150 + Math.random() * 80
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, t)
    osc.frequency.exponentialRampToValueAtTime(550, t + 0.022)
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.08, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03)
    osc.connect(gain).connect(dest)
    osc.start(t)
    osc.stop(t + 0.03)
  }

  // Sliding noise bed
  const dur = 0.2
  const buf = noiseBuffer(ctx, dur, t => Math.sin(Math.PI * t) * 0.3)
  const src = ctx.createBufferSource()
  src.buffer = buf
  const hp = ctx.createBiquadFilter()
  hp.type = 'highpass'
  hp.frequency.value = 2800
  const nGain = ctx.createGain()
  nGain.gain.value = 0.045
  src.connect(hp).connect(nGain).connect(dest)
  src.start(now)
  src.stop(now + dur)
}

/** Win fanfare — warm ascending major chord with reverb */
export function playWinFanfare(): void {
  if (muted) return
  const ctx = getCtx()
  const dest = getMaster()
  const now = ctx.currentTime

  // Warm reverb
  const reverb = createReverb(ctx, 0.5, 2.8)
  const reverbGain = ctx.createGain()
  reverbGain.gain.value = 0.12
  reverb.connect(reverbGain).connect(dest)

  // Major triad: C5 E5 G5
  const notes = [523.25, 659.25, 783.99]
  notes.forEach((freq, i) => {
    const t = now + i * 0.1
    // Warm triangle wave
    const osc = ctx.createOscillator()
    osc.type = 'triangle'
    osc.frequency.value = freq
    // Gentle warmth filter
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 4000
    lp.Q.value = 0.5
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.001, t)
    gain.gain.linearRampToValueAtTime(0.15, t + 0.015) // fast attack
    gain.gain.setValueAtTime(0.15, t + 0.06)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32)
    osc.connect(lp).connect(gain)
    gain.connect(dest)
    gain.connect(reverb)
    osc.start(t)
    osc.stop(t + 0.32)

    // Soft octave harmonic
    const harm = ctx.createOscillator()
    harm.type = 'sine'
    harm.frequency.value = freq * 2
    const hGain = ctx.createGain()
    hGain.gain.setValueAtTime(0.001, t)
    hGain.gain.linearRampToValueAtTime(0.03, t + 0.02)
    hGain.gain.exponentialRampToValueAtTime(0.001, t + 0.2)
    harm.connect(hGain).connect(dest)
    harm.start(t)
    harm.stop(t + 0.2)
  })
}

/** Loss — warm, sympathetic descending tone (not harsh) */
export function playLossThud(): void {
  if (muted) return
  const ctx = getCtx()
  const dest = getMaster()
  const now = ctx.currentTime

  // Deep tone
  const osc = ctx.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(140, now)
  osc.frequency.exponentialRampToValueAtTime(55, now + 0.22)
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.001, now)
  gain.gain.linearRampToValueAtTime(0.2, now + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)
  osc.connect(gain).connect(dest)
  osc.start(now)
  osc.stop(now + 0.3)

  // Warm sub rumble
  const sub = ctx.createOscillator()
  sub.type = 'sine'
  sub.frequency.setValueAtTime(70, now)
  sub.frequency.exponentialRampToValueAtTime(30, now + 0.25)
  const subGain = ctx.createGain()
  subGain.gain.setValueAtTime(0.001, now)
  subGain.gain.linearRampToValueAtTime(0.09, now + 0.01)
  subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25)
  sub.connect(subGain).connect(dest)
  sub.start(now)
  sub.stop(now + 0.25)

  // Filtered noise impact (warm, not harsh)
  const dur = 0.06
  const buf = noiseBuffer(ctx, dur, t => Math.pow(1 - t, 3))
  const noiseSrc = ctx.createBufferSource()
  noiseSrc.buffer = buf
  const lp = ctx.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 400
  const noiseGain = ctx.createGain()
  noiseGain.gain.setValueAtTime(0.1, now)
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + dur)
  noiseSrc.connect(lp).connect(noiseGain).connect(dest)
  noiseSrc.start(now)
  noiseSrc.stop(now + dur)

  // Gentle descending "wah" (softened)
  const wah = ctx.createOscillator()
  wah.type = 'triangle'
  wah.frequency.setValueAtTime(300, now + 0.04)
  wah.frequency.exponentialRampToValueAtTime(160, now + 0.25)
  const wahLP = ctx.createBiquadFilter()
  wahLP.type = 'lowpass'
  wahLP.frequency.value = 1200
  const wahGain = ctx.createGain()
  wahGain.gain.setValueAtTime(0.001, now + 0.04)
  wahGain.gain.linearRampToValueAtTime(0.04, now + 0.08)
  wahGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)
  wah.connect(wahLP).connect(wahGain).connect(dest)
  wah.start(now + 0.04)
  wah.stop(now + 0.3)
}

/** Blackjack celebration — rich arpeggio with shimmer, reverb, and sparkle */
export function playBlackjackCelebration(): void {
  if (muted) return
  const ctx = getCtx()
  const dest = getMaster()
  const now = ctx.currentTime

  // Lush reverb
  const reverb = createReverb(ctx, 0.7, 2.2)
  const reverbGain = ctx.createGain()
  reverbGain.gain.value = 0.16
  reverb.connect(reverbGain).connect(dest)

  // Arpeggio: C5 E5 G5 C6
  const notes = [523.25, 659.25, 783.99, 1046.5]
  notes.forEach((freq, i) => {
    const t = now + i * 0.085
    const osc = ctx.createOscillator()
    osc.type = 'triangle'
    osc.frequency.value = freq
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 5000
    lp.Q.value = 0.4
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.001, t)
    gain.gain.linearRampToValueAtTime(0.16, t + 0.012)
    gain.gain.setValueAtTime(0.16, t + 0.08)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45)
    osc.connect(lp).connect(gain)
    gain.connect(dest)
    gain.connect(reverb)
    osc.start(t)
    osc.stop(t + 0.45)

    // Octave harmonic
    const harm = ctx.createOscillator()
    harm.type = 'sine'
    harm.frequency.value = freq * 2
    const hGain = ctx.createGain()
    hGain.gain.setValueAtTime(0.001, t)
    hGain.gain.linearRampToValueAtTime(0.035, t + 0.015)
    hGain.gain.exponentialRampToValueAtTime(0.001, t + 0.28)
    harm.connect(hGain).connect(dest)
    harm.start(t)
    harm.stop(t + 0.28)
  })

  // Shimmer — gentle high sine with vibrato
  const shimmerOsc = ctx.createOscillator()
  shimmerOsc.type = 'sine'
  shimmerOsc.frequency.setValueAtTime(2093, now + 0.35)
  // Add gentle vibrato
  const vibrato = ctx.createOscillator()
  vibrato.type = 'sine'
  vibrato.frequency.value = 5
  const vibGain = ctx.createGain()
  vibGain.gain.value = 8
  vibrato.connect(vibGain).connect(shimmerOsc.frequency)
  vibrato.start(now + 0.35)
  vibrato.stop(now + 0.9)

  const shimmerGain = ctx.createGain()
  shimmerGain.gain.setValueAtTime(0.001, now + 0.35)
  shimmerGain.gain.linearRampToValueAtTime(0.05, now + 0.42)
  shimmerGain.gain.exponentialRampToValueAtTime(0.001, now + 0.9)
  shimmerOsc.connect(shimmerGain)
  shimmerGain.connect(dest)
  shimmerGain.connect(reverb)
  shimmerOsc.start(now + 0.35)
  shimmerOsc.stop(now + 0.9)

  // Sparkle noise burst (high and airy)
  const sparkDur = 0.12
  const sparkBuf = noiseBuffer(ctx, sparkDur, t => Math.pow(1 - t, 2.5))
  const sparkSrc = ctx.createBufferSource()
  sparkSrc.buffer = sparkBuf
  const sparkHP = ctx.createBiquadFilter()
  sparkHP.type = 'highpass'
  sparkHP.frequency.value = 7000
  const sparkGain = ctx.createGain()
  sparkGain.gain.value = 0.03
  sparkSrc.connect(sparkHP).connect(sparkGain).connect(dest)
  sparkSrc.start(now + 0.32)
  sparkSrc.stop(now + 0.32 + sparkDur)
}

/** Shuffle — realistic card riffle with flutter and body */
export function playShuffle(): void {
  if (muted) return
  const ctx = getCtx()
  const dest = getMaster()
  const now = ctx.currentTime

  const duration = 0.5
  const bufferSize = Math.ceil(ctx.sampleRate * duration)
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)

  // Modulated noise riffle with acceleration
  for (let i = 0; i < bufferSize; i++) {
    const t = i / ctx.sampleRate
    const progress = t / duration
    // Bell envelope with slight ramp-up
    const envelope = Math.sin(Math.PI * progress) * (0.65 + 0.35 * progress)
    // Flutter rate accelerates through shuffle
    const flutterRate = 55 + progress * 65
    const flutter = 0.35 + 0.65 * Math.sin(t * flutterRate * Math.PI * 2)
    data[i] = (Math.random() * 2 - 1) * envelope * flutter * 0.6
  }
  const noise = ctx.createBufferSource()
  noise.buffer = buffer

  const bp = ctx.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = 4000
  bp.Q.value = 0.6

  const gain = ctx.createGain()
  gain.gain.value = 0.12

  noise.connect(bp).connect(gain).connect(dest)
  noise.start(now)
  noise.stop(now + duration)

  // Low-frequency body
  const bodyDur = 0.4
  const bodyBuf = noiseBuffer(ctx, bodyDur, t => Math.sin(Math.PI * t) * 0.25)
  const bodySrc = ctx.createBufferSource()
  bodySrc.buffer = bodyBuf
  const bodyLP = ctx.createBiquadFilter()
  bodyLP.type = 'lowpass'
  bodyLP.frequency.value = 550
  const bodyGain = ctx.createGain()
  bodyGain.gain.value = 0.05
  bodySrc.connect(bodyLP).connect(bodyGain).connect(dest)
  bodySrc.start(now + 0.05)
  bodySrc.stop(now + 0.05 + bodyDur)

  // Subtle card-edge clicks for realism
  for (let i = 0; i < 3; i++) {
    const t = now + 0.1 + i * 0.12
    const clickBuf = noiseBuffer(ctx, 0.01, tt => Math.pow(1 - tt, 6))
    const clickSrc = ctx.createBufferSource()
    clickSrc.buffer = clickBuf
    const clickHP = ctx.createBiquadFilter()
    clickHP.type = 'highpass'
    clickHP.frequency.value = 5000
    const clickGain = ctx.createGain()
    clickGain.gain.value = 0.025
    clickSrc.connect(clickHP).connect(clickGain).connect(dest)
    clickSrc.start(t)
    clickSrc.stop(t + 0.01)
  }
}

/** Button click — subtle, refined tactile feedback */
export function playButtonClick(): void {
  if (muted) return
  const ctx = getCtx()
  const dest = getMaster()
  const now = ctx.currentTime

  const osc = ctx.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(1000, now)
  osc.frequency.exponentialRampToValueAtTime(600, now + 0.02)
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.07, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035)
  osc.connect(gain).connect(dest)
  osc.start(now)
  osc.stop(now + 0.035)

  // Tiny click texture
  const nDur = 0.008
  const nBuf = noiseBuffer(ctx, nDur, t => Math.pow(1 - t, 6))
  const nSrc = ctx.createBufferSource()
  nSrc.buffer = nBuf
  const nHP = ctx.createBiquadFilter()
  nHP.type = 'highpass'
  nHP.frequency.value = 4000
  const nGain = ctx.createGain()
  nGain.gain.value = 0.025
  nSrc.connect(nHP).connect(nGain).connect(dest)
  nSrc.start(now)
  nSrc.stop(now + nDur)
}

/** Stand — warm, confident confirmation tone */
export function playStand(): void {
  if (muted) return
  const ctx = getCtx()
  const dest = getMaster()
  const now = ctx.currentTime

  // First tone — clear, resolute
  const osc1 = ctx.createOscillator()
  osc1.type = 'triangle'
  osc1.frequency.value = 660
  const lp1 = ctx.createBiquadFilter()
  lp1.type = 'lowpass'
  lp1.frequency.value = 3000
  const g1 = ctx.createGain()
  g1.gain.setValueAtTime(0.001, now)
  g1.gain.linearRampToValueAtTime(0.1, now + 0.008)
  g1.gain.exponentialRampToValueAtTime(0.001, now + 0.14)
  osc1.connect(lp1).connect(g1).connect(dest)
  osc1.start(now)
  osc1.stop(now + 0.14)

  // Second tone — lower, confirming
  const osc2 = ctx.createOscillator()
  osc2.type = 'triangle'
  osc2.frequency.value = 550
  const lp2 = ctx.createBiquadFilter()
  lp2.type = 'lowpass'
  lp2.frequency.value = 2800
  const g2 = ctx.createGain()
  g2.gain.setValueAtTime(0.001, now + 0.07)
  g2.gain.linearRampToValueAtTime(0.08, now + 0.078)
  g2.gain.exponentialRampToValueAtTime(0.001, now + 0.2)
  osc2.connect(lp2).connect(g2).connect(dest)
  osc2.start(now + 0.07)
  osc2.stop(now + 0.2)
}

/** Bust — controlled descending impact (firm but not harsh) */
export function playBust(): void {
  if (muted) return
  const ctx = getCtx()
  const dest = getMaster()
  const now = ctx.currentTime

  // Filtered noise burst (warm bandpass, not harsh)
  const dur = 0.05
  const buf = noiseBuffer(ctx, dur, t => Math.pow(1 - t, 2.5))
  const src = ctx.createBufferSource()
  src.buffer = buf
  const bp = ctx.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = 1400
  bp.Q.value = 0.8
  const nGain = ctx.createGain()
  nGain.gain.setValueAtTime(0.15, now)
  nGain.gain.exponentialRampToValueAtTime(0.001, now + dur)
  src.connect(bp).connect(nGain).connect(dest)
  src.start(now)
  src.stop(now + dur)

  // Descending impact — triangle wave for warmth (not sawtooth)
  const osc = ctx.createOscillator()
  osc.type = 'triangle'
  osc.frequency.setValueAtTime(350, now)
  osc.frequency.exponentialRampToValueAtTime(80, now + 0.18)
  const lp = ctx.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 1500
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.001, now)
  gain.gain.linearRampToValueAtTime(0.1, now + 0.008)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22)
  osc.connect(lp).connect(gain).connect(dest)
  osc.start(now)
  osc.stop(now + 0.22)
}

/** Push / tie — neutral, balanced tone */
export function playPush(): void {
  if (muted) return
  const ctx = getCtx()
  const dest = getMaster()
  const now = ctx.currentTime

  // Two balanced tones
  const osc = ctx.createOscillator()
  osc.type = 'triangle'
  osc.frequency.value = 440
  const lp = ctx.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 2500
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.001, now)
  gain.gain.linearRampToValueAtTime(0.11, now + 0.01)
  gain.gain.setValueAtTime(0.11, now + 0.06)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26)
  osc.connect(lp).connect(gain).connect(dest)
  osc.start(now)
  osc.stop(now + 0.26)

  // Mirror tone — slightly delayed for balance feeling
  const osc2 = ctx.createOscillator()
  osc2.type = 'triangle'
  osc2.frequency.value = 440
  const lp2 = ctx.createBiquadFilter()
  lp2.type = 'lowpass'
  lp2.frequency.value = 2500
  const g2 = ctx.createGain()
  g2.gain.setValueAtTime(0.001, now + 0.04)
  g2.gain.linearRampToValueAtTime(0.065, now + 0.05)
  g2.gain.exponentialRampToValueAtTime(0.001, now + 0.22)
  osc2.connect(lp2).connect(g2).connect(dest)
  osc2.start(now + 0.04)
  osc2.stop(now + 0.22)
}
