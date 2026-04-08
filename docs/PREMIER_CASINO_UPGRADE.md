# Premier Casino Experience Upgrade

Design system documentation and rationale for the luxury casino visual overhaul.

## Design Philosophy

Transform a functional card game into an immersive casino experience. Every visual element should evoke the feeling of sitting at a high-end casino table: warm lighting, tactile materials, subtle ambient motion, and confident premium typography.

**Core principles:**
- **Depth over flatness** — layered shadows, vignettes, and radial lighting create the illusion of a physical space
- **Warmth through gold** — gold accents throughout create luxury cohesion without gaudy excess
- **Restraint in motion** — animations enhance feedback without becoming distracting
- **Performance first** — only `transform` and `opacity` are animated; particle counts are capped

---

## What Changed and Why

### 1. Luxury Visual Theme System

**CSS Custom Properties** (`index.css`)
- Added `--gold-deep`, `--gold-glow`, `--bg-deeper`, `--bg-surface` for richer depth layering
- Added `--shadow-ambient`, `--shadow-card`, `--shadow-elevated`, `--shadow-gold-glow` — standardized elevation system with consistent shadow language
- Added `--ease-premium`, `--ease-bounce`, `--ease-smooth` — named motion curves so animations feel unified
- Added `--duration-fast/normal/slow` — consistent timing across all interactions
- Added `--border-subtle`, `--border-gold` — reusable border tokens

**Why:** A well-defined token system ensures visual consistency. Instead of ad-hoc `rgba()` values scattered across files, named tokens make the design language intentional and maintainable.

### 2. Table & Environment Ambience

**Table background** (`App.css .table`)
- Added overhead spotlight radial gradient simulating a casino pendant light
- Enhanced corner shadows (4 additional radial gradients) for cinema-grade vignetting
- Deepened the vignette from 15%→18% mid + 35%→45% edge for more dramatic focus
- Enhanced felt texture noise for subtle woven fiber feel

**Ambient Particles** (new `AmbientParticles.tsx`)
- 12 CSS-animated floating gold dust motes over the table surface
- Uses `will-change: transform` and simple keyframes — no JS per frame
- Respects `prefers-reduced-motion`

**Why:** Real casino tables sit under dramatic overhead lighting with visible dust particles in the air. These subtle environment touches add depth without competing with gameplay.

### 3. Cards & Chips — Premium Styling

**Cards** (`Card.css`)
- Enhanced hover: lifts 8px (was 6px) with subtle golden glow halo
- Added `.card-win` class: green glow pulse with `cardWinPulse` animation
- Added `.card-blackjack` class: gold glow for blackjack wins
- Added `.card-lose` class: subtle desaturation (`brightness(0.85) saturate(0.7)`) with delayed transition for graceful fade
- Card backs now have a subtle sheen overlay (`::after` pseudo-element) simulating light reflection

**Chips** (`App.css .chip`)
- Enhanced 3-layer shadow: ambient + near + deep for realistic stacking depth
- Added inner ring pseudo-element (`::before`) for casino chip detail
- Distinct active/press state (`scale(0.97)`) for tactile feedback
- $100 chip gets dedicated golden glow shadow
- All chip gradients shifted to 145deg with 3-stop for dimensional roundness

**Score Pills**
- Added `tabular-nums` for stable digit rendering
- Added transition animations on state changes
- Bust state now has a bounce animation (`scoreBustPulse`)

**Why:** Cards and chips are the primary interactive objects. Premium shadows and micro-animations make them feel like physical objects rather than flat rectangles.

### 4. Slot Machine Enhancements

The slot machine was already extensively styled with a 3D neon cabinet, PixiJS reels, and comprehensive particle effects. This upgrade focused on:

- Verified and preserved all existing 3D effects, glass reflections, chrome bezels
- Confirmed reel motion curves and anticipation timing are already well-implemented
- Maintained all win line effects and celebratory moments (coin shower, particle bursts)
- No changes needed — the slot implementation is already at premier quality

### 5. Polished Transitions & Micro-interactions

**Header** (`App.css .header`)
- Added gold accent line (`::after`) — gradient that fades from center for subtle luxury
- Enhanced depth shadow under header bar
- Title is now uppercase with wider letter-spacing

**Buttons** (`App.css .btn-*`)
- Primary buttons: shimmer sweep effect on hover (CSS `::after` transition)
- All action buttons (Hit/Stand/Double): uppercase, 700 weight, 1px letter-spacing
- Enhanced glow halos on hover for Hit (green), Stand (red), Double (gold)
- Inner highlight (`inset 0 1px 0`) on all action buttons for 3D bevel feel

**Banners**
- Win banner: bounce-in animation (`bannerWinGlow`), green glow shadow
- Blackjack banner: gold glow with extended `text-shadow`
- Lose banner: fade-in animation (`bannerLoseFade`)
- All banners: smooth `transition: all 0.4s` for state changes

**Settings & Modals**
- Overlay: fade-in animation, stronger blur (8px vs 4px)
- Panel: slide-up animation with scale from 0.97→1
- Toggle buttons: glass morphism style (rounded rect, backdrop blur, gold hover glow)

**Footer**
- Gold accent line on top edge
- Enhanced typography weight and letter-spacing

**Why:** Micro-interactions bridge the gap between "functional" and "premium." The shimmer on Deal, bounce on Win, and fade on Loss provide emotional feedback that matches the game outcome.

### 6. Audio Enhancements

**Ambient Casino Room Tone** (`sound.ts`)
- Extended loop duration (4s → 6s) for more natural looping
- Added stereo offset between channels for spatial depth
- Added subtle 60Hz sine undertone beneath the brownian noise for bass warmth
- Extended crossfade region (2000 → 4000 samples) for seamless loop
- Added low-shelf filter (+3dB at 120Hz) for richer room presence
- Slightly increased ambient volume (0.025 → 0.03) for better presence

**Why:** The ambient room tone is the foundation of immersion. A richer, warmer tone with stereo depth makes the player feel like they're physically in a casino.

### 7. Responsive Layout

The existing responsive system was already comprehensive with 5 breakpoints:
- `< 375px` — iPhone SE / extra-small
- `375-413px` — iPhone standard
- `414-599px` — Medium phones
- `600-767px` — Small tablets / landscape
- `768px+` — Tablets & desktop
- `1024px+` — Large desktop

**Enhancements:**
- Desktop controls area: rounded top corners, increased padding, refined background gradient
- Desktop header: wider padding and larger title for widescreen
- All new CSS additions are inherently responsive via relative units and existing breakpoint structure

---

## Performance Considerations

| Technique | Implementation |
|---|---|
| GPU compositing | All animations use `transform` and `opacity` only |
| `will-change` hints | Applied to animated particles and chips |
| CSS-only particles | `AmbientParticles` uses keyframe animation, no JS per frame |
| Reduced motion | All new animations respect `prefers-reduced-motion` |
| Minimal DOM additions | Only 12 particle elements added to the DOM |
| No layout thrash | Shadows, filters, and glows use box-shadow and CSS filters |

---

## Color Palette Reference

| Token | Value | Usage |
|---|---|---|
| `--gold` | `#d4a644` | Primary accent, buttons, borders |
| `--gold-light` | `#f0d68a` | Text highlights, title |
| `--gold-deep` | `#a07c30` | Deep gold for shadows |
| `--gold-glow` | `rgba(212,166,68,0.35)` | Glow halos |
| `--bg-dark` | `#080c16` | Primary background |
| `--bg-deeper` | `#050810` | Deepest layer |
| `--bg-surface` | `#0e1424` | Card surfaces, panels |
| `--felt` | `#0b6623` | Casino felt green (customizable) |

---

## Typography

- **Display:** `'Playfair Display', serif` — Headers, titles, banner text
- **Body:** `'Inter', system-ui, sans-serif` — All UI text, buttons, labels
- **Numeric:** `font-variant-numeric: tabular-nums` on all score/chip displays
- **Buttons:** `text-transform: uppercase; letter-spacing: 1px; font-weight: 700`

---

## Files Modified

| File | Changes |
|---|---|
| `src/index.css` | Extended CSS custom properties, body vignette |
| `src/App.css` | Header, table, banner, controls, chips, buttons, footer, modals, responsive |
| `src/App.tsx` | Import and render AmbientParticles |
| `src/components/Card.css` | Win/loss states, card-back sheen, enhanced hover |
| `src/components/GameModeSelector.css` | Premium tab bar styling |
| `src/components/AmbientParticles.tsx` | New — floating dust particles |
| `src/components/AmbientParticles.css` | New — particle keyframe animation |
| `src/utils/sound.ts` | Richer ambient room tone with stereo depth |
| `docs/PREMIER_CASINO_UPGRADE.md` | This document |
