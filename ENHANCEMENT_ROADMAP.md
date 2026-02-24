# Blackjack Graphic Game — 30-Enhancement Roadmap

## Current State

React 19 + Vite single-page app with core blackjack gameplay, custom SVG face cards, responsive CSS, betting system, and Netlify deployment. All game logic lives in a monolithic `App.jsx` (372 lines) and `Card.jsx` (453 lines). No tests, no TypeScript, no persistent state, no advanced blackjack actions.

---

## Phase 1 — Foundation & Architecture (Enhancements 1–5)

_Prerequisite work that every later phase depends on. Do this first._

| # | Enhancement | Description | Effort | Priority |
|---|-------------|-------------|--------|----------|
| 1 | **Code Architecture Refactor** | Extract game logic, state, and utilities out of `App.jsx`. Create `src/hooks/useGameEngine.js`, `src/utils/deck.js`, `src/utils/scoring.js`, `src/constants.js`. Move UI sub-sections into discrete components (`DealerHand`, `PlayerHand`, `BettingControls`, `GameBanner`, `Scoreboard`). | Large | Critical |
| 2 | **Configuration & Constants System** | Centralize magic numbers (animation durations, card sizes, chip denominations, starting bankroll, dealer-stand threshold) into a single `src/constants.js`. Expose a React Context (`GameSettingsContext`) so any component can read config. | Small | Critical |
| 3 | **Game State Machine** | Replace ad-hoc string states (`BETTING`, `PLAYING`, etc.) with an explicit finite state machine (plain reducer or `useReducer`). Define legal transitions so invalid states are impossible. Add states for `SPLITTING`, `DOUBLING`, `INSURANCE_OFFER`, `SURRENDERING`. | Medium | Critical |
| 4 | **Unit Test Harness** | Add Vitest (already compatible with Vite). Write tests for `createDeck`, `cardValue`, `calculateScore`, `isBlackjack`, dealer-stand logic, and payout math. Target ≥90 % coverage on utility functions. | Medium | Critical |
| 5 | **TypeScript Migration** | Rename `.jsx` → `.tsx`, add type definitions for `Card`, `Hand`, `GameState`, `GameAction`. Incremental migration — start with utilities and hooks, then components. | Medium | High |

**Phase 1 Deliverable:** Clean, testable, type-safe architecture with no user-visible changes.

---

## Phase 2 — Core Gameplay Features (Enhancements 6–11)

_The "real blackjack" features players expect._

| # | Enhancement | Description | Effort | Priority |
|---|-------------|-------------|--------|----------|
| 6 | **Double Down** | After initial deal, allow player to double bet and receive exactly one more card. Disable Hit/Stand after double. Payout at 2× the doubled bet. | Medium | Critical |
| 7 | **Split Pairs** | When first two cards share the same rank, allow split into two independent hands. Each hand gets its own bet (equal to original). Render side-by-side with active-hand indicator. Limit re-splits to 3 total hands. Aces split receive one card only. | Large | Critical |
| 8 | **Insurance** | When dealer shows Ace, offer insurance side-bet (up to half the main bet) before anyone acts. If dealer has blackjack, insurance pays 2:1; otherwise insurance bet is lost. | Medium | High |
| 9 | **Surrender** | After initial deal (before any other action), allow late surrender to forfeit half the bet. Not available after split or double. | Small | High |
| 10 | **Multi-Deck Shoe** | Replace single-deck-per-hand with a 6-deck shoe. Track remaining cards. Insert cut card at ~75 % depth; reshuffle when reached. Show visual shoe-depth indicator. | Medium | High |
| 11 | **Configurable House Rules** | Settings panel for: number of decks (1/2/6/8), dealer hits/stands on soft 17, blackjack payout (3:2 or 6:5), double-after-split allowed, surrender allowed. Persist to localStorage. | Medium | Medium |

**Phase 2 Deliverable:** Feature-complete blackjack that matches casino rules.

---

## Phase 3 — Persistence & Statistics (Enhancements 12–15)

_Give players reasons to keep playing._

| # | Enhancement | Description | Effort | Priority |
|---|-------------|-------------|--------|----------|
| 12 | **localStorage Persistence** | Save bankroll, session stats, settings, and current hand state to `localStorage`. Restore on page load. Add "Reset Everything" with confirmation dialog. | Small | High |
| 13 | **Detailed Statistics Dashboard** | Track and display: total hands played, win/loss/push rate, blackjack frequency, average bet, biggest win/loss streak, net profit/loss, ROI %. Render as a slide-out panel with simple bar/line charts (lightweight — use `<canvas>` or inline SVG, no charting library). | Large | High |
| 14 | **Hand History Log** | Record every hand (cards, actions taken, result, payout). Display scrollable history list. Allow replaying a hand's sequence step-by-step. Cap at last 200 hands. | Medium | Medium |
| 15 | **Achievements / Milestones** | Award badges for events: first blackjack, 10-win streak, $5000 bankroll, 500 hands played, etc. Show toast notification on unlock. Display in stats panel. | Medium | Medium |

**Phase 3 Deliverable:** Persistent, stats-rich experience that rewards continued play.

---

## Phase 4 — Audio & Visual Polish (Enhancements 16–21)

_The "feel" layer — what makes it satisfying._

| # | Enhancement | Description | Effort | Priority |
|---|-------------|-------------|--------|----------|
| 16 | **Sound Effects** | Add audio for: card deal (flick), chip place, chip collect, win fanfare, loss thud, blackjack celebration, shuffle, button click. Use Web Audio API or `<audio>` elements. Provide mute toggle with localStorage memory. Keep total audio assets < 500 KB. | Medium | High |
| 17 | **Card Deal Animations (Enhanced)** | Animate cards flying from a shoe/deck position to hand positions with realistic arc and rotation. Stagger timing per card. Flip animation for dealer hole-card reveal (3D CSS transform). | Medium | High |
| 18 | **Chip Animation** | Animate chips sliding from player stack to betting circle on bet, and from pot to player on win. Use CSS keyframes or `requestAnimationFrame`. | Medium | Medium |
| 19 | **Win/Loss Celebration Effects** | On blackjack: gold particle burst + "BLACKJACK!" animated text. On bust: subtle red flash. On big win (≥$200): confetti rain. Keep effects < 2 seconds, non-blocking. | Medium | Medium |
| 20 | **Card Back Design** | Replace plain card-back rectangle with an ornate SVG pattern (crosshatch, casino logo, decorative border). Offer 3–4 card-back color themes selectable in settings. | Small | Low |
| 21 | **Table Felt Customization** | Allow player to pick felt color (classic green, blue, red, purple) from settings. Store preference. Update CSS variable `--felt` dynamically. | Small | Low |

**Phase 4 Deliverable:** Immersive casino atmosphere with polished audiovisuals.

---

## Phase 5 — UX & Accessibility (Enhancements 22–26)

_Reach more players, on more devices, more comfortably._

| # | Enhancement | Description | Effort | Priority |
|---|-------------|-------------|--------|----------|
| 22 | **Keyboard Shortcuts** | Map: `H` = Hit, `S` = Stand, `D` = Double, `P` = Split, `I` = Insurance, `R` = Surrender, `Space` = Deal/New Round, `1-4` = Chip amounts, `Esc` = Clear bet. Show shortcut hints on button tooltips. | Small | High |
| 23 | **Screen Reader Accessibility** | Add `aria-live` regions for game messages and scores. Label all buttons and interactive elements. Announce card deals, results, and available actions. Ensure proper focus management through game flow. | Medium | High |
| 24 | **Tutorial / How-to-Play Overlay** | First-visit overlay explaining controls, rules, and basic strategy. Dismissible, with "Don't show again" checkbox (localStorage). Also accessible from a `?` help button. | Medium | Medium |
| 25 | **Responsive Layout Overhaul** | Redesign mobile layout: full-width hands, swipe between split hands, bottom-anchored action bar, larger touch targets (≥44px). Test on iPhone SE through iPad Pro. | Medium | Medium |
| 26 | **PWA / Installable App** | Add `manifest.json`, service worker with Workbox, app icons (192/512px), and offline caching. Allow "Add to Home Screen" on mobile. Cache game assets for offline play. | Medium | Medium |

**Phase 5 Deliverable:** Accessible, installable game that works well for all users.

---

## Phase 6 — Advanced & Stretch Features (Enhancements 27–30)

_Differentiation features for engaged players._

| # | Enhancement | Description | Effort | Priority |
|---|-------------|-------------|--------|----------|
| 27 | **Basic Strategy Trainer Mode** | Overlay that shows the mathematically optimal action for each hand vs. dealer upcard. Color-code player's choice: green = optimal, red = mistake. Track accuracy %. Reference standard basic strategy chart. | Large | Medium |
| 28 | **Card Counting Practice Mode** | Display running count (Hi-Lo system) as cards are dealt. Show true count (running / decks remaining). Track player's count accuracy. Toggle visibility for self-testing. Educational overlay explaining counting systems. | Medium | Medium |
| 29 | **Side Bets (21+3 & Perfect Pairs)** | Add optional side bets before deal. 21+3: player's 2 cards + dealer upcard form poker hand (flush, straight, three-of-a-kind). Perfect Pairs: player's first 2 cards are a pair (mixed, colored, perfect). Custom payout tables. | Large | Low |
| 30 | **Multiplayer (Local Hot-Seat)** | Support 2–4 players at one table, each with their own bankroll and hand. Rotate active player indicator. Shared dealer hand. Turn-based with visual cues for whose turn it is. No networking — all local. | Large | Low |

**Phase 6 Deliverable:** Educational tools and social play that set the game apart.

---

## Implementation Timeline (Suggested)

```
Phase 1 — Foundation & Architecture         ██████░░░░░░░░░░░░░░░░░░  ~2 weeks
Phase 2 — Core Gameplay Features             ░░░░░░██████████░░░░░░░░  ~3 weeks
Phase 3 — Persistence & Statistics           ░░░░░░░░░░░░░░░░████░░░░  ~2 weeks
Phase 4 — Audio & Visual Polish              ░░░░░░░░░░░░░░░░░░░█████  ~2 weeks
Phase 5 — UX & Accessibility                 ░░░░░░░░░░░░░░░░░░░░░░██  ~2 weeks
Phase 6 — Advanced & Stretch Features        ░░░░░░░░░░░░░░░░░░░░░░░░  ~3 weeks
                                             Week 1        Week 7      Week 14
```

**Total estimated effort: ~14 weeks** (solo developer, part-time)

---

## Effort Legend

| Label | Meaning |
|-------|---------|
| **Small** | 1–3 hours. Isolated change, minimal risk. |
| **Medium** | 4–12 hours. Touches multiple files, may need design decisions. |
| **Large** | 13–30+ hours. Cross-cutting concern, significant new logic or UI. |

---

## Dependency Graph

```
1 (Refactor) ──→ Everything
2 (Constants) ──→ 11, 21
3 (State Machine) ──→ 6, 7, 8, 9
4 (Tests) ──→ validates 6–11
5 (TypeScript) ──→ improves all later work

6 (Double) ──→ 7 (Split needs double-after-split logic)
7 (Split) ──→ 29 (Side bets reference pair detection)
10 (Shoe) ──→ 28 (Card counting needs shoe tracking)
12 (Persistence) ──→ 13, 14, 15

16 (Sound) ──→ independent
17–19 (Animations) ──→ independent but best after Phase 2

22 (Keyboard) ──→ independent
23 (A11y) ──→ after Phase 2 (needs all actions to exist)
27 (Strategy) ──→ after 6, 7, 8, 9 (needs all actions)
30 (Multiplayer) ──→ after 1, 3, 7 (needs clean architecture + split)
```

---

## Quick Wins (Can Ship Independently, Anytime)

These enhancements have zero dependencies and can be done as palette cleansers between phases:

- **#20** Card Back Design — pure visual, ~1–2 hours
- **#21** Table Felt Customization — CSS variable swap, ~1 hour
- **#22** Keyboard Shortcuts — event listener + tooltip updates, ~2 hours
- **#9** Surrender — simplest gameplay addition, ~1–2 hours

---

## Risk Register

| Risk | Mitigation |
|------|------------|
| Split logic is complex (multiple active hands, re-splits, aces-only-one-card) | Implement behind feature flag. Write comprehensive tests first (TDD). |
| Audio files increase bundle size | Use compressed `.webm`/`.mp3` dual format. Lazy-load audio on first user interaction. |
| localStorage corruption causes crash on load | Wrap reads in try/catch. Validate schema on load. Provide "Reset All Data" escape hatch. |
| TypeScript migration breaks working code | Migrate incrementally per-file. Run `tsc --noEmit` in CI before merging. Keep `.js` → `.ts` renames in dedicated commits. |
| Animation jank on low-end mobile | Use `transform` and `opacity` only (GPU-composited). Test on throttled CPU in DevTools. Provide "reduced motion" setting. |

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Unit test coverage (utilities) | ≥ 90 % |
| Lighthouse Performance score | ≥ 90 |
| Lighthouse Accessibility score | ≥ 95 |
| Total bundle size (gzipped) | < 200 KB |
| Time to interactive | < 2 seconds |
| All 30 enhancements shipped | 100 % |
