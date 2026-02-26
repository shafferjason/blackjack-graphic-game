# Premium Skin Master Plan
## Blackjack Graphic Game — Visual Direction & Execution Roadmap

**Created:** 2026-02-25
**Branch:** `pre-production/exact-approved-face-cards`
**Scope:** Multi-session overnight effort — 15 implementation steps across 5 phases

---

## 1. Product Vision Statement

> **Ship a blackjack game where every card feels hand-painted and every skin feels like opening a collector's deck.**

The game already has procedurally generated SVG face cards with raster paint textures, a 9-skin shop with tiered pricing, and smooth CSS animations. The premium bar we're targeting goes beyond palette swaps — each skin should deliver a **distinct artistic identity** with unique face card poses, clothing details, accessory motifs, and environmental atmosphere. The player should feel like they're collecting art, not just colors.

**Target quality bar:** A first-time player screenshots a face card and shares it. A returning player buys a new skin specifically to see how the Queen looks.

---

## 2. Art Direction Pillars

### Pillar 1: Painterly Authenticity
Every card should read as hand-painted oil on linen at both 90px gameplay scale and zoomed preview. Brush texture, canvas grain, and warm vignettes are non-negotiable. No flat vector look.

### Pillar 2: Distinct Character Identity
Each face card (J/Q/K) has recognizable character traits — the Jack is youthful and dashing, the Queen is elegant and regal, the King is powerful and wise. These traits persist across skins but are reinterpreted through each skin's cultural lens.

### Pillar 3: Thematic Cohesion
A skin is not just card colors. It's a complete environment: table felt, card back pattern, face card palette, particle effects, ambient mood. The Classic skin feels like a Parisian salon; Neon Nights feels like a Tokyo arcade; Sakura Bloom feels like a Kyoto garden.

### Pillar 4: Premium Polish at Every Scale
Cards must look sharp at 68px (mobile), 90px (desktop), and full-preview. Textures should not alias. Animations should feel physical — cards have weight, chips have mass, celebrations have energy.

### Pillar 5: Performance-First Premium
All visual upgrades must maintain 60fps on mid-range mobile. SVG complexity has a ceiling. Textures are cached. Animations use GPU-accelerated properties (transform, opacity) only.

---

## 3. Implementation Roadmap (15 Steps, 5 Phases)

### Phase 1: Foundation — Design System & Token Architecture
_Goal: Establish the design vocabulary that all premium features build on._

#### Step 1: Design Token System & Art Direction Constants ★ FIRST
- **Deliverable:** New file `src/config/designTokens.ts` containing:
  - Centralized color scales (gold, ink, parchment, shadow) as semantic tokens
  - Typography scale (currently scattered across CSS)
  - Spacing/sizing constants (card dimensions per breakpoint)
  - Animation duration/easing presets (currently hardcoded in CSS)
  - Shadow elevation presets (card depth, modal depth, chip depth)
  - A `PremiumEffects` config object controlling texture intensity, glow strength, vignette depth
- **Dependencies:** None
- **Expected outcome:** Single source of truth for all visual constants. No magic numbers in component CSS.
- **Risk:** Low — additive, no behavior change

#### Step 2: Card Back SVG Overhaul — Unique Patterns Per Skin
- **Deliverable:** Replace the current 4 `CardBackTheme` presets with per-skin card back designs
  - Each skin gets a custom SVG card back with thematic pattern (not just hue-rotate)
  - Classic: Ornate French scroll pattern with gilded border
  - Neon Nights: Circuit board trace pattern with glowing edges
  - Sakura Bloom: Cherry blossom scatter with washi paper texture
  - Royal Gold: Baroque damask with heavy gold filigree
- **Dependencies:** Step 1 (uses design tokens for colors/spacing)
- **Expected outcome:** Card backs are visually distinct and premium at gameplay scale
- **Risk:** Medium — SVG complexity could impact render perf on mobile; test on low-end device

#### Step 3: Enhanced Card Stock Material System
- **Deliverable:** Upgrade the card face material rendering:
  - Add per-skin material properties: `cardMaterial: 'linen' | 'vellum' | 'metallic' | 'silk' | 'washi'`
  - Each material has a unique texture pattern, edge highlight color, and shadow profile
  - Metallic material for Royal Gold (subtle shimmer gradient animation)
  - Washi material for Sakura Bloom (visible fiber direction)
- **Dependencies:** Step 1 (design tokens for material params)
- **Expected outcome:** Holding a Royal Gold card *feels* different from holding a Classic card
- **Risk:** Medium — new textures increase memory; keep under 100KB total

### Phase 2: Face Card Art Upgrade
_Goal: Make each face card uniquely recognizable and artistically premium._

#### Step 4: Jack Character Refinement — Unique Pose Per Skin
- **Deliverable:** Extend `JackSVG` with skin-aware pose variations:
  - Classic: Current French portrait (keep as baseline)
  - Neon Nights: Cyberpunk visor, LED-trimmed jacket, data card instead of halberd
  - Royal Gold: Baroque frock coat, powdered wig, ornate rapier
  - Sakura Bloom: Samurai-inspired armor, katana, cherry blossom falling
  - Each variant shares the same face structure but changes headwear, clothing, and held item
- **Dependencies:** Steps 1-3 (tokens, materials)
- **Expected outcome:** The Jack is instantly identifiable but visually distinct per skin
- **Risk:** High — SVG path complexity. Each variant adds ~150 lines. Must profile render time.

#### Step 5: Queen Character Refinement — Unique Pose Per Skin
- **Deliverable:** Same approach as Step 4 for `QueenSVG`:
  - Classic: French portrait with rose (current)
  - Neon Nights: Holographic crown, tech-gown, floating data rose
  - Royal Gold: Elaborate court dress, diamond tiara, hand fan
  - Sakura Bloom: Kimono with obi, kanzashi hairpin, cherry branch
- **Dependencies:** Step 4 (shared pose architecture)
- **Expected outcome:** The Queen is the showcase card — the most detailed, most shareable
- **Risk:** Same as Step 4 — SVG complexity management

#### Step 6: King Character Refinement — Unique Pose Per Skin
- **Deliverable:** Same approach for `KingSVG`:
  - Classic: French portrait with crown and beard (current)
  - Neon Nights: Chrome crown, armored suit, energy scepter
  - Royal Gold: Ermine robe, jeweled crown, gold orb and cross
  - Sakura Bloom: Shogun armor, kabuto helmet, war fan
- **Dependencies:** Step 5 (shared pose architecture)
- **Expected outcome:** The King communicates power through each cultural lens
- **Risk:** Same — SVG complexity

### Phase 3: Animation & Interaction Polish
_Goal: Every interaction feels physical, satisfying, and premium._

#### Step 7: Card Deal Arc Physics Refinement
- **Deliverable:** Upgrade deal/hit animations:
  - Add subtle rotation wobble on landing (spring physics feel)
  - Per-skin deal sound variation (already have sound system)
  - "Premium" deal: slight pause before flip-reveal for anticipation
  - Card shadow grows as card "lifts" during deal arc
- **Dependencies:** Step 1 (animation tokens)
- **Expected outcome:** Dealing feels weighty and satisfying — like real cards sliding on felt
- **Risk:** Low — CSS animation tweaks only

#### Step 8: Win/Loss Celebration Overhaul
- **Deliverable:** Skin-themed celebration effects:
  - Classic: Gold coin burst (current, refined)
  - Neon Nights: Electric spark cascade, glitch text
  - Sakura Bloom: Cherry petal rain with soft blur
  - Royal Gold: Jewel rain with metallic glint
  - Add "Blackjack!" typography animation (current pop → premium reveal with font weight transition)
- **Dependencies:** Step 1 (animation tokens), skin system
- **Expected outcome:** Winning feels different with each skin — another reason to collect
- **Risk:** Medium — particle systems can lag on mobile; use CSS-only, cap particle count

#### Step 9: Chip Stack Microanimations
- **Deliverable:** Polish chip interactions:
  - Stacking sound + visual bounce when adding chips to bet
  - Chip pile physics — chips land slightly offset, rotate randomly
  - Winning payout: chips slide from dealer area with satisfying cascade
  - Double down: dramatic single chip drop
- **Dependencies:** Step 1 (animation tokens)
- **Expected outcome:** Betting feels tactile, not just numerical
- **Risk:** Low — CSS transform animations

### Phase 4: Skin Shop & Collection Experience
_Goal: The shop is a destination, not a menu. Collecting is rewarding._

#### Step 10: Skin Shop Visual Redesign
- **Deliverable:** Premium shop experience:
  - Full-bleed skin preview cards with parallax hover effect
  - Tier badges with metallic sheen (Common=Silver, Rare=Gold, Epic=Diamond, Legendary=Prismatic)
  - "Try Before You Buy" — preview a skin on the current hand before purchasing
  - Purchase animation: card unwrap/reveal sequence
  - Collection progress: visual grid showing owned vs locked skins
- **Dependencies:** All Phase 1-2 work (skins must look premium to sell premium)
- **Expected outcome:** Players browse the shop for fun, not just utility
- **Risk:** Medium — modal complexity, ensure mobile scroll behavior

#### Step 11: Legendary Skin Tier — Ultimate Collector Items
- **Deliverable:** 2-3 legendary skins with maximum visual impact:
  - **Dragon's Hoard:** Obsidian cards with molten gold edges, dragon-scale texture, flame particle idle effect
  - **Celestial Court:** Deep indigo with constellation face cards, starfield card back, cosmic dust particles
  - **Phantom's Table:** Translucent ghostly cards, ethereal glow, smoke particle trails
  - Price: 2000-5000 chips (major progression goal)
  - Each legendary has a unique idle animation on the card (subtle shimmer, float, glow pulse)
- **Dependencies:** Steps 4-6 (face card pose system), Step 3 (material system)
- **Expected outcome:** Aspirational endgame content that motivates extended play
- **Risk:** High — idle animations must not impact gameplay performance; use `will-change` judiciously

### Phase 5: Polish, QA & Ship
_Goal: Everything works together. No rough edges._

#### Step 12: Mobile Optimization Pass
- **Deliverable:** Systematic performance audit:
  - Profile SVG render time per card at each breakpoint
  - Reduce texture resolution for mobile if needed (swap to smaller pattern tiles)
  - Ensure all animations hit 60fps on iPhone SE (2020) / Pixel 4a class devices
  - Disable idle animations if `prefers-reduced-motion` is set
  - Verify touch targets remain ≥44px with all visual changes
- **Dependencies:** All previous steps
- **Expected outcome:** Premium visuals with zero performance regression on mobile
- **Risk:** This IS the risk mitigation step

#### Step 13: Cross-Skin Visual Consistency Audit
- **Deliverable:** Side-by-side comparison of all skins:
  - Verify face card readability at 68px (smallest mobile)
  - Ensure card rank/suit is always instantly readable regardless of skin
  - Check that table felt + card colors have sufficient contrast (WCAG AA)
  - Verify card back patterns tile seamlessly at all sizes
  - Screenshot every J/Q/K × every suit × every skin for visual QA
- **Dependencies:** All previous steps
- **Expected outcome:** No skin breaks readability or accessibility
- **Risk:** Low — QA activity, not code change

#### Step 14: Skin Preview & Face Card Gallery
- **Deliverable:** Enhanced preview experience:
  - Full-screen face card gallery: swipe through J/Q/K for each skin
  - Zoom interaction on face cards (pinch on mobile, scroll on desktop)
  - Share button: export a single card as PNG (canvas render from SVG)
  - Before/after comparison: Classic vs active skin side-by-side
- **Dependencies:** Steps 4-6 (face card variants), Step 10 (shop redesign)
- **Expected outcome:** Players show off their collection. Social proof drives engagement.
- **Risk:** Medium — canvas-from-SVG rendering can be tricky cross-browser

#### Step 15: Final Integration Test & Release Prep
- **Deliverable:** Ship-ready quality gate:
  - Run full Playwright e2e suite
  - Verify all 9+ skins purchasable, applicable, and persistent across refresh
  - Test achievement-locked skins still unlock correctly
  - Verify PWA manifest + service worker cache all new textures
  - Performance lighthouse audit: maintain >90 performance score
  - Build and deploy to staging for final human review
- **Dependencies:** All previous steps
- **Expected outcome:** Confident ship to production
- **Risk:** Low — testing, not new code

---

## 4. Quality Bar Checklist — Premium Acceptance Criteria

### Visual Quality
- [ ] Face cards read as hand-painted at 68px mobile and 90px desktop
- [ ] Each skin's J/Q/K have distinct clothing, accessories, and held items
- [ ] Card backs are unique per skin (not hue-rotated copies)
- [ ] Card stock material is visually distinct per skin tier
- [ ] Gold gilding, jewels, and metallic effects feel premium
- [ ] Textures do not alias or pixelate at any supported size
- [ ] Vignette and canvas grain create warm, analog feel

### Animation Quality
- [ ] Deal animation feels physical — cards have weight and arc
- [ ] Flip animation has satisfying bounce with no jank
- [ ] Win celebrations are skin-themed and visually distinct
- [ ] Chip interactions feel tactile (bounce, offset, cascade)
- [ ] No animation exceeds 60fps target on mid-range mobile
- [ ] `prefers-reduced-motion` disables all non-essential animation

### Skin System Quality
- [ ] Every skin has: unique card back, face card palette, environment, celebration
- [ ] Legendary skins have idle card animations (shimmer/glow/float)
- [ ] Shop preview accurately represents the skin's visual identity
- [ ] "Try before you buy" works without committing purchase
- [ ] Purchase flow has satisfying reveal animation
- [ ] Collection grid shows progression clearly

### Technical Quality
- [ ] SVG face cards render in <16ms per card (no frame drops during deal)
- [ ] Total texture memory <200KB (all skins combined)
- [ ] No layout shift during skin switch
- [ ] Card rank and suit readable at all sizes with all skins (WCAG AA contrast)
- [ ] Touch targets ≥44px maintained with all visual changes
- [ ] PWA cache includes all texture assets
- [ ] Lighthouse Performance >90

### Polish Quality
- [ ] No orphaned CSS (every rule used, no dead selectors)
- [ ] Design tokens used consistently (no magic hex values in components)
- [ ] Typography hierarchy consistent (Playfair Display headlines, Inter body)
- [ ] Color system coherent (gold accent, status colors, felt variants)
- [ ] Dark theme maintained (no white flashes, no light-mode leaks)

---

## 5. Risk List & Mitigation Plan

### Risk 1: SVG Complexity → Performance Degradation
**Likelihood:** High (each face card variant adds ~150 SVG elements)
**Impact:** Frame drops during deal animation, slow initial render
**Mitigation:**
- Profile early: measure render time after Step 4 before proceeding to Steps 5-6
- Set hard ceiling: max 200 SVG elements per face card
- Use `<use>` elements to reuse common shapes (eyes, borders)
- Consider `will-change: transform` on card wrappers during animation
- Fallback: pre-render complex face cards to canvas and use as `<image>` in SVG

### Risk 2: Mobile Readability at Small Sizes
**Likelihood:** Medium (more detail = harder to read at 68px)
**Impact:** Players can't distinguish J/Q/K or rank at small sizes
**Mitigation:**
- Maintain large, clear rank indices in corners (current approach is good)
- Test every variant at 68px before merging
- Use color contrast, not fine detail, for character differentiation at small sizes
- Keep the suit pip and rank number as primary identification; face card art is secondary

### Risk 3: Texture Memory Bloat
**Likelihood:** Medium (new materials per skin = more base64 PNGs)
**Impact:** Slow initial load, high memory usage on low-RAM devices
**Mitigation:**
- Current textures: ~75KB in faceCardTextures.ts — budget ceiling is 200KB
- Use procedural generation (Mulberry32 PRNG) for new textures, not authored PNGs
- Share texture bases across skins where possible (canvas grain is universal)
- Lazy-load skin-specific textures only when that skin is activated

### Risk 4: Licensing & Legal
**Likelihood:** Low (current art is all original/CC0)
**Impact:** Takedown risk if any design too closely resembles a proprietary deck
**Mitigation:**
- All face card art is procedurally generated SVG — no traced images
- Design language references pre-1900 public domain patterns only
- New cultural variants (samurai, cyberpunk) are original artistic interpretations
- Google Fonts (Playfair Display, Inter) are SIL Open Font License
- Sound samples are Kenney CC0
- Document all attribution in ATTRIBUTION.md

### Risk 5: Scope Creep — "Just One More Detail"
**Likelihood:** High (art direction work is inherently iterative)
**Impact:** Never ships; endless polish loop
**Mitigation:**
- Hard phase gates: Phase 1-2 must ship before Phase 3-4 begins
- Each step has a clear "done" definition (see quality bar checklist)
- Legendary skins (Step 11) are explicitly stretch goals — defer if behind schedule
- Ship Classic + 2 premium skins at full quality rather than 9 skins at half quality

### Risk 6: Cross-Browser SVG Rendering Differences
**Likelihood:** Low-Medium (SVG filter effects vary across engines)
**Impact:** Cards look different on Safari vs Chrome vs Firefox
**Mitigation:**
- Avoid SVG filters (feGaussianBlur, feColorMatrix) — use CSS filters instead
- Test on Safari (WebKit), Chrome (Blink), Firefox (Gecko) after each step
- Card-critical elements (rank, suit, face structure) use basic SVG only
- Decorative elements (glow, shimmer) degrade gracefully

---

## 6. Worklog Template

| Step | Status | Started | Completed | Commit | Notes |
|------|--------|---------|-----------|--------|-------|
| 1. Design Token System | ✅ Complete | 2026-02-25 | 2026-02-25 | (see git log) | `src/config/designTokens.ts` — 280 lines, 13 token categories |
| 2. Card Back Overhaul | ⬜ Not Started | — | — | — | — |
| 3. Card Stock Materials | ⬜ Not Started | — | — | — | — |
| 4. Jack Pose Variants | ⬜ Not Started | — | — | — | — |
| 5. Queen Pose Variants | ⬜ Not Started | — | — | — | — |
| 6. King Pose Variants | ⬜ Not Started | — | — | — | — |
| 7. Deal Animation Polish | ⬜ Not Started | — | — | — | — |
| 8. Win/Loss Celebrations | ⬜ Not Started | — | — | — | — |
| 9. Chip Microanimations | ⬜ Not Started | — | — | — | — |
| 10. Skin Shop Redesign | ⬜ Not Started | — | — | — | — |
| 11. Legendary Skins | ⬜ Not Started | — | — | — | — |
| 12. Mobile Optimization | ⬜ Not Started | — | — | — | — |
| 13. Visual Consistency QA | ⬜ Not Started | — | — | — | — |
| 14. Face Card Gallery | ⬜ Not Started | — | — | — | — |
| 15. Integration Test & Ship | ⬜ Not Started | — | — | — | — |

---

## Phase Summary

| Phase | Steps | Focus | Ship Gate |
|-------|-------|-------|-----------|
| **1. Foundation** | 1-3 | Design tokens, card backs, materials | Can deploy: visual polish, no new features |
| **2. Face Card Art** | 4-6 | J/Q/K unique poses per skin | Can deploy: premium face cards visible |
| **3. Animation** | 7-9 | Deal physics, celebrations, chips | Can deploy: feel upgrade complete |
| **4. Shop & Collection** | 10-11 | Shop UX, legendary tier | Can deploy: full premium experience |
| **5. Polish & Ship** | 12-15 | Mobile perf, QA, gallery, release | Production release |

**Rule: Do not deploy until Phase 1 (Steps 1-3) is complete and visually coherent.**
