/**
 * Premium sound effects system using Web Audio API.
 * All sounds are synthesized programmatically — no audio file assets needed (0 KB).
 * High-fidelity layered synthesis with modern casino quality:
 *  - Per-profile EQ and dynamics processing (warmth, punch)
 *  - Convolution reverb for spatial depth
 *  - Multiband filtering — low-shelf warmth, high-shelf rolloff
 *  - Proper ADSR envelopes for natural attack/sustain/decay
 *  - Two selectable profiles: "classic" and "modern-casino"
 *  - Subtle ambient casino atmosphere in modern profile
 *  - Configurable master volume with smooth ramping
 */

export type SoundProfile = 'classic' | 'modern-casino'

const MUTE_KEY = 'blackjack-sound-muted'
const VOLUME_KEY = 'blackjack-sound-volume'
const PROFILE_KEY = 'blackjack-sound-profile'

let audioCtx: AudioContext | null = null
let masterGain: GainNode | null = null
let limiterNode: DynamicsCompressorNode | null = null
let eqLowShelf: BiquadFilterNode | null = null
let eqHighShelf: BiquadFilterNode | null = null
let muted = false
let ambienceSource: AudioBufferSourceNode | null = null
let ambienceGain: GainNode | null = null

// Default master volume (0-1)
const DEFAULT_VOLUME = 0.55
let masterVolume = DEFAULT_VOLUME

let currentProfile: SoundProfile = 'modern-casino'

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
  const storedProfile = localStorage.getItem(PROFILE_KEY)
  if (storedProfile === 'classic' || storedProfile === 'modern-casino') {
    currentProfile = storedProfile
  }
} catch {
  // ignore
}

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext()
    // Bus-level dynamics compressor — transparent limiting
    limiterNode = audioCtx.createDynamicsCompressor()
    limiterNode.threshold.value = -8
    limiterNode.knee.value = 10
    limiterNode.ratio.value = 6
    limiterNode.attack.value = 0.003
    limiterNode.release.value = 0.08
    limiterNode.connect(audioCtx.destination)

    // EQ chain: low-shelf warmth + high-shelf taming
    eqHighShelf = audioCtx.createBiquadFilter()
    eqHighShelf.type = 'highshelf'
    eqHighShelf.frequency.value = 6000
    eqHighShelf.connect(limiterNode)

    eqLowShelf = audioCtx.createBiquadFilter()
    eqLowShelf.type = 'lowshelf'
    eqLowShelf.frequency.value = 250
    eqLowShelf.connect(eqHighShelf)

    applyProfileEQ()

    masterGain = audioCtx.createGain()
    masterGain.gain.value = muted ? 0 : masterVolume
    masterGain.connect(eqLowShelf)
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

function applyProfileEQ() {
  if (!eqLowShelf || !eqHighShelf) return
  if (currentProfile === 'modern-casino') {
    // Warm and punchy — boost lows, gentle high rolloff
    eqLowShelf.gain.value = 3.5
    eqHighShelf.gain.value = -2.5
  } else {
    // Classic — neutral/flat
    eqLowShelf.gain.value = 0
    eqHighShelf.gain.value = 0
  }
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
  // Control ambience
  if (ambienceGain && audioCtx) {
    const now = audioCtx.currentTime
    ambienceGain.gain.cancelScheduledValues(now)
    ambienceGain.gain.setValueAtTime(ambienceGain.gain.value, now)
    ambienceGain.gain.linearRampToValueAtTime(value ? 0 : 0.025, now + 0.1)
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

// ── Public API: Sound Profile ──

export function getSoundProfile(): SoundProfile {
  return currentProfile
}

export function setSoundProfile(profile: SoundProfile): void {
  currentProfile = profile
  try { localStorage.setItem(PROFILE_KEY, profile) } catch { /* ignore */ }
  applyProfileEQ()
  // Toggle ambience
  if (profile === 'modern-casino') {
    startAmbience()
  } else {
    stopAmbience()
  }
}

// ── Ambience — subtle casino room tone ──

function startAmbience(): void {
  if (muted || !audioCtx || ambienceSource) return
  const ctx = getCtx()
  // Generate a long low-level room-tone loop (subtle filtered noise)
  const dur = 4
  const len = Math.ceil(ctx.sampleRate * dur)
  const buf = ctx.createBuffer(2, len, ctx.sampleRate)
  for (let ch = 0; ch < 2; ch++) {
    const data = buf.getChannelData(ch)
    // Brownian noise (warm rumble)
    let prev = 0
    for (let i = 0; i < len; i++) {
      prev += (Math.random() * 2 - 1) * 0.03
      prev *= 0.998
      data[i] = prev
    }
    // Smooth loop point — fade last 2000 samples
    const fade = Math.min(2000, len / 4)
    for (let i = 0; i < fade; i++) {
      const t = i / fade
      data[len - fade + i] *= (1 - t)
      data[i] = data[i] * t + data[len - fade + i] * (1 - t)
    }
  }
  const src = ctx.createBufferSource()
  src.buffer = buf
  src.loop = true

  // Bandpass to isolate room-tone character
  const bp = ctx.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = 180
  bp.Q.value = 0.3

  const gn = ctx.createGain()
  gn.gain.value = muted ? 0 : 0.025

  src.connect(bp).connect(gn).connect(ctx.destination)
  src.start()
  ambienceSource = src
  ambienceGain = gn
}

function stopAmbience(): void {
  if (ambienceSource) {
    try { ambienceSource.stop() } catch { /* ignore */ }
    ambienceSource = null
    ambienceGain = null
  }
}

/** Initialize ambience if appropriate (call once after first user interaction) */
export function initAmbience(): void {
  if (currentProfile === 'modern-casino' && !ambienceSource && !muted) {
    startAmbience()
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

/** Profile-aware gain multiplier */
function profileGain(): number {
  return currentProfile === 'modern-casino' ? 1.0 : 0.85
}

/** Profile-aware reverb duration */
function profileReverb(): { dur: number; decay: number } {
  return currentProfile === 'modern-casino'
    ? { dur: 0.8, decay: 2.0 }
    : { dur: 0.3, decay: 3.5 }
}

// ── Sound Generators ──

/** Card deal — crisp paper snap with warm table thud and air */
export function playCardDeal(): void {
  if (muted) return
  const ctx = getCtx()
  const dest = getMaster()
  const now = ctx.currentTime
  const pg = profileGain()
  const isModern = currentProfile === 'modern-casino'

  // Layer 1: Crisp high-frequency transient (card snap)
  const snapDur = 0.035
  const snapBuf = noiseBuffer(ctx, snapDur, t => Math.pow(1 - t, 4))
  const snap = ctx.createBufferSource()
  snap.buffer = snapBuf
  const snapBP = ctx.createBiquadFilter()
  snapBP.type = 'bandpass'
  snapBP.frequency.value = isModern ? 4200 : 5000
  snapBP.Q.value = 0.8
  const snapGain = ctx.createGain()
  snapGain.gain.setValueAtTime(0.24 * pg, now)
  snapGain.gain.exponentialRampToValueAtTime(0.001, now + snapDur)
  snap.connect(snapBP).connect(snapGain).connect(dest)
  snap.start(now)
  snap.stop(now + snapDur)

  // Layer 2: Mid-body paper texture
  const bodyDur = 0.06
  const bodyBuf = noiseBuffer(ctx, bodyDur, t => Math.pow(1 - t, 2.5))
  const body = ctx.createBufferSource()
  body.buffer = bodyBuf
  const bodyBP = ctx.createBiquadFilter()
  bodyBP.type = 'bandpass'
  bodyBP.frequency.value = isModern ? 2000 : 2400
  bodyBP.Q.value = 0.6
  const bodyGain = ctx.createGain()
  bodyGain.gain.setValueAtTime(0.15 * pg, now)
  bodyGain.gain.exponentialRampToValueAtTime(0.001, now + bodyDur)
  body.connect(bodyBP).connect(bodyGain).connect(dest)
  body.start(now)
  body.stop(now + bodyDur)

  // Layer 3: Warm table thud (sine body)
  const thump = ctx.createOscillator()
  thump.type = 'sine'
  thump.frequency.setValueAtTime(isModern ? 160 : 180, now + 0.008)
  thump.frequency.exponentialRampToValueAtTime(60, now + 0.05)
  const thumpLP = ctx.createBiquadFilter()
  thumpLP.type = 'lowpass'
  thumpLP.frequency.value = isModern ? 300 : 500
  const thumpGain = ctx.createGain()
  thumpGain.gain.setValueAtTime(0.07 * pg, now + 0.008)
  thumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06)
  thump.connect(thumpLP).connect(thumpGain).connect(dest)
  thump.start(now + 0.008)
  thump.stop(now + 0.06)

  // Layer 4: Air movement (very subtle)
  const airDur = 0.045
  const airBuf = noiseBuffer(ctx, airDur, t => Math.sin(Math.PI * t) * 0.5)
  const airSrc = ctx.createBufferSource()
  airSrc.buffer = airBuf
  const airHP = ctx.createBiquadFilter()
  airHP.type = 'highpass'
  airHP.frequency.value = 5500
  const airGain = ctx.createGain()
  airGain.gain.value = 0.02 * pg
  airSrc.connect(airHP).connect(airGain).connect(dest)
  airSrc.start(now)
  airSrc.stop(now + airDur)

  // Modern profile: subtle room reverb tail on the snap
  if (isModern) {
    const rev = createReverb(ctx, 0.25, 3.5)
    const revGain = ctx.createGain()
    revGain.gain.value = 0.04
    rev.connect(revGain).connect(dest)
    snapGain.connect(rev)
  }
}

/** Chip place — ceramic chip with ring and settle */
export function playChipPlace(): void {
  if (muted) return
  const ctx = getCtx()
  const dest = getMaster()
  const now = ctx.currentTime
  const pg = profileGain()
  const isModern = currentProfile === 'modern-casino'

  // Primary ceramic impact
  const osc = ctx.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(isModern ? 1800 : 2000, now)
  osc.frequency.exponentialRampToValueAtTime(800, now + 0.025)
  const impactLP = ctx.createBiquadFilter()
  impactLP.type = 'lowpass'
  impactLP.frequency.value = isModern ? 3000 : 5000
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.14 * pg, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05)
  osc.connect(impactLP).connect(gain).connect(dest)
  osc.start(now)
  osc.stop(now + 0.05)

  // Ceramic ring resonance
  const ring = ctx.createOscillator()
  ring.type = 'sine'
  ring.frequency.setValueAtTime(isModern ? 2800 : 3200, now)
  ring.frequency.exponentialRampToValueAtTime(2200, now + 0.04)
  const ringLP = ctx.createBiquadFilter()
  ringLP.type = 'lowpass'
  ringLP.frequency.value = isModern ? 3500 : 6000
  const ringGain = ctx.createGain()
  ringGain.gain.setValueAtTime(0.035 * pg, now)
  ringGain.gain.exponentialRampToValueAtTime(0.001, now + 0.065)
  ring.connect(ringLP).connect(ringGain).connect(dest)
  ring.start(now)
  ring.stop(now + 0.065)

  // Secondary settle click
  const osc2 = ctx.createOscillator()
  osc2.type = 'sine'
  osc2.frequency.setValueAtTime(isModern ? 1200 : 1300, now + 0.014)
  osc2.frequency.exponentialRampToValueAtTime(600, now + 0.042)
  const gain2 = ctx.createGain()
  gain2.gain.setValueAtTime(0.07 * pg, now + 0.014)
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.055)
  osc2.connect(gain2).connect(dest)
  osc2.start(now + 0.014)
  osc2.stop(now + 0.055)

  // Impact texture — warm filtered
  const nDur = 0.022
  const nBuf = noiseBuffer(ctx, nDur, t => Math.pow(1 - t, 5))
  const nSrc = ctx.createBufferSource()
  nSrc.buffer = nBuf
  const nHP = ctx.createBiquadFilter()
  nHP.type = 'highpass'
  nHP.frequency.value = isModern ? 2800 : 3500
  const nGain = ctx.createGain()
  nGain.gain.setValueAtTime(0.04 * pg, now)
  nGain.gain.exponentialRampToValueAtTime(0.001, now + nDur)
  nSrc.connect(nHP).connect(nGain).connect(dest)
  nSrc.start(now)
  nSrc.stop(now + nDur)

  // Table surface resonance (modern only)
  if (isModern) {
    const tableOsc = ctx.createOscillator()
    tableOsc.type = 'sine'
    tableOsc.frequency.setValueAtTime(120, now + 0.005)
    tableOsc.frequency.exponentialRampToValueAtTime(50, now + 0.04)
    const tableGain = ctx.createGain()
    tableGain.gain.setValueAtTime(0.03, now + 0.005)
    tableGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04)
    tableOsc.connect(tableGain).connect(dest)
    tableOsc.start(now + 0.005)
    tableOsc.stop(now + 0.04)
  }
}

/** Chips collecting — cascading ceramic chips sliding */
export function playChipCollect(): void {
  if (muted) return
  const ctx = getCtx()
  const dest = getMaster()
  const now = ctx.currentTime
  const pg = profileGain()
  const isModern = currentProfile === 'modern-casino'

  // Cascading ceramic clicks
  const chipCount = isModern ? 8 : 6
  for (let i = 0; i < chipCount; i++) {
    const t = now + i * (isModern ? 0.025 : 0.03)
    const baseFreq = isModern ? 1200 : 1400
    const freq = baseFreq + i * 120 + Math.random() * 60
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, t)
    osc.frequency.exponentialRampToValueAtTime(450, t + 0.025)
    const chipLP = ctx.createBiquadFilter()
    chipLP.type = 'lowpass'
    chipLP.frequency.value = isModern ? 3000 : 5000
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.07 * pg, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03)
    osc.connect(chipLP).connect(gain).connect(dest)
    osc.start(t)
    osc.stop(t + 0.03)
  }

  // Sliding noise bed
  const dur = isModern ? 0.25 : 0.2
  const buf = noiseBuffer(ctx, dur, t => Math.sin(Math.PI * t) * 0.3)
  const src = ctx.createBufferSource()
  src.buffer = buf
  const bp = ctx.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = isModern ? 2000 : 2800
  bp.Q.value = 0.5
  const nGain = ctx.createGain()
  nGain.gain.value = 0.04 * pg
  src.connect(bp).connect(nGain).connect(dest)
  src.start(now)
  src.stop(now + dur)

  // Modern: subtle reverb tail on collection
  if (isModern) {
    const rev = createReverb(ctx, 0.35, 2.8)
    const revGain = ctx.createGain()
    revGain.gain.value = 0.05
    rev.connect(revGain).connect(dest)
    nGain.connect(rev)
  }
}

/** Win fanfare — warm ascending major chord with reverb */
export function playWinFanfare(): void {
  if (muted) return
  const ctx = getCtx()
  const dest = getMaster()
  const now = ctx.currentTime
  const pg = profileGain()
  const isModern = currentProfile === 'modern-casino'
  const rv = profileReverb()

  // Warm reverb
  const reverb = createReverb(ctx, rv.dur, rv.decay)
  const reverbGain = ctx.createGain()
  reverbGain.gain.value = isModern ? 0.15 : 0.08
  reverb.connect(reverbGain).connect(dest)

  // Major triad: C5 E5 G5
  const notes = [523.25, 659.25, 783.99]
  notes.forEach((freq, i) => {
    const t = now + i * 0.1
    // Warm triangle wave
    const osc = ctx.createOscillator()
    osc.type = 'triangle'
    osc.frequency.value = freq
    // Warmth filter
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = isModern ? 3200 : 4000
    lp.Q.value = 0.5
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.001, t)
    gain.gain.linearRampToValueAtTime(0.14 * pg, t + 0.015)
    gain.gain.setValueAtTime(0.14 * pg, t + 0.06)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35)
    osc.connect(lp).connect(gain)
    gain.connect(dest)
    gain.connect(reverb)
    osc.start(t)
    osc.stop(t + 0.35)

    // Soft octave harmonic
    const harm = ctx.createOscillator()
    harm.type = 'sine'
    harm.frequency.value = freq * 2
    const hGain = ctx.createGain()
    hGain.gain.setValueAtTime(0.001, t)
    hGain.gain.linearRampToValueAtTime(0.025 * pg, t + 0.02)
    hGain.gain.exponentialRampToValueAtTime(0.001, t + 0.22)
    harm.connect(hGain).connect(dest)
    harm.start(t)
    harm.stop(t + 0.22)

    // Modern: sub warmth on root note
    if (isModern && i === 0) {
      const sub = ctx.createOscillator()
      sub.type = 'sine'
      sub.frequency.value = freq / 2
      const subGain = ctx.createGain()
      subGain.gain.setValueAtTime(0.001, t)
      subGain.gain.linearRampToValueAtTime(0.04, t + 0.02)
      subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.3)
      sub.connect(subGain).connect(dest)
      sub.start(t)
      sub.stop(t + 0.3)
    }
  })
}

/** Loss — warm, sympathetic descending tone (not harsh) */
export function playLossThud(): void {
  if (muted) return
  const ctx = getCtx()
  const dest = getMaster()
  const now = ctx.currentTime
  const pg = profileGain()
  const isModern = currentProfile === 'modern-casino'

  // Deep tone
  const osc = ctx.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(isModern ? 120 : 140, now)
  osc.frequency.exponentialRampToValueAtTime(50, now + 0.24)
  const lossLP = ctx.createBiquadFilter()
  lossLP.type = 'lowpass'
  lossLP.frequency.value = isModern ? 400 : 600
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.001, now)
  gain.gain.linearRampToValueAtTime(0.18 * pg, now + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)
  osc.connect(lossLP).connect(gain).connect(dest)
  osc.start(now)
  osc.stop(now + 0.3)

  // Warm sub rumble
  const sub = ctx.createOscillator()
  sub.type = 'sine'
  sub.frequency.setValueAtTime(65, now)
  sub.frequency.exponentialRampToValueAtTime(28, now + 0.25)
  const subGain = ctx.createGain()
  subGain.gain.setValueAtTime(0.001, now)
  subGain.gain.linearRampToValueAtTime(0.08 * pg, now + 0.01)
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
  lp.frequency.value = isModern ? 350 : 400
  const noiseGain = ctx.createGain()
  noiseGain.gain.setValueAtTime(0.09 * pg, now)
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + dur)
  noiseSrc.connect(lp).connect(noiseGain).connect(dest)
  noiseSrc.start(now)
  noiseSrc.stop(now + dur)

  // Gentle descending "wah" (softened, lowpassed)
  const wah = ctx.createOscillator()
  wah.type = 'triangle'
  wah.frequency.setValueAtTime(isModern ? 260 : 300, now + 0.04)
  wah.frequency.exponentialRampToValueAtTime(140, now + 0.25)
  const wahLP = ctx.createBiquadFilter()
  wahLP.type = 'lowpass'
  wahLP.frequency.value = isModern ? 800 : 1200
  const wahGain = ctx.createGain()
  wahGain.gain.setValueAtTime(0.001, now + 0.04)
  wahGain.gain.linearRampToValueAtTime(0.035 * pg, now + 0.08)
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
  const pg = profileGain()
  const isModern = currentProfile === 'modern-casino'
  const rv = profileReverb()

  // Lush reverb
  const reverb = createReverb(ctx, rv.dur + 0.2, rv.decay)
  const reverbGain = ctx.createGain()
  reverbGain.gain.value = isModern ? 0.18 : 0.1
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
    lp.frequency.value = isModern ? 4000 : 5000
    lp.Q.value = 0.4
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.001, t)
    gain.gain.linearRampToValueAtTime(0.15 * pg, t + 0.012)
    gain.gain.setValueAtTime(0.15 * pg, t + 0.08)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5)
    osc.connect(lp).connect(gain)
    gain.connect(dest)
    gain.connect(reverb)
    osc.start(t)
    osc.stop(t + 0.5)

    // Octave harmonic
    const harm = ctx.createOscillator()
    harm.type = 'sine'
    harm.frequency.value = freq * 2
    const hGain = ctx.createGain()
    hGain.gain.setValueAtTime(0.001, t)
    hGain.gain.linearRampToValueAtTime(0.03 * pg, t + 0.015)
    hGain.gain.exponentialRampToValueAtTime(0.001, t + 0.3)
    harm.connect(hGain).connect(dest)
    harm.start(t)
    harm.stop(t + 0.3)

    // Modern: sub-bass warmth on root
    if (isModern && i === 0) {
      const sub = ctx.createOscillator()
      sub.type = 'sine'
      sub.frequency.value = freq / 2
      const subGain = ctx.createGain()
      subGain.gain.setValueAtTime(0.001, t)
      subGain.gain.linearRampToValueAtTime(0.05, t + 0.02)
      subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4)
      sub.connect(subGain).connect(dest)
      sub.start(t)
      sub.stop(t + 0.4)
    }
  })

  // Shimmer — gentle high sine with vibrato
  const shimmerOsc = ctx.createOscillator()
  shimmerOsc.type = 'sine'
  shimmerOsc.frequency.setValueAtTime(2093, now + 0.35)
  const vibrato = ctx.createOscillator()
  vibrato.type = 'sine'
  vibrato.frequency.value = 5
  const vibGain = ctx.createGain()
  vibGain.gain.value = 8
  vibrato.connect(vibGain).connect(shimmerOsc.frequency)
  vibrato.start(now + 0.35)
  vibrato.stop(now + 0.95)

  const shimmerLP = ctx.createBiquadFilter()
  shimmerLP.type = 'lowpass'
  shimmerLP.frequency.value = isModern ? 3500 : 5000
  const shimmerGain = ctx.createGain()
  shimmerGain.gain.setValueAtTime(0.001, now + 0.35)
  shimmerGain.gain.linearRampToValueAtTime(0.04 * pg, now + 0.42)
  shimmerGain.gain.exponentialRampToValueAtTime(0.001, now + 0.95)
  shimmerOsc.connect(shimmerLP).connect(shimmerGain)
  shimmerGain.connect(dest)
  shimmerGain.connect(reverb)
  shimmerOsc.start(now + 0.35)
  shimmerOsc.stop(now + 0.95)

  // Sparkle noise burst (high and airy, softened in modern)
  const sparkDur = 0.12
  const sparkBuf = noiseBuffer(ctx, sparkDur, t => Math.pow(1 - t, 2.5))
  const sparkSrc = ctx.createBufferSource()
  sparkSrc.buffer = sparkBuf
  const sparkHP = ctx.createBiquadFilter()
  sparkHP.type = 'highpass'
  sparkHP.frequency.value = isModern ? 6000 : 7000
  const sparkLP = ctx.createBiquadFilter()
  sparkLP.type = 'lowpass'
  sparkLP.frequency.value = isModern ? 10000 : 20000
  const sparkGain = ctx.createGain()
  sparkGain.gain.value = 0.025 * pg
  sparkSrc.connect(sparkHP).connect(sparkLP).connect(sparkGain).connect(dest)
  sparkSrc.start(now + 0.32)
  sparkSrc.stop(now + 0.32 + sparkDur)
}

/** Shuffle — realistic card riffle with flutter and body */
export function playShuffle(): void {
  if (muted) return
  const ctx = getCtx()
  const dest = getMaster()
  const now = ctx.currentTime
  const pg = profileGain()
  const isModern = currentProfile === 'modern-casino'

  const duration = isModern ? 0.55 : 0.5
  const bufferSize = Math.ceil(ctx.sampleRate * duration)
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)

  // Modulated noise riffle with acceleration
  for (let i = 0; i < bufferSize; i++) {
    const t = i / ctx.sampleRate
    const progress = t / duration
    const envelope = Math.sin(Math.PI * progress) * (0.65 + 0.35 * progress)
    const flutterRate = 55 + progress * 65
    const flutter = 0.35 + 0.65 * Math.sin(t * flutterRate * Math.PI * 2)
    data[i] = (Math.random() * 2 - 1) * envelope * flutter * 0.6
  }
  const noise = ctx.createBufferSource()
  noise.buffer = buffer

  const bp = ctx.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = isModern ? 3500 : 4000
  bp.Q.value = 0.5

  const gain = ctx.createGain()
  gain.gain.value = 0.11 * pg

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
  bodyLP.frequency.value = isModern ? 450 : 550
  const bodyGain = ctx.createGain()
  bodyGain.gain.value = isModern ? 0.06 : 0.05
  bodySrc.connect(bodyLP).connect(bodyGain).connect(dest)
  bodySrc.start(now + 0.05)
  bodySrc.stop(now + 0.05 + bodyDur)

  // Card-edge clicks for realism
  const clickCount = isModern ? 4 : 3
  for (let i = 0; i < clickCount; i++) {
    const t = now + 0.08 + i * 0.1
    const clickBuf = noiseBuffer(ctx, 0.012, tt => Math.pow(1 - tt, 6))
    const clickSrc = ctx.createBufferSource()
    clickSrc.buffer = clickBuf
    const clickHP = ctx.createBiquadFilter()
    clickHP.type = 'highpass'
    clickHP.frequency.value = isModern ? 4200 : 5000
    const clickGain = ctx.createGain()
    clickGain.gain.value = 0.022 * pg
    clickSrc.connect(clickHP).connect(clickGain).connect(dest)
    clickSrc.start(t)
    clickSrc.stop(t + 0.012)
  }

  // Modern: reverb tail
  if (isModern) {
    const rev = createReverb(ctx, 0.3, 3.0)
    const revGain = ctx.createGain()
    revGain.gain.value = 0.04
    rev.connect(revGain).connect(dest)
    gain.connect(rev)
  }
}

/** Button click — subtle, refined tactile feedback */
export function playButtonClick(): void {
  if (muted) return
  const ctx = getCtx()
  const dest = getMaster()
  const now = ctx.currentTime
  const pg = profileGain()
  const isModern = currentProfile === 'modern-casino'

  const osc = ctx.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(isModern ? 900 : 1000, now)
  osc.frequency.exponentialRampToValueAtTime(isModern ? 500 : 600, now + 0.02)
  const clickLP = ctx.createBiquadFilter()
  clickLP.type = 'lowpass'
  clickLP.frequency.value = isModern ? 2000 : 4000
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.06 * pg, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035)
  osc.connect(clickLP).connect(gain).connect(dest)
  osc.start(now)
  osc.stop(now + 0.035)

  // Tiny click texture
  const nDur = 0.008
  const nBuf = noiseBuffer(ctx, nDur, t => Math.pow(1 - t, 6))
  const nSrc = ctx.createBufferSource()
  nSrc.buffer = nBuf
  const nHP = ctx.createBiquadFilter()
  nHP.type = 'highpass'
  nHP.frequency.value = isModern ? 3500 : 4000
  const nGain = ctx.createGain()
  nGain.gain.value = 0.02 * pg
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
  const pg = profileGain()
  const isModern = currentProfile === 'modern-casino'

  // First tone — clear, resolute
  const osc1 = ctx.createOscillator()
  osc1.type = 'triangle'
  osc1.frequency.value = isModern ? 620 : 660
  const lp1 = ctx.createBiquadFilter()
  lp1.type = 'lowpass'
  lp1.frequency.value = isModern ? 2500 : 3000
  const g1 = ctx.createGain()
  g1.gain.setValueAtTime(0.001, now)
  g1.gain.linearRampToValueAtTime(0.09 * pg, now + 0.008)
  g1.gain.exponentialRampToValueAtTime(0.001, now + 0.15)
  osc1.connect(lp1).connect(g1).connect(dest)
  osc1.start(now)
  osc1.stop(now + 0.15)

  // Second tone — lower, confirming
  const osc2 = ctx.createOscillator()
  osc2.type = 'triangle'
  osc2.frequency.value = isModern ? 520 : 550
  const lp2 = ctx.createBiquadFilter()
  lp2.type = 'lowpass'
  lp2.frequency.value = isModern ? 2200 : 2800
  const g2 = ctx.createGain()
  g2.gain.setValueAtTime(0.001, now + 0.07)
  g2.gain.linearRampToValueAtTime(0.07 * pg, now + 0.078)
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
  const pg = profileGain()
  const isModern = currentProfile === 'modern-casino'

  // Filtered noise burst (warm bandpass)
  const dur = 0.05
  const buf = noiseBuffer(ctx, dur, t => Math.pow(1 - t, 2.5))
  const src = ctx.createBufferSource()
  src.buffer = buf
  const bp = ctx.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = isModern ? 1200 : 1400
  bp.Q.value = 0.7
  const nGain = ctx.createGain()
  nGain.gain.setValueAtTime(0.13 * pg, now)
  nGain.gain.exponentialRampToValueAtTime(0.001, now + dur)
  src.connect(bp).connect(nGain).connect(dest)
  src.start(now)
  src.stop(now + dur)

  // Descending impact — triangle wave for warmth
  const osc = ctx.createOscillator()
  osc.type = 'triangle'
  osc.frequency.setValueAtTime(isModern ? 300 : 350, now)
  osc.frequency.exponentialRampToValueAtTime(70, now + 0.18)
  const lp = ctx.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = isModern ? 1200 : 1500
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.001, now)
  gain.gain.linearRampToValueAtTime(0.09 * pg, now + 0.008)
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
  const pg = profileGain()
  const isModern = currentProfile === 'modern-casino'

  // Two balanced tones
  const osc = ctx.createOscillator()
  osc.type = 'triangle'
  osc.frequency.value = 440
  const lp = ctx.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = isModern ? 2000 : 2500
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.001, now)
  gain.gain.linearRampToValueAtTime(0.1 * pg, now + 0.01)
  gain.gain.setValueAtTime(0.1 * pg, now + 0.06)
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
  lp2.frequency.value = isModern ? 2000 : 2500
  const g2 = ctx.createGain()
  g2.gain.setValueAtTime(0.001, now + 0.04)
  g2.gain.linearRampToValueAtTime(0.06 * pg, now + 0.05)
  g2.gain.exponentialRampToValueAtTime(0.001, now + 0.22)
  osc2.connect(lp2).connect(g2).connect(dest)
  osc2.start(now + 0.04)
  osc2.stop(now + 0.22)
}
