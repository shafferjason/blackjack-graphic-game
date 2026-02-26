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

### Per-Skin Unique Face Card Characters (NEW)
Every skin now has uniquely different J/Q/K character silhouettes via `faceCardCharacters.tsx`:
- 16 character themes: european, cyberpunk, baroque, samurai, pharaonic, glacial, infernal, wraith, ophidian, astral, vampiric, arcane, sylvan, noir, crystalline, draconic
- Each theme provides distinct head/crown silhouettes, body shapes, and held props for all 3 face card roles
- Previously color-only skins (Royal Gold, Shadow Dynasty, Celestial, Blood Moon, Midnight Purple, Emerald Fortune, Velvet Noir, Diamond Dynasty, Gilded Serpent) now have fully unique characters
- Screenshot verification at gameplay size for 10 representative skins

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
| `b522799` | Per-Skin Unique Face Card Characters |

---

## Technical Details

- **Build:** 548KB JS (184KB gzipped), 76KB CSS (14KB gzipped)
- **Tests:** 310 unit tests across 17 files — all passing
- **Skins:** 15 skins × full card back + face card palette + environment + material + celebration style + unique character silhouettes
- **Animations:** All GPU-accelerated (transform, opacity), `prefers-reduced-motion` respected
- **Mobile:** 5 responsive breakpoints (small phone < 380px through desktop 768px+)

---

## Face Card Character Screenshots (Gameplay Size Verification)

| Skin | Screenshot Path |
|------|----------------|
| Classic | `qa-playwright/face-card-characters/classic_gameplay.png` |
| Neon Nights | `qa-playwright/face-card-characters/neon-nights_gameplay.png` |
| Sakura Bloom | `qa-playwright/face-card-characters/sakura-bloom_gameplay.png` |
| Solar Pharaoh | `qa-playwright/face-card-characters/solar-pharaoh_gameplay.png` |
| Arctic Frost | `qa-playwright/face-card-characters/arctic-frost_gameplay.png` |
| Shadow Dynasty | `qa-playwright/face-card-characters/shadow-dynasty_gameplay.png` |
| Celestial | `qa-playwright/face-card-characters/celestial_gameplay.png` |
| Blood Moon | `qa-playwright/face-card-characters/blood-moon_gameplay.png` |
| Velvet Noir | `qa-playwright/face-card-characters/velvet-noir_gameplay.png` |
| Dragon's Hoard | `qa-playwright/face-card-characters/dragons-hoard_gameplay.png` |

---

## v1.1 Quality Updates (2026-02-26)

### Mandatory Prework Completed
1. **Number card treatment**: Tier-based pip hue shift + watermark system for number cards (2-10)
2. **SVG filter performance caps**: Device-aware caps limit visual complexity on low-end mobile
3. **Deterministic animations**: Celebration particles/confetti use Mulberry32 PRNG (reproducible)
4. **WebP validation**: Tested 5 textures — PNG retained (noise patterns don't compress well in WebP)

### Additional Fixes
- Touch targets raised to 44px minimum on shop buy buttons and side bet chips
- Card hover effects wrapped in `@media (hover: hover)` — no more sticky hover on mobile
- Removed unused `_robeMid` variable
- Device profiling: low-end devices get reduced texture layers and no idle glow

---

## v1.2 Final Polish & QA (2026-02-26)

### Gameplay & UX Improvements
- **Repeat Bet**: "Repeat $X" button appears after each round to quickly re-place previous bet
- **Undo Last Chip**: Undo button removes the most recently placed chip instead of clearing entire bet
- **Reset Confirmation**: Reset button now requires a second click ("Confirm?") to prevent accidental bankroll wipes
- **Dealer animation fix**: Dealer's 3rd+ cards now correctly use "hit" animation instead of "deal" animation
- **Grammar fix**: "Your hand empty" corrected to "Your hand is empty"
- **Achievement toast**: Changed from `aria-live="assertive"` to `aria-live="polite"` (less disruptive)

### Performance Optimizations
- **Debounced localStorage saves**: Game state persistence now batches within 100ms windows (was saving on every dispatch)
- **Timer cleanup**: ChipAnimation and useSoundEffects properly clean up all setTimeout handles on unmount (prevents memory leaks)
- **Removed backdrop-filter**: Header no longer uses backdrop-filter blur (prevents scroll jank on low-end devices)
- **GPU hints**: Added `will-change: transform, opacity` to card wrappers for smoother deal animations
- **Controls z-index**: Raised from 2 to 15 to prevent card hover overlapping the controls area

### Test Results
- 310 unit tests passing (17 test files)
- 80 Playwright E2E tests passing (40 mobile modal + 40 face card character tests)
- Clean production build

---

## Known Follow-ups
- "Try Before You Buy" preview mode (deferred from Step 10)
- Full-screen face card gallery with zoom/share (deferred from Step 14)
- Additional legendary skins: Celestial Court, Phantom's Table
- Per-skin deal sound variations
- Purchase reveal animation
- Lighthouse performance audit
- Lazy-load face card textures (better than WebP conversion for perf)
