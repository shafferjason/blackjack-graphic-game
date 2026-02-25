/**
 * Professional sound effects system using Web Audio API.
 * All sounds are synthesized programmatically — no audio file assets needed (0 KB).
 * Upgraded with layered synthesis, reverb tails, and volume normalization.
 */

const STORAGE_KEY = 'blackjack-sound-muted'

let audioCtx: AudioContext | null = null
let masterGain: GainNode | null = null
let muted = false

// Master volume level (0-1) for normalization
const MASTER_VOLUME = 0.6

// Restore mute preference
try {
  muted = localStorage.getItem(STORAGE_KEY) === 'true'
} catch {
  // ignore
}

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext()
    masterGain = audioCtx.createGain()
    masterGain.gain.value = MASTER_VOLUME
    masterGain.connect(audioCtx.destination)
  }
  // Resume if suspended (autoplay policy)
  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

function getMaster(): GainNode {
  getCtx()
  return masterGain!
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

// ── Helper: create a convolver for short reverb tail ──
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

// ── Sound Generators ──

/** Card deal — layered paper snap with body */
export function playCardDeal(): void {
  if (muted) return
  const ctx = getCtx()
  const dest = getMaster()
  const now = ctx.currentTime

  // Layer 1: Sharp transient snap (high-frequency noise)
  const snapDur = 0.04
  const snapBuf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * snapDur), ctx.sampleRate)
  const snapData = snapBuf.getChannelData(0)
  for (let i = 0; i < snapData.length; i++) {
    const env = Math.pow(1 - i / snapData.length, 3)
    snapData[i] = (Math.random() * 2 - 1) * env
  }
  const snap = ctx.createBufferSource()
  snap.buffer = snapBuf
  const snapBP = ctx.createBiquadFilter()
  snapBP.type = 'bandpass'
  snapBP.frequency.value = 4500
  snapBP.Q.value = 1.2
  const snapGain = ctx.createGain()
  snapGain.gain.setValueAtTime(0.35, now)
  snapGain.gain.exponentialRampToValueAtTime(0.001, now + snapDur)
  snap.connect(snapBP).connect(snapGain).connect(dest)
  snap.start(now)
  snap.stop(now + snapDur)

  // Layer 2: Papery body (mid-frequency noise, slightly longer)
  const bodyDur = 0.07
  const bodyBuf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * bodyDur), ctx.sampleRate)
  const bodyData = bodyBuf.getChannelData(0)
  for (let i = 0; i < bodyData.length; i++) {
    const env = Math.pow(1 - i / bodyData.length, 2)
    bodyData[i] = (Math.random() * 2 - 1) * env
  }
  const body = ctx.createBufferSource()
  body.buffer = bodyBuf
  const bodyBP = ctx.createBiquadFilter()
  bodyBP.type = 'bandpass'
  bodyBP.frequency.value = 2200
  bodyBP.Q.value = 0.8
  const bodyGain = ctx.createGain()
  bodyGain.gain.setValueAtTime(0.18, now)
  bodyGain.gain.exponentialRampToValueAtTime(0.001, now + bodyDur)
  body.connect(bodyBP).connect(bodyGain).connect(dest)
  body.start(now)
  body.stop(now + bodyDur)

  // Layer 3: Subtle low thump for table contact
  const thump = ctx.createOscillator()
  thump.type = 'sine'
  thump.frequency.setValueAtTime(200, now + 0.01)
  thump.frequency.exponentialRampToValueAtTime(80, now + 0.05)
  const thumpGain = ctx.createGain()
  thumpGain.gain.setValueAtTime(0.08, now + 0.01)
  thumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06)
  thump.connect(thumpGain).connect(dest)
  thump.start(now + 0.01)
  thump.stop(now + 0.06)
}

/** Chip clack — ceramic chips stacking with resonance */
export function playChipPlace(): void {
  if (muted) return
  const ctx = getCtx()
  const dest = getMaster()
  const now = ctx.currentTime

  // Primary ceramic click
  const osc = ctx.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(2200, now)
  osc.frequency.exponentialRampToValueAtTime(900, now + 0.03)
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.2, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06)
  osc.connect(gain).connect(dest)
  osc.start(now)
  osc.stop(now + 0.06)

  // Secondary resonance click
  const osc2 = ctx.createOscillator()
  osc2.type = 'sine'
  osc2.frequency.setValueAtTime(1400, now + 0.015)
  osc2.frequency.exponentialRampToValueAtTime(700, now + 0.05)
  const gain2 = ctx.createGain()
  gain2.gain.setValueAtTime(0.1, now + 0.015)
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.07)
  osc2.connect(gain2).connect(dest)
  osc2.start(now + 0.015)
  osc2.stop(now + 0.07)

  // Noise texture for ceramic character
  const nDur = 0.025
  const nBuf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * nDur), ctx.sampleRate)
  const nData = nBuf.getChannelData(0)
  for (let i = 0; i < nData.length; i++) {
    nData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / nData.length, 4)
  }
  const nSrc = ctx.createBufferSource()
  nSrc.buffer = nBuf
  const nHP = ctx.createBiquadFilter()
  nHP.type = 'highpass'
  nHP.frequency.value = 3000
  const nGain = ctx.createGain()
  nGain.gain.setValueAtTime(0.08, now)
  nGain.gain.exponentialRampToValueAtTime(0.001, now + nDur)
  nSrc.connect(nHP).connect(nGain).connect(dest)
  nSrc.start(now)
  nSrc.stop(now + nDur)
}

/** Chips sliding / collecting — cascading chip sounds */
export function playChipCollect(): void {
  if (muted) return
  const ctx = getCtx()
  const dest = getMaster()
  const now = ctx.currentTime

  // Multiple rapid ceramic clicks for chip stack sliding
  for (let i = 0; i < 5; i++) {
    const t = now + i * 0.035
    const freq = 1500 + i * 180 + Math.random() * 100
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, t)
    osc.frequency.exponentialRampToValueAtTime(600, t + 0.025)
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.10, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035)
    osc.connect(gain).connect(dest)
    osc.start(t)
    osc.stop(t + 0.035)
  }

  // Subtle noise bed for sliding character
  const dur = 0.18
  const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < data.length; i++) {
    const env = Math.sin(Math.PI * i / data.length)
    data[i] = (Math.random() * 2 - 1) * env * 0.3
  }
  const src = ctx.createBufferSource()
  src.buffer = buf
  const hp = ctx.createBiquadFilter()
  hp.type = 'highpass'
  hp.frequency.value = 2500
  const nGain = ctx.createGain()
  nGain.gain.value = 0.06
  src.connect(hp).connect(nGain).connect(dest)
  src.start(now)
  src.stop(now + dur)
}

/** Win fanfare — ascending chord with warm harmonics */
export function playWinFanfare(): void {
  if (muted) return
  const ctx = getCtx()
  const dest = getMaster()
  const now = ctx.currentTime

  // Short reverb for warmth
  const reverb = createReverb(ctx, 0.4, 3)
  const reverbGain = ctx.createGain()
  reverbGain.gain.value = 0.15
  reverb.connect(reverbGain).connect(dest)

  const notes = [523.25, 659.25, 783.99] // C5 E5 G5
  notes.forEach((freq, i) => {
    const t = now + i * 0.11
    // Main tone
    const osc = ctx.createOscillator()
    osc.type = 'triangle'
    osc.frequency.value = freq
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.18, t)
    gain.gain.setValueAtTime(0.18, t + 0.08)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3)
    osc.connect(gain)
    gain.connect(dest)
    gain.connect(reverb)
    osc.start(t)
    osc.stop(t + 0.3)

    // Soft harmonic layer
    const harm = ctx.createOscillator()
    harm.type = 'sine'
    harm.frequency.value = freq * 2
    const hGain = ctx.createGain()
    hGain.gain.setValueAtTime(0.04, t)
    hGain.gain.exponentialRampToValueAtTime(0.001, t + 0.2)
    harm.connect(hGain).connect(dest)
    harm.start(t)
    harm.stop(t + 0.2)
  })
}

/** Loss thud — deep impact with rumble */
export function playLossThud(): void {
  if (muted) return
  const ctx = getCtx()
  const dest = getMaster()
  const now = ctx.currentTime

  // Deep impact tone
  const osc = ctx.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(160, now)
  osc.frequency.exponentialRampToValueAtTime(50, now + 0.25)
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.28, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35)
  osc.connect(gain).connect(dest)
  osc.start(now)
  osc.stop(now + 0.35)

  // Sub-bass layer for weight
  const sub = ctx.createOscillator()
  sub.type = 'sine'
  sub.frequency.setValueAtTime(80, now)
  sub.frequency.exponentialRampToValueAtTime(30, now + 0.3)
  const subGain = ctx.createGain()
  subGain.gain.setValueAtTime(0.12, now)
  subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)
  sub.connect(subGain).connect(dest)
  sub.start(now)
  sub.stop(now + 0.3)

  // Noise impact texture
  const dur = 0.08
  const bufSz = Math.ceil(ctx.sampleRate * dur)
  const buf = ctx.createBuffer(1, bufSz, ctx.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < bufSz; i++) {
    d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufSz, 3)
  }
  const noiseSrc = ctx.createBufferSource()
  noiseSrc.buffer = buf
  const lp = ctx.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 350
  const noiseGain = ctx.createGain()
  noiseGain.gain.setValueAtTime(0.14, now)
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + dur)
  noiseSrc.connect(lp).connect(noiseGain).connect(dest)
  noiseSrc.start(now)
  noiseSrc.stop(now + dur)

  // Descending "wah" for emotional weight
  const wah = ctx.createOscillator()
  wah.type = 'triangle'
  wah.frequency.setValueAtTime(350, now + 0.05)
  wah.frequency.exponentialRampToValueAtTime(180, now + 0.3)
  const wahGain = ctx.createGain()
  wahGain.gain.setValueAtTime(0, now + 0.05)
  wahGain.gain.linearRampToValueAtTime(0.06, now + 0.1)
  wahGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35)
  wah.connect(wahGain).connect(dest)
  wah.start(now + 0.05)
  wah.stop(now + 0.35)
}

/** Blackjack celebration — rich arpeggio with shimmer and reverb */
export function playBlackjackCelebration(): void {
  if (muted) return
  const ctx = getCtx()
  const dest = getMaster()
  const now = ctx.currentTime

  // Reverb for spaciousness
  const reverb = createReverb(ctx, 0.6, 2.5)
  const reverbGain = ctx.createGain()
  reverbGain.gain.value = 0.2
  reverb.connect(reverbGain).connect(dest)

  // Arpeggio: C5 E5 G5 C6
  const notes = [523.25, 659.25, 783.99, 1046.5]
  notes.forEach((freq, i) => {
    const t = now + i * 0.09
    const osc = ctx.createOscillator()
    osc.type = 'triangle'
    osc.frequency.value = freq
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.2, t)
    gain.gain.setValueAtTime(0.2, t + 0.1)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45)
    osc.connect(gain)
    gain.connect(dest)
    gain.connect(reverb)
    osc.start(t)
    osc.stop(t + 0.45)

    // Octave harmonic
    const harm = ctx.createOscillator()
    harm.type = 'sine'
    harm.frequency.value = freq * 2
    const hGain = ctx.createGain()
    hGain.gain.setValueAtTime(0.05, t)
    hGain.gain.exponentialRampToValueAtTime(0.001, t + 0.3)
    harm.connect(hGain).connect(dest)
    harm.start(t)
    harm.stop(t + 0.3)
  })

  // Shimmer layer — gentle high sine
  const shimmerOsc = ctx.createOscillator()
  shimmerOsc.type = 'sine'
  shimmerOsc.frequency.setValueAtTime(2093, now + 0.35)
  const shimmerGain = ctx.createGain()
  shimmerGain.gain.setValueAtTime(0, now + 0.35)
  shimmerGain.gain.linearRampToValueAtTime(0.07, now + 0.45)
  shimmerGain.gain.exponentialRampToValueAtTime(0.001, now + 0.9)
  shimmerOsc.connect(shimmerGain)
  shimmerGain.connect(dest)
  shimmerGain.connect(reverb)
  shimmerOsc.start(now + 0.35)
  shimmerOsc.stop(now + 0.9)

  // Sparkle noise burst
  const sparkDur = 0.15
  const sparkBuf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * sparkDur), ctx.sampleRate)
  const sparkData = sparkBuf.getChannelData(0)
  for (let i = 0; i < sparkData.length; i++) {
    const env = Math.pow(1 - i / sparkData.length, 2)
    sparkData[i] = (Math.random() * 2 - 1) * env
  }
  const sparkSrc = ctx.createBufferSource()
  sparkSrc.buffer = sparkBuf
  const sparkHP = ctx.createBiquadFilter()
  sparkHP.type = 'highpass'
  sparkHP.frequency.value = 6000
  const sparkGain = ctx.createGain()
  sparkGain.gain.value = 0.04
  sparkSrc.connect(sparkHP).connect(sparkGain).connect(dest)
  sparkSrc.start(now + 0.3)
  sparkSrc.stop(now + 0.3 + sparkDur)
}

/** Shuffle — realistic card riffling with flutter */
export function playShuffle(): void {
  if (muted) return
  const ctx = getCtx()
  const dest = getMaster()
  const now = ctx.currentTime

  const duration = 0.45
  const bufferSize = Math.ceil(ctx.sampleRate * duration)
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)

  // Modulated noise for riffle with acceleration
  for (let i = 0; i < bufferSize; i++) {
    const t = i / ctx.sampleRate
    const progress = t / duration
    const envelope = Math.sin(Math.PI * progress) * (0.7 + 0.3 * progress)
    // Flutter rate accelerates as shuffle progresses
    const flutterRate = 60 + progress * 60
    const flutter = 0.4 + 0.6 * Math.sin(t * flutterRate * Math.PI * 2)
    data[i] = (Math.random() * 2 - 1) * envelope * flutter * 0.7
  }
  const noise = ctx.createBufferSource()
  noise.buffer = buffer

  const bp = ctx.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = 3800
  bp.Q.value = 0.7

  const gain = ctx.createGain()
  gain.gain.value = 0.14

  noise.connect(bp).connect(gain).connect(dest)
  noise.start(now)
  noise.stop(now + duration)

  // Subtle card-body low freq component
  const bodyDur = 0.35
  const bodyBuf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * bodyDur), ctx.sampleRate)
  const bodyData = bodyBuf.getChannelData(0)
  for (let i = 0; i < bodyData.length; i++) {
    const t = i / ctx.sampleRate
    const env = Math.sin(Math.PI * t / bodyDur)
    bodyData[i] = (Math.random() * 2 - 1) * env * 0.3
  }
  const bodySrc = ctx.createBufferSource()
  bodySrc.buffer = bodyBuf
  const bodyLP = ctx.createBiquadFilter()
  bodyLP.type = 'lowpass'
  bodyLP.frequency.value = 600
  const bodyGain = ctx.createGain()
  bodyGain.gain.value = 0.06
  bodySrc.connect(bodyLP).connect(bodyGain).connect(dest)
  bodySrc.start(now + 0.05)
  bodySrc.stop(now + 0.05 + bodyDur)
}

/** Subtle click for button presses — refined */
export function playButtonClick(): void {
  if (muted) return
  const ctx = getCtx()
  const dest = getMaster()
  const now = ctx.currentTime

  const osc = ctx.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(1100, now)
  osc.frequency.exponentialRampToValueAtTime(650, now + 0.025)

  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.09, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04)

  osc.connect(gain).connect(dest)
  osc.start(now)
  osc.stop(now + 0.04)
}

/** Stand confirmation — confident double-tone */
export function playStand(): void {
  if (muted) return
  const ctx = getCtx()
  const dest = getMaster()
  const now = ctx.currentTime

  // First tone — resolute
  const osc1 = ctx.createOscillator()
  osc1.type = 'triangle'
  osc1.frequency.value = 660
  const g1 = ctx.createGain()
  g1.gain.setValueAtTime(0.12, now)
  g1.gain.exponentialRampToValueAtTime(0.001, now + 0.15)
  osc1.connect(g1).connect(dest)
  osc1.start(now)
  osc1.stop(now + 0.15)

  // Second tone — confirming (lower)
  const osc2 = ctx.createOscillator()
  osc2.type = 'triangle'
  osc2.frequency.value = 550
  const g2 = ctx.createGain()
  g2.gain.setValueAtTime(0.10, now + 0.08)
  g2.gain.exponentialRampToValueAtTime(0.001, now + 0.22)
  osc2.connect(g2).connect(dest)
  osc2.start(now + 0.08)
  osc2.stop(now + 0.22)
}

/** Bust — harsh descending impact */
export function playBust(): void {
  if (muted) return
  const ctx = getCtx()
  const dest = getMaster()
  const now = ctx.currentTime

  // Sharp noise burst
  const dur = 0.06
  const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2)
  }
  const src = ctx.createBufferSource()
  src.buffer = buf
  const bp = ctx.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = 1500
  bp.Q.value = 1.0
  const nGain = ctx.createGain()
  nGain.gain.setValueAtTime(0.2, now)
  nGain.gain.exponentialRampToValueAtTime(0.001, now + dur)
  src.connect(bp).connect(nGain).connect(dest)
  src.start(now)
  src.stop(now + dur)

  // Descending impact
  const osc = ctx.createOscillator()
  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(400, now)
  osc.frequency.exponentialRampToValueAtTime(80, now + 0.2)
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.12, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25)
  osc.connect(gain).connect(dest)
  osc.start(now)
  osc.stop(now + 0.25)
}

/** Push / tie sound — neutral balanced tone */
export function playPush(): void {
  if (muted) return
  const ctx = getCtx()
  const dest = getMaster()
  const now = ctx.currentTime

  // Two balanced tones (same pitch = tie feeling)
  const osc = ctx.createOscillator()
  osc.type = 'triangle'
  osc.frequency.value = 440

  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.14, now)
  gain.gain.setValueAtTime(0.14, now + 0.08)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)

  osc.connect(gain).connect(dest)
  osc.start(now)
  osc.stop(now + 0.3)

  // Mirror tone slightly delayed for "balance" feeling
  const osc2 = ctx.createOscillator()
  osc2.type = 'triangle'
  osc2.frequency.value = 440
  const g2 = ctx.createGain()
  g2.gain.setValueAtTime(0.08, now + 0.05)
  g2.gain.exponentialRampToValueAtTime(0.001, now + 0.25)
  osc2.connect(g2).connect(dest)
  osc2.start(now + 0.05)
  osc2.stop(now + 0.25)
}
