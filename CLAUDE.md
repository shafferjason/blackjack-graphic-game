# CLAUDE.md — Blackjack Face Card Implementation Guide

## CRITICAL: READ THIS ENTIRE FILE BEFORE WRITING ANY CODE

This guide tells you exactly how to build premium illustrated face cards for a blackjack game. The cards use **Canvas 2D generated character art** exported as WebP, composited with **SVG overlay animations** and **CSS effects**.

---

## ARCHITECTURE OVERVIEW

Every card is assembled from layers:

```
z-1: Background fill (CSS)
z-2: Character art (Canvas 2D → WebP → <img> or background-image)
z-3: SVG overlay (rain, glow, particles, data fragments)
z-4: Card frame (SVG, shared per tier)
z-5: Rank + suit labels (HTML text)
z-6: Animation FX layer (CSS effects for deal/win/tap)
```

**The character art is NOT SVG.** It is generated programmatically using Canvas 2D, exported as a WebP data URL or blob, and placed as the card's background image. SVG is ONLY used for lightweight animated overlay elements.

---

## WHAT NOT TO DO

**DO NOT** create flat geometric icon characters with oval faces and simple shapes. This produces generic avatars that all look the same.

**DO NOT** leave empty space on the card. The character and their environment should fill the entire 600×840 canvas.

**DO NOT** try to illustrate detailed characters using SVG paths. SVG is for overlays and animations only.

**DO NOT** give all characters the same face, body, or pose. Each character is a unique person with distinct features, expression, build, clothing, and attitude.

**DO NOT** skip the environment/background. Every character exists in a world — a rain-soaked alley, a frozen tundra, a dying star. The background is part of the illustration.

---

## CANVAS 2D CHARACTER ART — QUALITY STANDARDS

### Canvas Setup
- Canvas size: **600 × 840 pixels** (5:7 ratio, 2x retina)
- Cards display at ~150×210 on desktop, ~120×168 on mobile
- Character must read clearly at display size — strong silhouette, high contrast
- Export as WebP at quality 0.78-0.85

### What Makes a Good Character Illustration

1. **DISTINCT SILHOUETTE**: Each character should be recognizable by outline alone. A Jack should look completely different from a Queen or King in body shape, pose, and proportions.

2. **FACE WITH EXPRESSION**: Characters need eyes with pupils/irises, eyebrows that convey emotion, a mouth with expression (grinning, serene, stern, knowing), nose, and skin tone variation. NO blank oval faces.

3. **FULL BODY WITH CLOTHING DETAIL**: Show the character from roughly mid-thigh up. Clothing should have folds, layers, collars, belts, pockets, buttons, seams — not flat rectangles.

4. **HELD ITEMS / PROPS**: Each character holds or wears something unique — weapons, tools, instruments, artifacts. These define the character.

5. **ENVIRONMENT / BACKGROUND**: The full canvas should be filled. Behind the character: a scene, atmosphere, lighting, environmental elements. No empty dark voids.

6. **LIGHTING**: Every scene has a light source. Light creates highlights on skin, reflections on metal/glass, shadows on clothing, ambient glow in the environment. Use radial gradients for local lighting and linear gradients for atmospheric lighting.

7. **COLOR PALETTE**: Each skin has a specific palette (defined below). Stick to it. Use 3-5 core colors with accent highlights.

### Canvas 2D Drawing Techniques Reference

Here are the techniques you MUST use to achieve illustrated quality:

#### Faces (NEVER use a plain oval)
```javascript
// HEAD SHAPE — slightly asymmetric, with jaw definition
ctx.fillStyle = '#C68B5B'; // skin tone
ctx.beginPath();
ctx.ellipse(290, 225, 42, 50, 0, 0, Math.PI * 2);
ctx.fill();

// HAIR — layered, styled, shows personality
ctx.fillStyle = '#1A1A1A';
ctx.beginPath();
ctx.ellipse(290, 200, 46, 35, 0, Math.PI, 0);
ctx.fill();
// Add swept/styled sections with additional paths

// EYES — white, colored iris, dark pupil, positioned to show expression
ctx.fillStyle = '#FFFFFF';
ctx.beginPath();
ctx.ellipse(272, 228, 5, 3, 0, 0, Math.PI * 2); // slightly squinted = confident
ctx.fill();
ctx.fillStyle = '#1A1A1A';
ctx.beginPath();
ctx.arc(272, 228, 2, 0, Math.PI * 2); // pupil
ctx.fill();

// MOUTH — curves convey emotion
ctx.strokeStyle = '#8B4513';
ctx.lineWidth = 2;
ctx.beginPath();
ctx.arc(290, 242, 16, 0.1, Math.PI - 0.1); // grin
ctx.stroke();

// NOSE — simple but present
ctx.strokeStyle = '#A0714E';
ctx.lineWidth = 1;
ctx.beginPath();
ctx.moveTo(290, 225);
ctx.lineTo(287, 237);
ctx.stroke();
```

#### Bodies (show structure and clothing layers)
```javascript
// JACKET/COAT — not a flat rectangle, use curves for shoulders and drape
const jacket = ctx.createLinearGradient(200, 280, 380, 500);
jacket.addColorStop(0, '#151F2E');
jacket.addColorStop(1, '#0D1520');
ctx.fillStyle = jacket;
ctx.beginPath();
ctx.moveTo(220, 300);  // left shoulder
ctx.quadraticCurveTo(290, 270, 360, 300);  // shoulder line curves
ctx.lineTo(340, 490);  // body tapers
ctx.quadraticCurveTo(290, 510, 240, 490);
ctx.closePath();
ctx.fill();

// COLLAR — adds detail and dimension
ctx.strokeStyle = 'rgba(255, 0, 110, 0.2)';
ctx.lineWidth = 2;
ctx.beginPath();
ctx.moveTo(250, 300);
ctx.lineTo(290, 320);
ctx.lineTo(330, 300);
ctx.stroke();

// BELT — breaks up the body mass
ctx.fillStyle = '#0A1420';
ctx.fillRect(210, 480, 170, 8);
ctx.fillStyle = '#00E5FF'; // buckle accent
ctx.fillRect(285, 480, 20, 8);
```

#### Arms and Hands (natural pose, holding props)
```javascript
// ARMS — use quadratic curves, not straight lines
ctx.strokeStyle = '#151F2E';
ctx.lineWidth = 14;
ctx.lineCap = 'round';
ctx.beginPath();
ctx.moveTo(230, 320);
ctx.quadraticCurveTo(200, 380, 210, 420);
ctx.stroke();

// HANDS — simple circles work fine at this scale
ctx.fillStyle = '#C68B5B';
ctx.beginPath();
ctx.arc(210, 425, 10, 0, Math.PI * 2);
ctx.fill();
```

#### Props and Held Items
```javascript
// Example: longboard with neon accents
const board = ctx.createLinearGradient(370, 350, 400, 520);
board.addColorStop(0, '#FF006E');
board.addColorStop(1, '#AA0048');
ctx.save();
ctx.translate(380, 380);
ctx.rotate(-0.25); // angled naturally
ctx.fillStyle = board;
ctx.beginPath();
ctx.roundRect(-8, 0, 16, 140, 8);
ctx.fill();
// Detail: wheels
ctx.fillStyle = '#00E5FF';
ctx.beginPath();
ctx.arc(0, 15, 4, 0, Math.PI * 2);
ctx.fill();
ctx.restore();
```

#### Environments and Backgrounds
```javascript
// LAYERED BACKGROUND — never a single flat color
const bg = ctx.createLinearGradient(0, 0, 600, 840);
bg.addColorStop(0, '#060612');
bg.addColorStop(0.3, '#0A1628');
bg.addColorStop(0.7, '#0D1F35');
bg.addColorStop(1, '#060612');
ctx.fillStyle = bg;
ctx.fillRect(0, 0, 600, 840);

// NEON SIGNS in background (blurred, low opacity = depth)
ctx.globalAlpha = 0.08;
ctx.fillStyle = '#FF006E';
ctx.fillRect(50, 80, 80, 30);
ctx.fillStyle = '#00E5FF';
ctx.fillRect(420, 120, 120, 25);
ctx.globalAlpha = 1;

// GROUND REFLECTION — adds grounding and neon atmosphere
const puddle = ctx.createRadialGradient(300, 750, 10, 300, 750, 200);
puddle.addColorStop(0, 'rgba(0, 229, 255, 0.12)');
puddle.addColorStop(0.5, 'rgba(255, 0, 110, 0.06)');
puddle.addColorStop(1, 'transparent');
ctx.fillStyle = puddle;
ctx.fillRect(0, 550, 600, 290);

// AMBIENT LIGHTING on character — radial glow from light source
const faceGlow = ctx.createRadialGradient(290, 230, 20, 290, 230, 80);
faceGlow.addColorStop(0, 'rgba(0, 229, 255, 0.06)');
faceGlow.addColorStop(1, 'transparent');
ctx.fillStyle = faceGlow;
ctx.fillRect(200, 160, 180, 150);
```

#### WebP Export
```javascript
// After drawing on canvas, export as WebP
const canvas = document.getElementById('canvas-jack');
const dataUrl = canvas.toDataURL('image/webp', 0.80);
// Use dataUrl as background-image on card__art div

// Or for blob URL (better for memory):
canvas.toBlob((blob) => {
  const url = URL.createObjectURL(blob);
  cardArtElement.style.backgroundImage = `url('${url}')`;
}, 'image/webp', 0.80);
```

---

## SVG OVERLAY SYSTEM

The overlay layer sits on TOP of the character art and contains lightweight animated elements. These are what make skins feel premium and alive.

### Shared Patterns

#### Rain (used by Neon Nights, Arctic Frost variants)
```html
<g style="animation: rain-fall 3s linear infinite;">
  <line x1="42" y1="0" x2="42" y2="420" stroke="#FFFFFF" stroke-width="0.5" opacity="0.12"/>
  <line x1="98" y1="30" x2="98" y2="450" stroke="#FFFFFF" stroke-width="0.5" opacity="0.08"/>
  <!-- 4-8 lines total, randomized x positions -->
</g>
```
```css
@keyframes rain-fall {
  from { transform: translateY(-100%); }
  to { transform: translateY(100%); }
}
```

#### Neon Border Flicker
```html
<rect x="6" y="6" width="288" height="408" rx="7"
      fill="none" stroke="#00E5FF" stroke-width="1.5"
      style="animation: neon-flicker 2s steps(8) infinite;"
      filter="url(#glow-filter)"/>
```
```css
@keyframes neon-flicker {
  0%, 100% { opacity: 0.7; }
  15% { opacity: 1.0; }
  30% { opacity: 0.85; }
  50% { opacity: 1.0; }
  70% { opacity: 0.75; }
  85% { opacity: 0.95; }
}
```

#### Particle Rise (embers, snow, dust, bubbles)
```html
<circle cx="120" cy="350" r="1" fill="#FF6B35" opacity="0.4"
        style="animation: particle-rise 4s linear infinite;"/>
<!-- Use different cx, animation-duration, and animation-delay per particle -->
```
```css
@keyframes particle-rise {
  from { transform: translateY(0); opacity: 0.4; }
  to { transform: translateY(-30px); opacity: 0; }
}
```

#### Glow Pulse (eyes, crowns, gems, moons)
```html
<circle cx="160" cy="117" r="5" fill="#00E5FF" opacity="0.5"
        filter="url(#glow-filter)"
        style="animation: glow-pulse 1.5s ease-in-out infinite alternate;"/>
```
```css
@keyframes glow-pulse {
  from { opacity: 0.3; }
  to { opacity: 0.8; }
}
```

#### Shimmer Sweep (gold, prism, light reflections)
```css
.shimmer-overlay {
  background: linear-gradient(90deg, transparent 0%, rgba(212,160,23,0.3) 50%, transparent 100%);
  background-size: 200% 100%;
  animation: shimmer 3s linear infinite;
}
@keyframes shimmer {
  from { background-position: -100% 0; }
  to { background-position: 200% 0; }
}
```

#### SVG Glow Filter (reusable)
```html
<filter id="glow-filter" x="-50%" y="-50%" width="200%" height="200%">
  <feGaussianBlur stdDeviation="2" result="blur"/>
  <feMerge>
    <feMergeNode in="blur"/>
    <feMergeNode in="SourceGraphic"/>
  </feMerge>
</filter>
```

### Card Animation Triggers

```css
/* DEAL — one-shot when card enters play */
@keyframes deal-glitch {
  0%   { transform: translateX(-3px); opacity: 0; clip-path: inset(0 0 0 0); }
  33%  { transform: translateX(2px); opacity: 0.5; clip-path: inset(10% 0 30% 0); }
  66%  { transform: translateX(-1px); opacity: 0.8; clip-path: inset(50% 0 10% 0); }
  100% { transform: translateX(0); opacity: 1; clip-path: inset(0 0 0 0); }
}

/* WIN — triggered on hand win */
@keyframes win-surge {
  0%   { box-shadow: inset 0 0 0px currentColor; transform: scale(1); }
  40%  { box-shadow: inset 0 0 20px currentColor, 0 0 25px currentColor; transform: scale(1.02); }
  100% { box-shadow: inset 0 0 0px currentColor; transform: scale(1); }
}

/* Respect user preferences */
@media (prefers-reduced-motion: reduce) {
  .card__overlay * { animation: none !important; }
  .card__fx { display: none; }
}
```

---

## CARD COMPONENT HTML STRUCTURE

```html
<div class="card skin--{slug} tier--{tier}">
  <div class="card__bg"></div>
  <div class="card__art" style="background-image: url('{webp-data-url}')"></div>
  <svg class="card__overlay" viewBox="0 0 300 420">
    <!-- Skin-specific SVG overlay elements -->
  </svg>
  <svg class="card__frame" viewBox="0 0 300 420">
    <!-- Tier-specific frame -->
  </svg>
  <div class="card__rank-top">{rank}<span class="card__suit">{suit}</span></div>
  <div class="card__rank-bottom">{rank}<span class="card__suit">{suit}</span></div>
  <div class="card__fx"></div>
</div>
```

### Card CSS
```css
.card {
  width: 300px;
  height: 420px;
  position: relative;
  border-radius: 12px;
  overflow: hidden;
}
.card__bg       { position: absolute; inset: 0; z-index: 1; }
.card__art      { position: absolute; inset: 0; z-index: 2; background-size: cover; background-position: center; }
.card__overlay  { position: absolute; inset: 0; z-index: 3; pointer-events: none; }
.card__frame    { position: absolute; inset: 0; z-index: 4; pointer-events: none; }
.card__rank-top,
.card__rank-bottom { position: absolute; z-index: 5; /* style per skin */ }
.card__fx       { position: absolute; inset: 0; z-index: 6; pointer-events: none; overflow: hidden; }
```

---

## PERFORMANCE RULES

- Only animate `transform` and `opacity` (GPU-composited, no layout thrash)
- Maximum concurrent CSS animations per tier: Common=1, Rare=3, Epic=5, Legendary=7
- Maximum SVG overlay elements per card: Common=3, Rare=6, Epic=8, Legendary=12
- WebP export quality: 0.78-0.85 depending on detail level
- Target: 60 FPS on mid-range mobile with 4 cards visible simultaneously
- Always add `will-change: transform, opacity` to animated elements

---

## ALL 16 SKINS — CHARACTER DRAWING INSTRUCTIONS

For each skin below, you get:
- **Palette**: exact hex colors to use
- **World**: the environment/mood (informs background)
- **Jack / Queen / King**: exactly what to draw, including pose, clothing, expression, props, and distinguishing features
- **Ace**: the ace design
- **SVG Overlays**: what goes in the overlay layer
- **Animations**: CSS keyframes to implement

### IMPORTANT DRAWING RULES PER CARD TYPE:
- **JACK** = young, dynamic, active pose (leaning, running, mid-action). Smaller build, energetic.
- **QUEEN** = poised, powerful, controlled. Medium build, elegant but dangerous. The most visually striking card.
- **KING** = massive, commanding, seated or standing with authority. Largest build. The most imposing card.

These body type differences are MANDATORY. If all three characters have the same proportions, the skin has failed.

---

### 1. CLASSIC (Common)
**Palette**: `#D4C5A0` parchment, `#5C4033` ink brown, `#8B7355` warm mid, `#333333` dark text, `#F5F0E0` cream
**World**: A card maker's workshop. Warm wood, hanging drying cards, ink pots, engraving tools. Woodblock print aesthetic.

**JACK — The Apprentice**
- Young man, early 20s, ink-smudged face, leather apron over simple shirt
- Holding a freshly pressed playing card in right hand, woodblock carving tool in left
- Eager expression, slight smile, round eyes
- Hair messy, pushed back
- Background: workshop interior — wooden workbench, cards hanging on lines to dry, warm candlelight
- Lighting: warm overhead, candle glow from left

**QUEEN — The Muse**
- Woman mid-30s, knowing smirk, caught mid-stretch after posing
- Simple period dress with rolled sleeves, one hand resting on a half-finished portrait of herself (meta)
- Confident posture, slight lean back, relaxed
- Hair pinned up loosely, strands falling
- Background: artist's studio corner — easel with painting, draped fabric, warm light through window
- Lighting: soft natural window light from right

**KING — The Card Maker**
- Elderly man, 60s+, round spectacles, white beard, ink-stained fingers
- Wearing craftsman's apron over vest, magnifying glass in one hand inspecting a card
- Wise, focused expression, slight squint through glasses
- Surrounded by his creations — cards, printing blocks, inks
- Background: full workshop — shelves of inks, printing press visible, warm golden lighting
- Lighting: overhead workshop lamp, warm ambient

**ACE**: Large suit symbol pressed into thick handmade paper with visible woodblock texture. Slight ink bleed at edges. Faint fingerprint smudge in one corner. Cream background.

**SVG Overlays**: Minimal — 2-3 faint grid lines (opacity 0.06), thin engraving-style border
**Animations**: Deal only — subtle paper flutter (rotate -2deg → 0, scale 0.97 → 1, 250ms). No idle animations (Common tier).

---

### 2. NEON NIGHTS (Rare)
**Palette**: `#00E5FF` cyan, `#FF006E` magenta, `#0A1628` dark navy, `#0D2137` mid navy, `#3B82F6` blue, `#FFD700` gold accent
**World**: Rain-soaked Tokyo backstreet, 2087. Neon signs, wet pavement reflections, cyber-tech. Always nighttime.

**JACK — The Runner**
- Young bike messenger, early 20s, athletic build, grinning
- Holographic goggles pushed up on forehead (cyan lenses, visible strap)
- Cropped jacket with collar detail, cargo pants, neon-accent sneakers
- Electric longboard tucked under one arm (magenta with cyan wheel accents)
- Dynamic stance — leaning forward, weight on front foot
- Background: alley with neon signs (blurred rectangles at low opacity), wet ground with cyan/magenta puddle reflections
- Lighting: neon uplighting from ground puddles, sign glow from background

**QUEEN — The Fixer**
- Woman, 30s, calm composure, smart tech-fabric trench coat
- ONE cybernetic eye (right) — glowing cyan iris with data fragments streaming across it. Other eye is normal.
- Short styled hair, small confident smile
- Holding a translucent data tablet in one hand, other hand at side
- Standing pose, weight evenly distributed, coat drapes elegantly
- Background: tech-lit corridor, faint holographic displays in background, cool blue atmosphere
- Lighting: cybernetic eye casts subtle cyan glow on right side of face, cool ambient from background

**KING — The Architect**
- Older man, 50s-60s, silver swept-back hair, long coat, calm authority
- Projects a tiny holographic city model from his open palm (cyan wireframe buildings)
- Distinguished features — slight wrinkles, knowing eyes, composed expression
- Long flowing coat with blue-edge highlights
- Standing with one arm extended (hologram), other at side
- Background: cityscape with geometric buildings, window lights, deep navy sky
- Lighting: hologram glow illuminates face from below and side, cool ambient

**ACE**: Suit symbol as neon sign on rain-soaked brick wall. Power cable dangling. Puddle reflection below.

**SVG Overlays**:
- Rain: 6 thin white vertical lines scrolling down (opacity 0.08-0.15)
- Neon border: inner rect, stroke cyan, 1.5px, with glow filter
- Queen: 3-4 data text fragments ("0xF4", "SYNC", "//OK") drifting upward around head area
- Queen: Eye glow circle with pulse animation
- King: 3-4 wireframe building rects above palm with rotation and flicker

**Animations**:
- Deal: signal glitch (translateX jitter + clip-path slice, 180ms, steps(3))
- Idle: rain scroll (3s, linear, infinite), neon border flicker (2s, steps(8), infinite)
- Win: neon surge (box-shadow + scale 1.02, 600ms)

---

### 3. ROYAL GOLD (Rare)
**Palette**: `#D4A017` gold, `#046A38` emerald, `#9B111E` ruby, `#1A237E` lapis, `#F5E6C8` ivory, `#2DA5A0` turquoise
**World**: Mughal Empire at its peak. Miniature painting style — flat perspective but rich detail. Geometric Islamic patterns.

**JACK — The Polo Prince**
- Young nobleman, athletic, mid-swing on horseback during polo match
- Jeweled turban with trailing fabric, ornate sash
- Lean athletic build, dynamic action pose on horse
- Background: dusty polo field, palace walls in distance, warm golden sky
- Lighting: warm golden sunlight, dust particles in air

**QUEEN — The Empress Builder**
- Inspired by Mumtaz Mahal. Holding architect's compass over blueprints
- Elaborate jewelry — necklaces, earrings, arm bands
- Serene expression, slight knowing smile
- Taj Mahal silhouette faintly visible on the blueprints she holds
- Background: palace interior with painted walls, arched doorways
- Lighting: warm interior light through latticed windows, gold reflections from jewelry

**KING — The Grand Mughal**
- Seated on the Peacock Throne — ornate with spread peacock feather details
- Long beard, jeweled turban with feather ornament
- Holding jeweled dagger across lap, massive presence
- Full regal bearing — largest figure of the three
- Background: throne room, patterned walls, courtiers barely visible at edges
- Lighting: warm overhead, gold reflections everywhere

**ACE**: Suit symbol as pietra dura jeweled inlay in white marble. Floral patterns radiating outward — carnelian, lapis, jade colors against white.

**SVG Overlays**: Geometric Islamic pattern border (SVG pattern), gold shimmer sweep
**Animations**: Deal: gold dust scatter (5-8 small circles). Idle: slow shimmer (3-4s). Tilt: gem highlights shift.

---

### 4. MIDNIGHT PURPLE (Rare)
**Palette**: `#6B21A8` violet, `#1E1040` deep indigo, `#A855F7` amethyst, `#4A1942` deep plum, `#2D1B4E` dark purple, `#FFD700` gold accent
**World**: Secret 1920s Harlem jazz club at midnight. Something supernatural is happening. Purple spotlight, smoky atmosphere.

**JACK — The Horn Player**
- Young trumpeter, mid-solo, eyes closed, leaning back
- 1920s suit with suspenders, hat tilted back
- Passionate expression, one foot tapping
- Trumpet raised, playing — visible sound suggested by composition
- Background: dim club interior, stage with purple spotlight, silhouettes of audience
- Lighting: single purple spot from above, warm skin tones underneath

**QUEEN — The Singer**
- Vocalist at vintage microphone, eyes closed, one hand raised
- Sequined dress catching light, finger wave hairstyle
- Transported by the music — serene, almost glowing
- Background: stage with mic stand, band silhouettes behind, purple/plum atmosphere
- Lighting: purple backlight radiating from behind her, spotlight from above

**KING — The Club Owner**
- Imposing man in purple velvet suit leaning against bar
- Cigar in hand, knowing look, amused half-smile
- His shadow on the wall DOESN'T MATCH his pose (it's reaching for something) — this is the supernatural element
- Art Deco bar details behind him
- Background: bar interior, art deco details, bottles, mirror behind bar
- Lighting: dim amber bar light, purple accent from club, shadow deliberately wrong

**ACE**: Suit symbol formed in cigarette smoke under purple spotlight. Dark club interior visible behind — piano, empty chairs.

**SVG Overlays**: Smoke paths (slow drift up), spotlight cone (gradient), radiating light circles on Queen
**Animations**: Deal: purple spotlight sweep (500ms). Idle: card breathes (scale 0.998→1.002, 3s). Shadow shifts on King (8s). Win: spotlight flares white then fades back.

---

### 5. ARCTIC FROST (Rare)
**Palette**: `#B3E5FC` ice blue, `#0D47A1` deep ocean, `#A8E6CF` aurora green, `#CE93D8` aurora purple, `#81D4FA` light blue, `#FFFFFF` white
**World**: Inuit-inspired mythological kingdom beneath the Northern Lights. Ancient, strange, beautiful.

**JACK — The Aurora Runner**
- Young hunter sprinting across blue ice, fur-lined parka flowing behind
- An arctic fox spirit runs alongside — semi-transparent, ghostly
- Athletic build, dynamic running pose
- Each footstep leaves a faint glow on ice
- Background: vast frozen landscape, northern lights ribboning across sky (greens, purples)
- Lighting: aurora glow from above, ice reflection from below

**QUEEN — Sedna (Ocean Goddess)**
- Viewed through translucent ice — she's below the frozen surface
- Dark hair flows UPWARD becoming kelp and ocean currents
- A beluga whale circles her in the dark water
- Serene, mythological beauty, eyes open looking up through the ice
- Background: split composition — pale cracked ice surface above, deep ocean below
- Lighting: aurora reflecting on ice above, bioluminescent glow below

**KING — The North Wind**
- NOT a man on a throne. A massive bearded FACE forming within a blizzard
- Half-visible — features emerge from swirling snow and wind
- Only one eye fully visible, ancient and knowing
- The face IS the storm — hair and beard are wind currents
- Background: pure blizzard — swirling whites, pale blues, silver
- Lighting: cold diffuse, no single source — the storm is the light

**ACE**: Break in arctic ice revealing dark water below. Suit symbol is the SHAPE of the hole in the ice. Northern lights reflected in water. Cracked ice radiates outward.

**SVG Overlays**: Aurora ribbon (gradient rect at top, slow color shift), snowflake circles (6-8 tiny, drifting), ice crack paths
**Animations**: Deal: frost burst (line paths scale outward, 400ms). Idle: snow drift, aurora shift. Tap: breath fog. Win: aurora intensifies.

---

### 6. EMERALD FORTUNE (Rare)
**Palette**: `#046A38` emerald, `#D4A017` gold, `#1B5E20` dark green, `#F5F0E0` cream, `#8B4513` wood brown, `#FFFFFF` white
**World**: 1920s Monte Carlo casino. Art Deco glamour. Everyone's cheating and everyone knows it.

**JACK — The Card Counter**
- Nervous young prodigy at casino table, round glasses, rumpled tuxedo
- Sweat on brow, one hand on chip stack, other tapping table
- Probability equations faintly visible around his head (ghosted text)
- Slight hunch, concentrated expression
- Background: emerald felt table, gold lighting, casino interior blur
- Lighting: warm gold overhead, green felt reflection

**QUEEN — The Grifter**
- Stunning woman at roulette table, 9th consecutive win
- Diamond bracelet, loaded die barely visible palmed in one hand
- Red lips, champagne glass, confident smirk
- Glamorous Art Deco evening wear
- Background: roulette table edge, crowd blur behind, crystal chandelier light
- Lighting: warm golden chandelier from above, sparkle on jewelry

**KING — The House**
- Casino owner in white dinner jacket, emerald cravat
- Monocle, silver hair, amused expression
- Small capuchin monkey on shoulder holding an emerald the size of a walnut
- He lets everyone cheat because he's running a bigger con
- Background: Art Deco casino interior — geometric patterns, brass rails, mirrors
- Lighting: warm overhead, monocle catches light occasionally

**ACE**: Suit symbol at center of roulette wheel in the green zero pocket. Gold ball resting on it. Overhead view.

**SVG Overlays**: Equations orbiting Jack's head (text elements), bracelet sparkles on Queen, monocle glint on King
**Animations**: Deal: gold coins tumble (500ms). Idle: Art Deco pattern shimmer. Win: coin cascade + sparkle burst.

---

### 7. VELVET NOIR (Rare)
**Palette**: `#1A1A1A` near-black, `#9B111E` noir red, `#D4D4D4` silver, `#F5F0E0` cream, `#333333` dark grey
**World**: 1940s film noir. Fedoras, shadows, harsh lighting, danger. Nearly monochrome with ONE red accent per card.

**JACK — The Smooth Dealer**
- Slick 1940s card sharp, pinstripe vest, rolled sleeves
- Fedora tilted, cigarette behind ear, shuffling cards one-handed
- Cocky grin, shadowed face
- Red accent: tie or pocket square
- Background: dim card room, single overhead light, smoke haze
- Lighting: harsh single overhead — creates venetian blind shadow stripes across everything

**QUEEN — The Femme Fatale**
- Glamorous woman in black velvet gown at dim bar
- Cigarette holder, pearls, one eyebrow raised
- Small revolver barely visible in clutch purse
- Red accent: lipstick only
- Background: bar with bottles, mirror, dim amber light
- Lighting: side light creating dramatic face split — half lit, half shadow

**KING — The Godfather**
- Broad-shouldered boss in dark double-breasted suit
- Seated in leather chair, face half in shadow, crystal glass in hand
- Power through stillness — minimal expression, total control
- Red accent: rose on lapel
- Background: leather chair, study/office, barely visible
- Lighting: extreme chiaroscuro — half face lit, half in total darkness

**ACE**: Suit symbol on black velvet poker chip with silver stitching. On green felt under harsh overhead light. Whiskey glass nearby.

**SVG Overlays**: Venetian blind shadow stripes (4 rects panning), film grain (feTurbulence filter), smoke path
**Animations**: Deal: camera flash (brightness 3→1, 300ms). Idle: blind shadows pan (10s), grain. Win: noir vignette darkens edges.

---

### 8. CRIMSON FLAME (Epic)
**Palette**: `#8B0000` deep red, `#FF6B35` ember orange, `#FFF8E1` white-hot, `#5C0000` darkest red, `#9E9E9E` ash grey, `#FFD700` gold
**World**: A dying star's last civilization. Not "fire guy" — a people who live inside a collapsing sun and know their time is short. Beautiful melancholy.

**JACK — The Last Cartographer**
- Young astronomer mapping escape routes through solar flares
- Protective visor pushed up, sweat, determination
- White-hot instrument panel with star chart lines glowing
- Background: view through observation window — solar corona, flare arcs
- Lighting: instruments glow white-hot, red ambient from the dying star

**QUEEN — The Keeper of Hours**
- Serene woman turning a massive solar clock counting down the star's life
- Her tears evaporate before falling — tiny steam trails on cheeks
- Deep crimson robes, clock face shows symbols not numbers
- Background: clock chamber, massive gear mechanisms, red-gold light
- Lighting: warm from the clock face, red ambient

**KING — The Ember Throne**
- Ancient king who chose to stay behind
- Crown fused to his head from heat, seated peacefully
- Stone throne slowly disintegrating into sparks at edges
- Eyes closed, serene acceptance — NOT angry or fierce
- Background: crumbling throne room, ash floating, deep red to grey palette
- Lighting: throne itself glows at edges where it's breaking apart, ember warm

**ACE**: Collapsing core of dying star. White center → yellow → orange → deep red at edges. Suit symbol is the white-hot core. Solar flare arcs extend outward.

**SVG Overlays**: Ember particles rising (4-6 circles), chart line pulses on Jack, clock hand tick on Queen, throne particle break on King
**Animations**: Deal: heat distortion (SVG displacement, 400ms). Idle: embers rise continuously, core pulse on ace. Win: solar flare burst (600ms).

---

### 9. SAKURA BLOOM (Epic)
**Palette**: `#FFB7C5` sakura pink, `#546E7A` slate, `#FFD700` gold, `#FFFFFF` white, `#8B0000` deep red, `#F5F0E0` parchment
**World**: Feudal Japan through ukiyo-e woodblock print lens. Cherry blossom season. Honor, beauty, impermanence.

**JACK — The Ronin**
- Wandering young samurai on a bridge over koi pond
- Hand resting on katana hilt, straw hat, worn traveling clothes
- Contemplative expression, looking into distance
- One koi visible in water below
- Background: arched bridge, willow trees, distant mountains — ukiyo-e flat perspective style
- Lighting: soft overcast, cherry blossoms falling, pale pink atmosphere

**QUEEN — The Geisha**
- Elegant woman performing tea ceremony
- Sakura-patterned kimono, kanzashi (ornamental pins) in elaborate hair
- Graceful hand positioning around a tea bowl
- Serene, composed, perfect posture
- Background: painted screen showing cherry trees, tatami room
- Lighting: soft interior, warm, steam rising from tea

**KING — The Shogun**
- Stoic warlord in ornate lacquered armor, seated in garden pavilion
- Katana across lap, war fan in one hand
- Cherry blossoms falling like snow around him — but none touch him
- Full sakura tree visible behind
- Background: garden pavilion, cherry tree, stone path
- Lighting: dappled light through blossoms, warm gold

**ACE**: Suit symbol formed by swirling cherry blossom petals on an unrolled scroll. Calligraphy brush nearby with ink drop. Petals mid-formation.

**SVG Overlays**: Falling petals (5-8 small pink ellipses with drift animation), water ripple on Jack, steam on Queen
**Animations**: Deal: petal gust sweeps left to right (500ms). Idle: gentle petal fall (5-8s per petal, continuous). Win: petal storm — 30+ petals swirl in vortex (1s).

---

### 10. SHADOW DYNASTY (Epic)
**Palette**: `#F59E0B` amber, `#1A1A1A` shadow black, `#000000` silhouette, `#FFFFFF` highlights, warm orange backlight
**World**: Chinese shadow puppet theater. The puppets have become self-aware and are staging a coup against the puppeteer. ALL characters are SILHOUETTES against warm backlight.

**JACK — The Rebel Puppet**
- Shadow puppet warrior mid-leap — FULL SILHOUETTE against amber-lit screen
- Still attached to control strings from above but cutting one with a curved blade
- Dynamic action pose, jointed puppet aesthetic (visible joint circles at shoulders, elbows, knees)
- Background: warm amber/orange backlit screen, visible screen edge/frame
- Lighting: ALL from behind — characters are pure black silhouettes with amber edge bleed

**QUEEN — The Shadow Playwright**
- Puppet woman at desk with ink brush, rewriting her own story
- Old projected story visible on screen behind her (being crossed out)
- New story being written — ink brush active
- Background: same backlit screen, visible scroll, candle silhouette at edge
- Lighting: backlit silhouette, candle flicker variation

**KING — The Puppeteer's Shadow**
- The puppeteer's OWN shadow has detached and crowned itself
- Sits on a throne made of tangled puppet strings
- Actual puppeteer's hands visible at top of frame, reaching down — shadow ignores them
- Crown is knotted strings
- Background: screen, puppeteer's hands above, string throne below
- Lighting: backlit, puppeteer hands slightly translucent/lighter

**ACE**: Suit symbol as shadow cast by unseen hand. Severed strings dangle from top. Single candle at bottom edge.

**SVG Overlays**: Strings (lines swaying, pendulum animation), backlight flicker (opacity fluctuation on background), puppeteer hands grasping
**Animations**: Deal: puppet slide-in (translateX with steps(4), 400ms — jerky puppet motion). Idle: candle flicker, string sway, puppet bob. Win: shadow grows large then snaps back.

---

### 11. SOLAR PHARAOH (Epic)
**Palette**: `#D4A017` gold, `#D4A574` sandstone, `#1A237E` lapis blue, `#00897B` turquoise, `#F57F17` amber, `#FFFFFF` white
**World**: Ancient Egypt — human power meets solar divinity. Not museum artifacts — living gods with real presence.

**JACK — The Sun Priest**
- Young Egyptian priest channeling sunlight through golden ankh staff
- Linen robes, shaved head, kohl-lined eyes
- Light beam passes through ankh and projects a symbol on temple wall behind
- Background: temple entrance, hieroglyphed walls, desert sand at base
- Lighting: bright sun from above/behind, light beam through ankh is key visual

**QUEEN — The Pharaoh Queen**
- Nefertiti-inspired — iconic flat-topped crown with golden sun disk
- Holding was-scepter and ankh
- Cobra uraeus on crown, elaborate collar jewelry
- Background: throne room with painted walls, columns
- Lighting: sun disk on crown radiates, warm gold ambient

**KING — The Sun God**
- Pharaoh merging with Ra — human body with radiant solar disk halo behind head
- Crook and flail crossed over chest, full ceremonial regalia
- Solar barque (boat) faintly visible in background sky
- He is BOTH man and god — largest, most imposing figure
- Background: sky transitioning blue to amber, solar barque, desert below
- Lighting: solar halo radiates outward — the king IS the light source

**ACE**: Suit symbol as golden hieroglyph carved into sandstone inside a sunburst. Scarab beetle at bottom.

**SVG Overlays**: Light beam sweep on Jack, sun disk glow pulse on Queen, radiating sun rays on King, sunburst rotation on ace
**Animations**: Deal: sunrise burst (radial gold gradient, 400ms). Idle: sunburst rotation (20s), dust motes. Win: solar eclipse — darkens then golden corona blazes (800ms).

---

### 12. CELESTIAL (Epic)
**Palette**: `#FFD700` star gold, `#1A1A3E` deep space, `#CE93D8` nebula purple, `#283593` deep blue, `#7B1FA2` galaxy purple, `#FFFFFF` star white
**World**: The actual night sky. Characters are living constellations stepping out of their star patterns.

**JACK — Orion's Apprentice**
- Young hunter stepping OUT of the Orion constellation
- One foot still in the star pattern, other stepping into physical form
- Half the figure is connected stars with golden lines, other half is becoming solid/physical
- Background: deep space, visible star field, faint nebula colors
- Lighting: stars provide point lighting, galaxy glow in background

**QUEEN — Cassiopeia Unbound**
- Queen who left her constellation chair — the W-shaped chair of stars is visible behind her, now EMPTY
- She walks away from it, trailing stars behind her like a cape
- Looking back over shoulder at the chair she abandoned
- Background: deep space, the empty W constellation, trailing star cape
- Lighting: stars as points, nebula ambient

**KING — The Astronomer Royal**
- Scholar in robes holding brass astrolabe — Ptolemy/Al-Sufi inspired
- His BODY is the night sky — you can see galaxies and nebulae THROUGH his silhouette
- Only hands, face, and astrolabe are solid/opaque
- Background: deep space IS his body, astrolabe is solid gold
- Lighting: face lit by astrolabe glow, body is transparent cosmos

**ACE**: New constellation being born — stars connecting into suit symbol. 3/4 complete, last lines still drawing. Bright guiding star marks next connection.

**SVG Overlays**: Star twinkle (circles, independent opacity), constellation lines (pulse), galaxy rotation in King's body, shooting star (occasional)
**Animations**: Deal: constellation connect (stroke-dasharray border, 500ms). Idle: star twinkle (staggered), galaxy rotation (30s). Win: shooting star + all stars flare bright.

---

### 13. BLOOD MOON (Epic)
**Palette**: `#8B0000` blood red, `#424242` ash grey, `#BDBDBD` dust, `#212121` near-black, `#FFFFFF` moonlight white
**World**: A cursed royal court frozen in time during a lunar eclipse. Everyone at the banquet has been trapped for centuries. Something is JUST NOW waking them up. Nearly monochrome with blood-red as the only color.

**JACK — The Waking Page**
- Young servant frozen mid-pour — wine literally SUSPENDED in midair between bottle and glass
- Dust covers everything, cobwebs connect him to the table
- His eyes have JUST opened — dawning awareness
- One hand still posed, other barely starting to move
- A crack of blood-red moonlight hits his face through a window
- Background: banquet hall, dust-covered table, frozen food, cobwebs everywhere — all grey except the red moonlight
- Lighting: near-darkness with single shaft of red moonlight through window

**QUEEN — The Cursed Bride**
- Still in her centuries-old wedding dress — cobwebs and dried roses in her hair
- One hand reaching toward a heavy door that won't open
- Her face shows dawning awareness after centuries of sleep
- A crack in the door lets blood-red moonlight fall across her face
- Background: stone corridor, heavy door, cobwebs, dust — all grey except the red light
- Lighting: slit of red moonlight through door crack

**KING — The Sleeping Host**
- King at head of banquet table, goblet STILL raised for a centuries-old toast
- Dust on everything — crown, shoulders, feast
- Blood moon light hitting his crown makes it glow red — his fingers are beginning to curl around the goblet again
- The feast on the table is petrified
- Background: head of banquet table, petrified food, candelabras dark, cobwebs — grey except crown glow
- Lighting: red moonlight from window hitting crown specifically

**ACE**: Suit symbol as the blood moon viewed through cracked cathedral window. Cobwebs across broken panes. Dust in red light.

**SVG Overlays**: Dust motes (tiny circles, near-frozen drift), moonlight shaft (rect, slow opacity shift), micro-movements (wine wobble, finger twitch)
**Animations**: Deal: heartbeat (card scale 1→1.015→1, 400ms). Idle: dust drift, moonlight intensity shift, micro-movements every 4-6s. Win: characters awaken momentarily — burst of movement then freeze again (800ms).

---

### 14. GILDED SERPENT (Legendary)
**Palette**: `#D4A017` gold, `#046A38` jade, `#B71C1C` ruby, `#1A1A1A` obsidian, `#8B6914` dark gold
**World**: Gold is alive and serpents are sacred. Egyptian-meets-Indian mythology.

**JACK — The Serpent Charmer**
- Young figure with golden cobra coiled around forearm, rising to face them eye-to-eye
- Cobra hood is spread, tongue flicking
- Ornate robes, calm but intense expression
- Background: temple interior, golden columns, torch light
- Lighting: warm torchlight, gold reflections on snake scales

**QUEEN — The Medusa Queen**
- Beautiful AND terrifying — hair is a crown of golden serpents, each alive
- Eyes are magnetic (not horror — powerful beauty)
- Jeweled scale collar transitions into snake-hair seamlessly
- Holds a mirror face-down — she knows what she can do
- Background: throne room, reflective marble floor
- Lighting: warm gold from everywhere, her eyes have subtle green glow

**KING — The Serpent Emperor**
- Throne made entirely of intertwined golden serpents — the throne IS alive
- Sits calmly as snakes form armrests, backrest, base
- Crown is a cobra with spread hood
- One hand rests on serpent armrest that nuzzles his palm
- Background: grand hall, golden serpent motifs on walls, jade floor
- Lighting: warm golden glow from the living throne, opulent

**ACE**: Suit symbol clutched in jaws of golden ouroboros (snake eating its own tail). Ruby eye. Dark jade center.

**SVG Overlays**: Cobra hood breathing (scale), tongue flick, snake-hair motion (individual paths rotating), throne serpent shift, ouroboros consumption loop, eye blink cascade
**Animations**: Deal: golden snake traces card border (stroke-dashoffset, 500ms). Idle: scale shimmer on tilt, throne shifts, ouroboros feeds. Win: all serpents rise and flare hoods (600ms). **LEGENDARY BONUS**: card border is living snake — animated flowing scale pattern always active.

---

### 15. DRAGON'S HOARD (Legendary)
**Palette**: `#FFD700` gold, `#722F37` wine red, `#E65100` ember orange, `#9B111E` ruby, `#1A1A1A` obsidian, `#FF6D00` hot orange
**World**: A dynasty of dragon-bonded warriors. Progression tells a story: rider → mother → king shows what happens when human and dragon become one.

**JACK — The Dragon Rider**
- Young warrior mounted on a sleek young dragon mid-flight
- Dragon has iridescent scales, not fully grown
- Rider has spear and leather flight armor, hair whipping back
- Banking through clouds, gold mountain visible far below
- Background: sky with clouds, distant gold mountain, dynamic diagonal composition
- Lighting: warm from below (gold reflection), dramatic sky light

**QUEEN — The Dragon Mother**
- Powerful woman in dragon-scale armor (grown, not forged — organic)
- Adult dragon wraps protectively around her, head near shoulder
- She holds a dragon egg glowing with internal heat
- Three small hatchlings play at her feet
- Background: dragon nest/lair, warm cave, treasure glimpses
- Lighting: egg glow (warm orange from center), cave ambient

**KING — The Dragon King**
- Ancient warrior-king who has BECOME part dragon
- Dragon horns growing from temples, scales creeping up neck, one eye is dragon-slit
- Sits atop a mountain of gold, gems, ancient weapons
- Massive dragon curls behind him — unclear if dragon serves king or they're the same being
- Smoke curls from his nostrils
- Background: treasure mountain, massive dragon, cave ceiling
- Lighting: fire glow from dragon behind, gold reflections everywhere

**ACE**: Suit symbol etched into massive dragon egg on treasure pile. Egg is cracked — light/heat from crack. Tiny dragon claw emerging.

**SVG Overlays**: Cloud wisps on Jack, egg heartbeat glow on Queen, nostril smoke + treasure sparkle on King, crack glow + claw twitch on ace
**Animations**: Deal: fire breath wipe (gradient mask sweep, 500ms). Idle: smoke drift, treasure sparkle, egg glow, dragon breathing. Win: fire erupts from all edges (700ms) + gold rain. **LEGENDARY BONUS**: card border has dragon scale texture that shifts hue on hover/tilt.

---

### 16. DIAMOND DYNASTY (Legendary)
**Palette**: Prismatic rainbow (rotating), `#FFFFFF` crystal, `#F57F17` amber inclusion, `#E3F2FD` pale blue, full spectrum
**World**: Civilization that compresses time into crystal. Each character IS an era — past, present, future — made physical.

**JACK — The Future Shard (UNCUT/RAW)**
- Figure made entirely of raw, uncut diamond — rough, jagged, crystalline
- Features are BLURRY, unresolved — like looking through frosted glass
- This is an era that hasn't happened yet — nothing is defined
- Sharp angular shards extend from shoulders and arms
- Dynamic but frozen mid-motion
- Background: void with prismatic light refractions
- Lighting: light THROUGH the figure creating rainbow refractions

**QUEEN — The Present Facet (PERFECT CUT)**
- Woman as a flawlessly cut gemstone in human form
- Every surface is a mathematically perfect facet reflecting light
- Sharp, precise, brilliant — she IS now
- Clean geometric beauty
- Background: pure light environment, prismatic
- Lighting: every facet catches light independently — prismatic rainbow everywhere

**KING — The Ancient Inclusion (FLAWED/DEEP)**
- King's diamond body contains INCLUSIONS — tiny trapped scenes from deep history
- A battle scene visible in his chest, coronation in shoulder, ancient forest in arm
- Surface is polished but imperfect — cracked by the weight of what he contains
- Massive, seated, old
- Background: deep amber/warm interior of the diamond itself
- Lighting: internal warm amber glow from inclusions, cool diamond surface

**ACE**: Diamond being cut in real-time. Suit symbol emerging as facets appear. Half raw crystal, half perfect cut. Each completed facet reveals a different scene inside.

**SVG Overlays**: Prismatic sweep (conic-gradient rotation), facet highlights (polygons with catch-light), inclusion shift in King, facet reveal sequence on ace
**Animations**: Deal: prismatic flash (brightness 5→1 + hue-rotate, 400ms). Idle: constant prismatic color shift, inclusion crossfade (10s), facet catches. Win: THE SHOWSTOPPER — blinding white then every facet fires rainbow beams outward (800ms). **LEGENDARY BONUS**: card border is continuous rainbow prism, always cycling.

---

## IMPLEMENTATION ORDER

Build skins in this order to establish quality incrementally:

1. **Classic** (Common) — establish the canvas drawing pipeline and card component
2. **Neon Nights** (Rare) — add SVG overlays and animations
3. **Velvet Noir** (Rare) — practice noir lighting and film grain effects
4. **Sakura Bloom** (Epic) — practice particle systems (petals)
5. **Blood Moon** (Epic) — practice micro-animations and tension
6. **Gilded Serpent** (Legendary) — full system at maximum complexity
7. Then fill in remaining skins in any order

## FINAL CHECKLIST PER CARD

- [ ] Character fills the canvas — no dead space
- [ ] Character has distinct face with expression (eyes, eyebrows, mouth, nose)
- [ ] Character body type matches card rank (Jack=lean/dynamic, Queen=elegant/medium, King=massive/imposing)
- [ ] Character is holding/wearing their unique prop
- [ ] Background has environment, atmosphere, lighting — not empty dark void
- [ ] Light source is consistent and creates highlights/shadows
- [ ] Color palette matches the skin specification
- [ ] WebP export is under 25KB at quality 0.78-0.85
- [ ] SVG overlays are implemented per skin spec
- [ ] CSS animations are running (deal, idle, win as specified)
- [ ] Card reads clearly at 150×210px display size (strong silhouette, contrast)
