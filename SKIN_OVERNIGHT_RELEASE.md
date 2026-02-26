# Premium Skin System — Release Notes v2

**Date:** 2026-02-26
**Branch:** `pre-production/exact-approved-face-cards`
**Tests:** 310 passing (17 test files)
**Deploy URL:** https://blackjack-graphic-game.netlify.app

---

## What Shipped (Steps 2-15 of PREMIUM_SKIN_MASTERPLAN.md)

### 15 Unique Card Skins
- **1 Common:** Classic
- **6 Rare:** Neon Nights, Royal Gold, Midnight Purple, Arctic Frost, Emerald Fortune, Velvet Noir
- **6 Epic:** Crimson Flame, Sakura Bloom, Shadow Dynasty, Solar Pharaoh, Celestial, Blood Moon
- **3 Legendary:** Gilded Serpent, Dragon's Hoard (NEW), Diamond Dynasty

### Per-Skin Card Backs (Step 2)
Every skin has a unique SVG card back with themed patterns — no more shared hue-rotated backs.
- 7 pattern styles: scroll, circuit, blossom, damask, scales, stars, crosshatch
- 9 center logos: spade, flame, sakura, eye, serpent, diamond, moon, sun, star

### Card Stock Materials (Step 3)
5 material types that change the card face texture and border:
- Linen (Classic), Vellum (Crimson Flame, Blood Moon, Velvet Noir, Emerald Fortune)
- Metallic (Neon Nights, Royal Gold, Shadow Dynasty, Solar Pharaoh, Gilded Serpent, Dragon's Hoard, Diamond Dynasty)
- Silk (Midnight Purple, Arctic Frost, Celestial), Washi (Sakura Bloom)

### Face Card Variant Overlays (Steps 4-6)
Skin-specific accessories on J/Q/K via new `faceCardVariants.tsx`:
- **Neon:** Cyberpunk visor, holographic crown, energy scepter
- **Sakura:** Samurai headband, kanzashi hairpin, kabuto crest, katana, cherry branch
- **Pharaoh:** Nemes headdress, Hathor crown, Pschent double crown, ankh, lotus, crook & flail
- **Frost:** Ice crown crystals
- **Flame:** Fire crown wisps
- **Dragon (NEW):** Dragon horn crown, dragonfire tiara, dragon claw dagger, dragon egg, dragonfire staff

### Animation Upgrades (Steps 7, 9)
- **Deal arc:** Multi-stage spring wobble with rotation on landing (0.62s)
- **Hit:** Rotation bounce with spring settle (0.48s)
- **Flip reveal:** Anticipation pause + dramatic overshoot (0.8s)
- **Chip bet:** 5-stage rotation physics with shrink
- **Chip win:** Cascade bounce with spread and rotation
- **Hover:** Subtle rotation lift + elevation shadow

### Skin-Themed Celebrations (Step 8)
8 distinct celebration styles tied to active skin:
- Gold, Electric, Petals, Jewels, Fire, Cosmic, Shadow, Emerald
- Particle shapes: circle, petal, diamond, spark
- Themed text glow on "BLACKJACK!" text

### Legendary Tier Enhancements (Step 11)
- New "Dragon's Hoard" legendary skin ($3,000, unlocks at $10k bankroll)
- Idle breathing glow animation on all legendary-tier cards
- Legendary shop items have shimmer sweep animation

### Shop Visual Polish (Steps 10, 14)
- Tier-colored gradient dividers on section headers
- Animated collection progress bar
- Preview card hover lift with rotation
- Environment swatch expands on hover
- Face card gallery strip (J/Q/K mini-previews) for owned skins

---

## Commits

| Hash | Description |
|------|-------------|
| `81a177f` | Card Back SVG Overhaul |
| `d3682b0` | Card Stock Material System |
| `f4b2e2e` | Face Card Pose Variants (J/Q/K) |
| `a8d3d82` | Deal Arc Physics |
| `08e8181` | Win/Loss Celebrations |
| `e97b3cd` | Chip Microanimations |
| `f53a02c` | Shop Visual Redesign |
| `b41344c` | Legendary Skin Tier |
| `5714353` | Face Card Gallery |

---

## Technical Details

- **Build:** 499KB JS (177KB gzipped), 76KB CSS (14KB gzipped)
- **Tests:** 310 unit tests across 17 files — all passing
- **Skins:** 15 skins × full card back + face card palette + environment + material + celebration style
- **Animations:** All GPU-accelerated (transform, opacity), `prefers-reduced-motion` respected
- **Mobile:** 5 responsive breakpoints (small phone < 380px through desktop 768px+)

---

## Known Follow-ups
- "Try Before You Buy" preview mode (deferred from Step 10)
- Full-screen face card gallery with zoom/share (deferred from Step 14)
- Additional legendary skins: Celestial Court, Phantom's Table
- Per-skin deal sound variations
- Purchase reveal animation
- Lighthouse performance audit
