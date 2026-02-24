# Blackjack Graphic Game — Detailed Enhancement Implementation Plan

> **Project:** blackjack-graphic-game (React 19 + Vite)
> **Generated:** 2026-02-23
> **Scope:** 30 enhancements across 6 phases
> **Estimated Total Effort:** ~14 weeks (solo developer, part-time ~20 hrs/week)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current State Assessment](#current-state-assessment)
3. [Phase 1 — Foundation & Architecture](#phase-1--foundation--architecture-enhancements-15)
4. [Phase 2 — Core Gameplay Features](#phase-2--core-gameplay-features-enhancements-611)
5. [Phase 3 — Persistence & Statistics](#phase-3--persistence--statistics-enhancements-1215)
6. [Phase 4 — Audio & Visual Polish](#phase-4--audio--visual-polish-enhancements-1621)
7. [Phase 5 — UX & Accessibility](#phase-5--ux--accessibility-enhancements-2226)
8. [Phase 6 — Advanced & Stretch Features](#phase-6--advanced--stretch-features-enhancements-2730)
9. [Dependency Graph](#dependency-graph)
10. [Quick Wins](#quick-wins)
11. [Risk Register & Mitigation](#risk-register--mitigation)
12. [Success Metrics](#success-metrics)
13. [Appendix: File Impact Map](#appendix-file-impact-map)

---

## Executive Summary

This plan transforms the current single-file blackjack MVP into a fully-featured, polished, accessible casino game. Work is organized into six sequential phases, each delivering a shippable increment. Phases are ordered to maximize value while respecting technical dependencies — architectural cleanup comes first, then gameplay features, persistence, polish, accessibility, and finally advanced/stretch features.

**Key principles:**
- Each phase produces a deployable, non-regressing build
- Every enhancement includes its own acceptance criteria and verification steps
- Quick-win items can be pulled forward as palette-cleansers between phases
- All estimates assume familiarity with the existing codebase

---

## Current State Assessment

| Aspect | Current State |
|--------|--------------|
| **Architecture** | Monolithic `App.jsx` (372 lines) + `Card.jsx` (453 lines) |
| **State management** | `useState` hooks with string-based game states |
| **Gameplay** | Hit, Stand, Bet only — no Double, Split, Insurance, or Surrender |
| **Persistence** | None — all state lost on refresh |
| **Testing** | Zero tests |
| **TypeScript** | Not used |
| **Audio** | None |
| **Accessibility** | Minimal — no ARIA labels, no keyboard support |
| **Deck** | Single 52-card deck reshuffled each hand |
| **Deployment** | Netlify, Vite build |

---

## Phase 1 — Foundation & Architecture (Enhancements 1–5)

**Goal:** Clean, testable, type-safe architecture with zero user-visible changes.
**Duration:** ~2 weeks
**Blocking:** Every subsequent phase depends on Phase 1.

---

### Enhancement 1: Code Architecture Refactor

| Field | Detail |
|-------|--------|
| **Priority** | Critical |
| **Effort** | Large (13–20 hours) |
| **Risk** | Medium — high blast radius but no logic changes |
| **Dependencies** | None |
| **Blocks** | Everything |

**Objective:** Break the monolithic `App.jsx` into focused, single-responsibility modules.

**Implementation Steps:**

1. **Extract utility functions** (2 hrs)
   - Create `src/utils/deck.js` — move `createDeck()`, `shuffleDeck()`
   - Create `src/utils/scoring.js` — move `cardValue()`, `calculateScore()`, `isBlackjack()`
   - Create `src/utils/payout.js` — move payout calculation logic
   - Ensure all functions are pure, stateless, and exported individually

2. **Extract constants** (1 hr)
   - Create `src/constants.js` — move chip denominations ($10/$25/$50/$100), starting bankroll ($1000), dealer-stand threshold (17), animation durations, card dimensions
   - Replace all inline magic numbers with named imports

3. **Extract custom hook** (4 hrs)
   - Create `src/hooks/useGameEngine.js`
   - Move all game state (`deck`, `playerHand`, `dealerHand`, `chips`, `bet`, `gameState`, `message`, `result`, `dealerRevealed`, `wins`, `losses`, `pushes`) into the hook
   - Move all game action callbacks (`placeBet`, `clearBet`, `dealCards`, `hit`, `stand`, `resolveGame`, `newRound`, `resetGame`) into the hook
   - Return a clean API: `{ state, actions }`

4. **Extract UI components** (5 hrs)
   - `src/components/DealerHand.jsx` — dealer cards + score display
   - `src/components/PlayerHand.jsx` — player cards + score display
   - `src/components/BettingControls.jsx` — chip buttons + clear + deal
   - `src/components/ActionControls.jsx` — hit/stand (later: double/split/etc.)
   - `src/components/GameBanner.jsx` — result message overlay
   - `src/components/Scoreboard.jsx` — header stats (W/L/D)
   - `src/components/ChipStack.jsx` — visual chip/bankroll display

5. **Slim down `App.jsx`** (2 hrs)
   - `App.jsx` becomes a pure layout component: calls `useGameEngine()`, passes props to child components
   - Target: `App.jsx` under 80 lines

6. **Verification** (1 hr)
   - All existing gameplay works identically
   - No visual regressions (compare screenshots before/after)
   - No console errors or warnings
   - Vite HMR still works

**Acceptance Criteria:**
- [ ] `App.jsx` is under 100 lines
- [ ] Each utility file exports only pure functions
- [ ] `useGameEngine` hook encapsulates all game state and actions
- [ ] All 7+ UI components render correctly
- [ ] `npm run build` succeeds with no warnings

---

### Enhancement 2: Configuration & Constants System

| Field | Detail |
|-------|--------|
| **Priority** | Critical |
| **Effort** | Small (2–3 hours) |
| **Risk** | Low |
| **Dependencies** | Enhancement 1 |
| **Blocks** | Enhancements 11, 21 |

**Implementation Steps:**

1. **Define configuration schema** (30 min)
   - Expand `src/constants.js` into `src/config/defaults.js`:
     ```
     STARTING_BANKROLL, CHIP_DENOMINATIONS, DEALER_STAND_THRESHOLD,
     ANIMATION_DEAL_STAGGER, ANIMATION_FLIP_DURATION, CARD_WIDTH, CARD_HEIGHT,
     NUM_DECKS, BLACKJACK_PAYOUT_RATIO, DECK_PENETRATION
     ```

2. **Create GameSettingsContext** (1 hr)
   - `src/config/GameSettingsContext.jsx`
   - Provider wraps `<App />` in `main.jsx`
   - `useGameSettings()` hook for consumers
   - Merge user overrides with defaults

3. **Migrate all consumers** (1 hr)
   - Replace every hardcoded value in components/hooks with context reads
   - Grep for remaining magic numbers and eliminate

**Acceptance Criteria:**
- [ ] Zero magic numbers in any component or hook
- [ ] `useGameSettings()` returns all game configuration
- [ ] Changing a config value in one place propagates everywhere

---

### Enhancement 3: Game State Machine

| Field | Detail |
|-------|--------|
| **Priority** | Critical |
| **Effort** | Medium (6–10 hours) |
| **Risk** | Medium — touches game flow logic |
| **Dependencies** | Enhancement 1 |
| **Blocks** | Enhancements 6, 7, 8, 9 |

**Implementation Steps:**

1. **Define state enum and transition table** (2 hrs)
   - States: `IDLE`, `BETTING`, `DEALING`, `PLAYER_TURN`, `SPLITTING`, `DOUBLING`, `INSURANCE_OFFER`, `SURRENDERING`, `DEALER_TURN`, `RESOLVING`, `GAME_OVER`
   - For each state, define: legal actions, valid next states, entry/exit effects

2. **Implement as `useReducer`** (3 hrs)
   - Create `src/state/gameReducer.js`
   - Actions: `PLACE_BET`, `CLEAR_BET`, `DEAL`, `HIT`, `STAND`, `DOUBLE`, `SPLIT`, `INSURE`, `SURRENDER`, `DEALER_DRAW`, `RESOLVE`, `NEW_ROUND`, `RESET`
   - Guard every dispatch against current state — throw on illegal transitions
   - Replace `useState` calls in `useGameEngine` with reducer

3. **Add transition logging (dev only)** (1 hr)
   - Console.log state transitions in development mode
   - Helps debug flow issues during Phase 2

4. **Validate edge cases** (2 hrs)
   - Rapid button clicks can't cause double-transitions
   - Browser back/forward doesn't break state
   - All existing game flows still work

**Acceptance Criteria:**
- [ ] All game states are enumerated constants
- [ ] Illegal actions in any state are silently ignored or throw in dev
- [ ] `useReducer` drives all state changes in `useGameEngine`
- [ ] No regressions in existing gameplay

---

### Enhancement 4: Unit Test Harness

| Field | Detail |
|-------|--------|
| **Priority** | Critical |
| **Effort** | Medium (6–10 hours) |
| **Risk** | Low |
| **Dependencies** | Enhancement 1 (utilities must be extracted first) |
| **Blocks** | Validates Enhancements 6–11 |

**Implementation Steps:**

1. **Install and configure Vitest** (30 min)
   - `npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom`
   - Add `test` script to `package.json`
   - Configure `vitest.config.js` with jsdom environment

2. **Write utility tests** (3 hrs)
   - `src/utils/__tests__/deck.test.js`
     - `createDeck()` returns 52 unique cards
     - Deck contains 4 suits × 13 ranks
     - Shuffle produces different order (statistical test)
   - `src/utils/__tests__/scoring.test.js`
     - `cardValue()` maps all ranks correctly (A=11, 2-10=face, J/Q/K=10)
     - `calculateScore()` handles soft aces (A+6=17, A+6+8=15)
     - `calculateScore()` handles multiple aces (A+A=12, A+A+9=21)
     - `isBlackjack()` true for A+10/J/Q/K, false for A+A, false for 3-card 21
   - `src/utils/__tests__/payout.test.js`
     - Win: returns 2× bet
     - Blackjack: returns 2.5× bet (3:2)
     - Push: returns 1× bet
     - Loss: returns 0

3. **Write reducer tests** (3 hrs)
   - `src/state/__tests__/gameReducer.test.js`
     - Test every valid state transition
     - Verify illegal transitions are rejected
     - Test `DEAL` produces correct initial state (2 cards each)
     - Test `HIT` adds card to player hand
     - Test `STAND` transitions to dealer turn
     - Test `RESOLVE` correctly determines winner

4. **Add test CI check** (30 min)
   - Add `"precommit": "vitest run"` or integrate with lint-staged
   - Ensure `npm test` exits cleanly

**Acceptance Criteria:**
- [ ] `npm test` runs and passes
- [ ] ≥90% coverage on `src/utils/` files
- [ ] ≥80% coverage on `src/state/gameReducer.js`
- [ ] Tests complete in < 5 seconds

---

### Enhancement 5: TypeScript Migration

| Field | Detail |
|-------|--------|
| **Priority** | High |
| **Effort** | Medium (8–12 hours) |
| **Risk** | Medium — rename + type errors across codebase |
| **Dependencies** | Enhancements 1, 4 |
| **Blocks** | Improves all later work |

**Implementation Steps:**

1. **Install TypeScript** (30 min)
   - `npm install -D typescript @types/react @types/react-dom`
   - Create `tsconfig.json` with strict mode
   - Update Vite config for TS support

2. **Define core types** (1.5 hrs)
   - `src/types.ts`:
     ```typescript
     type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades'
     type Rank = 'A' | '2' | '3' | ... | 'K'
     interface Card { suit: Suit; rank: Rank; id: number }
     type Hand = Card[]
     type GamePhase = 'IDLE' | 'BETTING' | 'PLAYER_TURN' | ...
     interface GameState { ... }
     type GameAction = { type: 'PLACE_BET'; amount: number } | ...
     ```

3. **Migrate utilities and hooks** (3 hrs)
   - Rename `.js` → `.ts` for all `src/utils/`, `src/state/`, `src/hooks/`, `src/config/`
   - Add type annotations to all function signatures
   - Fix type errors

4. **Migrate components** (3 hrs)
   - Rename `.jsx` → `.tsx` for all components
   - Add `Props` interfaces to each component
   - Type all event handlers and refs

5. **Migrate tests** (1 hr)
   - Rename `.test.js` → `.test.ts`
   - Ensure Vitest is configured for TS

6. **Enable strict mode** (1 hr)
   - Turn on `strict: true` in tsconfig
   - Fix remaining `any` types and null checks
   - Add `tsc --noEmit` to CI/precommit

**Acceptance Criteria:**
- [ ] Zero `.js`/`.jsx` files remain in `src/`
- [ ] `tsc --noEmit` exits with 0 errors
- [ ] All tests still pass
- [ ] `npm run build` produces working bundle

---

### Phase 1 Milestone Checklist

- [ ] `App.jsx` → slim layout component (<100 lines)
- [ ] 7+ extracted UI components
- [ ] `useGameEngine` hook encapsulates all state
- [ ] All utilities are pure, tested functions
- [ ] Explicit state machine with guarded transitions
- [ ] Full TypeScript with strict mode
- [ ] ≥90% utility test coverage
- [ ] Identical user experience (zero visual changes)

---

## Phase 2 — Core Gameplay Features (Enhancements 6–11)

**Goal:** Feature-complete blackjack that matches standard casino rules.
**Duration:** ~3 weeks
**Dependency:** Phase 1 complete.

---

### Enhancement 6: Double Down

| Field | Detail |
|-------|--------|
| **Priority** | Critical |
| **Effort** | Medium (4–6 hours) |
| **Risk** | Low |
| **Dependencies** | Enhancement 3 (state machine) |
| **Blocks** | Enhancement 7 (double-after-split) |

**Implementation Steps:**

1. **Add `DOUBLE` action to state machine** (1 hr)
   - Valid only in `PLAYER_TURN` state, when player has exactly 2 cards and sufficient chips
   - Transitions to `DEALER_TURN` after one card is drawn

2. **Implement double logic in game engine** (1.5 hrs)
   - Deduct additional bet equal to original bet from bankroll
   - Deal exactly one more card to player
   - Immediately transition to dealer turn (no further player actions)
   - Calculate payout based on doubled bet amount

3. **Add UI button** (1 hr)
   - "Double" button in `ActionControls` component
   - Enabled only when: 2 cards in hand, chips ≥ bet, game in `PLAYER_TURN`
   - Visual feedback (chip animation placeholder for Phase 4)

4. **Write tests** (1.5 hrs)
   - Double deducts correct amount
   - Exactly one card dealt after double
   - Player cannot hit/stand after doubling
   - Payout is 2× doubled bet on win
   - Cannot double with insufficient chips

**Acceptance Criteria:**
- [ ] "Double" button appears when eligible
- [ ] Double correctly doubles the bet and deals one card
- [ ] Player turn ends immediately after double
- [ ] Payout reflects the doubled bet
- [ ] Tests pass

---

### Enhancement 7: Split Pairs

| Field | Detail |
|-------|--------|
| **Priority** | Critical |
| **Effort** | Large (15–25 hours) |
| **Risk** | High — most complex gameplay feature |
| **Dependencies** | Enhancements 3, 6 |
| **Blocks** | Enhancement 29 (side bets) |

**Implementation Steps:**

1. **Extend state for multiple hands** (3 hrs)
   - Replace `playerHand: Card[]` with `playerHands: Hand[]` and `activeHandIndex: number`
   - Add `handBets: number[]` to track per-hand bets
   - Add `SPLITTING` state to machine

2. **Implement split logic** (5 hrs)
   - When first two cards share the same rank, allow split
   - Create two hands, each with one original card + one new card
   - Deduct additional bet equal to original for second hand
   - Play each hand in sequence (active hand indicator)
   - Re-split allowed up to 3 total hands
   - Aces split: receive only one card per hand, no further actions

3. **Implement double-after-split** (2 hrs)
   - Allow doubling on split hands (configurable via Enhancement 11)
   - Reuse Enhancement 6 logic per-hand

4. **Update UI for split hands** (4 hrs)
   - Render hands side by side
   - Highlight active hand with border/glow
   - Show per-hand score and bet
   - Animate card movement to split positions

5. **Update resolution logic** (3 hrs)
   - Resolve each hand independently against dealer
   - Calculate payouts per hand
   - Display per-hand results

6. **Write comprehensive tests** (4 hrs)
   - Split creates two hands with correct cards
   - Correct bet deduction
   - Active hand switches after first hand stands/busts
   - Aces-split: one card only rule
   - Re-split works up to limit
   - Each hand resolves independently
   - Edge case: split aces both get blackjack (typically pays even money, not 3:2)

**Acceptance Criteria:**
- [ ] "Split" button appears for matching-rank pairs
- [ ] Hands render side-by-side with active indicator
- [ ] Each hand plays and resolves independently
- [ ] Re-split works up to 3 hands
- [ ] Aces split receive one card only
- [ ] All split tests pass

---

### Enhancement 8: Insurance

| Field | Detail |
|-------|--------|
| **Priority** | High |
| **Effort** | Medium (4–6 hours) |
| **Risk** | Low |
| **Dependencies** | Enhancement 3 |

**Implementation Steps:**

1. **Add `INSURANCE_OFFER` state** (1 hr)
   - After deal, if dealer upcard is Ace, transition to `INSURANCE_OFFER`
   - Valid actions: `ACCEPT_INSURANCE`, `DECLINE_INSURANCE`

2. **Implement insurance logic** (2 hrs)
   - Insurance bet = up to half the main bet
   - If dealer has blackjack: insurance pays 2:1, then resolve main hand
   - If dealer doesn't have blackjack: insurance bet lost, play continues normally

3. **Add UI** (1.5 hrs)
   - Modal or overlay asking "Insurance? (Up to $X)"
   - Accept/Decline buttons
   - Show insurance bet deduction

4. **Write tests** (1.5 hrs)
   - Insurance offered only on dealer Ace
   - Correct payout when dealer has blackjack
   - Insurance lost when dealer doesn't have blackjack
   - Insurance bet capped at half of main bet

**Acceptance Criteria:**
- [ ] Insurance prompt appears when dealer shows Ace
- [ ] Correct payout logic for both outcomes
- [ ] Player can accept or decline
- [ ] Tests pass

---

### Enhancement 9: Surrender

| Field | Detail |
|-------|--------|
| **Priority** | High |
| **Effort** | Small (1–2 hours) |
| **Risk** | Very low — simplest gameplay addition |
| **Dependencies** | Enhancement 3 |

**Implementation Steps:**

1. **Add `SURRENDER` action to state machine** (30 min)
   - Valid only in `PLAYER_TURN`, only with initial 2 cards, not after split or double

2. **Implement surrender logic** (30 min)
   - Return half the bet to player's bankroll
   - Transition to `GAME_OVER` with "Surrendered" message

3. **Add UI button** (30 min)
   - "Surrender" button, visible only when eligible
   - Styled distinctly (muted/warning color)

4. **Write tests** (30 min)
   - Half bet returned on surrender
   - Cannot surrender after hitting
   - Cannot surrender on split hands

**Acceptance Criteria:**
- [ ] "Surrender" button available on initial 2-card hand
- [ ] Exactly half the bet returned
- [ ] Not available after hit, split, or double
- [ ] Tests pass

---

### Enhancement 10: Multi-Deck Shoe

| Field | Detail |
|-------|--------|
| **Priority** | High |
| **Effort** | Medium (5–8 hours) |
| **Risk** | Medium |
| **Dependencies** | Enhancement 1 (deck.js utility) |
| **Blocks** | Enhancement 28 (card counting) |

**Implementation Steps:**

1. **Extend deck utility** (2 hrs)
   - `createShoe(numDecks: number)` — creates and shuffles N × 52 cards
   - Track `remainingCards` count
   - Insert cut card at configurable penetration (default 75%)

2. **Implement shoe management** (2 hrs)
   - Draw from shoe across rounds (don't reshuffle each hand)
   - When cut card is reached, finish current hand then reshuffle
   - Show "Shuffling..." message/animation on reshuffle

3. **Add visual shoe indicator** (1.5 hrs)
   - Small bar or gauge showing shoe depth (cards remaining / total)
   - Changes color as shoe depletes (green → yellow → red)

4. **Integrate with game engine** (1 hr)
   - Replace per-hand `createDeck()` with persistent shoe
   - Shoe state managed in `useGameEngine`

5. **Write tests** (1.5 hrs)
   - Shoe contains correct number of cards (6 × 52 = 312 for 6-deck)
   - Cards are drawn sequentially without reshuffle
   - Cut card triggers reshuffle at correct depth
   - Shoe indicator reflects remaining cards

**Acceptance Criteria:**
- [ ] Game uses multi-deck shoe by default
- [ ] Shoe persists across hands until cut card
- [ ] Visual indicator shows shoe depth
- [ ] Reshuffle occurs at configurable penetration point
- [ ] Tests pass

---

### Enhancement 11: Configurable House Rules

| Field | Detail |
|-------|--------|
| **Priority** | Medium |
| **Effort** | Medium (5–8 hours) |
| **Risk** | Low |
| **Dependencies** | Enhancements 2, 6, 7, 8, 9, 10 |

**Implementation Steps:**

1. **Design settings UI** (2 hrs)
   - Gear icon in header opens settings panel (slide-out or modal)
   - Settings:
     - Number of decks: 1 / 2 / 6 / 8 (dropdown)
     - Dealer hits soft 17: Yes / No (toggle)
     - Blackjack payout: 3:2 / 6:5 (radio)
     - Double after split: Yes / No (toggle)
     - Surrender allowed: Yes / No (toggle)

2. **Wire settings to GameSettingsContext** (2 hrs)
   - Settings update context values
   - Game engine reads from context
   - Changes take effect on next hand (not mid-hand)

3. **Persist to localStorage** (1 hr)
   - Save settings on change
   - Restore on load
   - "Reset to Defaults" button

4. **Update footer display** (1 hr)
   - Footer dynamically shows current house rules
   - Changes reflected in real-time

5. **Write tests** (1 hr)
   - Settings persist across page reloads
   - Game engine respects each setting
   - Dealer soft-17 behavior changes correctly

**Acceptance Criteria:**
- [ ] Settings panel accessible from header
- [ ] All 5 house rules configurable
- [ ] Settings persist to localStorage
- [ ] Game behavior changes accordingly
- [ ] Footer reflects current rules

---

### Phase 2 Milestone Checklist

- [ ] Double Down fully functional
- [ ] Split Pairs with re-split and aces rules
- [ ] Insurance offered on dealer Ace
- [ ] Late Surrender available
- [ ] Multi-deck shoe with visual indicator
- [ ] All house rules configurable
- [ ] All new features covered by tests
- [ ] Game matches standard casino blackjack rules

---

## Phase 3 — Persistence & Statistics (Enhancements 12–15)

**Goal:** Persistent, stats-rich experience that rewards continued play.
**Duration:** ~2 weeks
**Dependency:** Phase 2 (particularly Enhancement 11 for settings persistence pattern).

---

### Enhancement 12: localStorage Persistence

| Field | Detail |
|-------|--------|
| **Priority** | High |
| **Effort** | Small (2–4 hours) |
| **Risk** | Low — but must handle corrupted data gracefully |
| **Dependencies** | Enhancement 2 |
| **Blocks** | Enhancements 13, 14, 15 |

**Implementation Steps:**

1. **Define persistence schema** (1 hr)
   - Version the schema (e.g., `{ version: 1, ... }`) for future migrations
   - Persisted data: bankroll, win/loss/push counts, settings, current shoe state
   - Create `src/utils/storage.ts` with `save()`, `load()`, `clear()` functions

2. **Auto-save on state changes** (1 hr)
   - Use `useEffect` to persist after each hand resolves
   - Debounce saves to avoid excessive writes

3. **Restore on load** (1 hr)
   - Wrap `load()` in try/catch — invalid/corrupt data falls back to defaults
   - Validate schema version on load
   - Show "Welcome back!" if restored vs. "Welcome!" if fresh

4. **Add "Reset Everything" button** (30 min)
   - In settings panel
   - Confirmation dialog: "This will reset your bankroll, stats, and settings. Continue?"
   - Clears localStorage and resets all state

**Acceptance Criteria:**
- [ ] Bankroll and stats survive page refresh
- [ ] Corrupt localStorage doesn't crash the app
- [ ] "Reset Everything" clears all persisted data
- [ ] Schema is versioned

---

### Enhancement 13: Detailed Statistics Dashboard

| Field | Detail |
|-------|--------|
| **Priority** | High |
| **Effort** | Large (12–18 hours) |
| **Risk** | Low |
| **Dependencies** | Enhancement 12 |

**Implementation Steps:**

1. **Define statistics data model** (1 hr)
   - Track: total hands, wins, losses, pushes, blackjacks, doubles won/lost, splits played, surrenders, total wagered, total won, biggest win streak, biggest loss streak, current streak, peak bankroll, lowest bankroll

2. **Create statistics engine** (3 hrs)
   - `src/utils/statistics.ts` — pure functions to compute derived stats (win rate, ROI, average bet, etc.)
   - Update stats after each hand resolution

3. **Build stats dashboard UI** (5 hrs)
   - Slide-out panel (hamburger icon or dedicated tab)
   - Sections:
     - **Summary Cards**: Total hands, win rate %, net profit/loss, ROI %
     - **Performance Chart**: Simple line chart of bankroll over time (inline `<canvas>` or SVG path — no charting library)
     - **Breakdown Table**: Wins, losses, pushes, blackjacks, surrenders with percentages
     - **Streaks**: Current streak, best win streak, worst loss streak

4. **Implement sparkline/chart** (3 hrs)
   - Record bankroll value after each hand (capped at last 200 data points)
   - Render as SVG polyline in the stats panel
   - Color: green if above starting bankroll, red if below

5. **Persist stats** (1 hr)
   - Save all stats to localStorage via Enhancement 12's `save()` function
   - Include bankroll history array

6. **Write tests** (2 hrs)
   - Derived stat calculations are correct
   - Streak tracking works correctly
   - Stats persist and restore correctly

**Acceptance Criteria:**
- [ ] Stats panel shows all key metrics
- [ ] Bankroll chart renders correctly
- [ ] Stats persist across sessions
- [ ] Stats are accurate (verified by tests)

---

### Enhancement 14: Hand History Log

| Field | Detail |
|-------|--------|
| **Priority** | Medium |
| **Effort** | Medium (6–10 hours) |
| **Risk** | Low |
| **Dependencies** | Enhancement 12 |

**Implementation Steps:**

1. **Define hand record schema** (1 hr)
   - `{ id, timestamp, playerCards, dealerCards, actions[], result, bet, payout, playerScore, dealerScore }`

2. **Record each hand** (2 hrs)
   - After resolution, create hand record and push to history array
   - Cap at 200 entries (FIFO — drop oldest)

3. **Build history UI** (3 hrs)
   - Scrollable list in stats panel or separate tab
   - Each entry: condensed summary (e.g., "Hand #42 — 19 vs 17 — Win +$50")
   - Expandable: full card detail, actions taken, timestamps

4. **Hand replay** (2 hrs)
   - Click "Replay" on a hand record
   - Step-by-step animation showing deal → actions → resolution
   - Overlay mode, dismiss to return to current game

5. **Persist to localStorage** (1 hr)
   - Part of the persistence schema from Enhancement 12

**Acceptance Criteria:**
- [ ] Each completed hand is recorded
- [ ] History shows last 200 hands
- [ ] Each entry displays cards, result, and payout
- [ ] Replay animates the hand step-by-step
- [ ] History persists across sessions

---

### Enhancement 15: Achievements / Milestones

| Field | Detail |
|-------|--------|
| **Priority** | Medium |
| **Effort** | Medium (5–8 hours) |
| **Risk** | Low |
| **Dependencies** | Enhancement 12 |

**Implementation Steps:**

1. **Define achievement set** (1 hr)
   - ~15–20 achievements:
     - "First Blood" — Win your first hand
     - "Natural" — Get a blackjack
     - "Hot Streak" — Win 5 hands in a row
     - "On Fire" — Win 10 hands in a row
     - "High Roller" — Place a $100 bet
     - "Bankroll Builder" — Reach $2,000
     - "Big Stack" — Reach $5,000
     - "Veteran" — Play 100 hands
     - "Grinder" — Play 500 hands
     - "Split Decision" — Win both split hands
     - "Double Trouble" — Win a doubled hand
     - "Comeback Kid" — Recover from below $200 to above $1,000
     - "Surrender Monkey" — Surrender 10 times
     - etc.

2. **Create achievement engine** (2 hrs)
   - `src/utils/achievements.ts`
   - Check conditions after each hand
   - Track unlocked achievements with timestamps

3. **Toast notification system** (2 hrs)
   - `src/components/AchievementToast.tsx`
   - Animated slide-in notification when achievement unlocks
   - Shows icon + title + description
   - Auto-dismiss after 3 seconds

4. **Achievements display** (1.5 hrs)
   - Section in stats panel showing all achievements
   - Locked vs. unlocked visual state
   - Shows unlock date for earned achievements

5. **Persist unlocked achievements** (30 min)
   - Store in localStorage

**Acceptance Criteria:**
- [ ] Achievements unlock when conditions are met
- [ ] Toast notification appears on unlock
- [ ] All achievements viewable in stats panel
- [ ] Unlocked achievements persist across sessions
- [ ] No duplicate unlock notifications

---

### Phase 3 Milestone Checklist

- [ ] All game state persists across browser sessions
- [ ] Detailed statistics dashboard with charts
- [ ] Hand history with replay feature
- [ ] Achievement system with notifications
- [ ] Data corruption handling is robust

---

## Phase 4 — Audio & Visual Polish (Enhancements 16–21)

**Goal:** Immersive casino atmosphere with polished audiovisuals.
**Duration:** ~2 weeks
**Dependency:** Phases 1–2 for complete game actions; Phase 3 for settings persistence.

---

### Enhancement 16: Sound Effects

| Field | Detail |
|-------|--------|
| **Priority** | High |
| **Effort** | Medium (6–10 hours) |
| **Risk** | Medium — browser autoplay policies |
| **Dependencies** | None (independent) |

**Implementation Steps:**

1. **Source/create audio files** (2 hrs)
   - Required sounds: card deal (flick), chip place, chip collect, win fanfare, loss thud, blackjack celebration, shuffle whoosh, button click
   - Format: `.webm` primary + `.mp3` fallback
   - Total budget: < 500 KB
   - Use royalty-free sources or generate with simple synths

2. **Build audio manager** (2 hrs)
   - `src/utils/audio.ts`
   - Use Web Audio API for low-latency playback
   - Preload all sounds on first user interaction (bypass autoplay restriction)
   - `play(soundName)` function with volume control

3. **Integrate with game events** (2 hrs)
   - Card deal: play on each card animation
   - Bet placed: chip click on each chip button press
   - Win: fanfare on game resolution
   - Blackjack: special celebration sound
   - Loss/bust: thud sound
   - Shuffle: when shoe reshuffles

4. **Mute toggle** (1 hr)
   - Speaker icon in header
   - Persist mute preference to localStorage
   - Respect system `prefers-reduced-motion` media query

5. **Testing** (1 hr)
   - All sounds trigger at correct moments
   - Mute toggle works
   - No audio errors on mobile browsers

**Acceptance Criteria:**
- [ ] All game events have appropriate sounds
- [ ] Mute toggle persists across sessions
- [ ] Total audio assets < 500 KB
- [ ] No autoplay policy violations
- [ ] Sounds play without noticeable delay

---

### Enhancement 17: Enhanced Card Deal Animations

| Field | Detail |
|-------|--------|
| **Priority** | High |
| **Effort** | Medium (6–10 hours) |
| **Risk** | Medium — animation performance |
| **Dependencies** | Enhancement 1 (component extraction) |

**Implementation Steps:**

1. **Design animation choreography** (1 hr)
   - Cards fly from shoe position (top-right) to hand positions
   - Arc trajectory with slight rotation
   - Stagger: 150ms between cards
   - Dealer hole card: dealt face-down

2. **Implement deal animation** (3 hrs)
   - Use CSS `@keyframes` with `transform: translate() rotate()`
   - Cards start at shoe position, animate to final position
   - Use `will-change: transform` for GPU acceleration
   - Stagger via `animation-delay`

3. **Implement card flip animation** (2 hrs)
   - 3D CSS transform for dealer hole-card reveal
   - `rotateY(0deg)` → `rotateY(180deg)` with card-back on front, card-face on back
   - `perspective` on parent container for 3D depth

4. **Hit card animation** (1 hr)
   - New cards fly from shoe to next position in hand
   - Hand cards shift to make room

5. **Performance validation** (1 hr)
   - Test on throttled CPU (4× slowdown in DevTools)
   - Only animate `transform` and `opacity` (GPU-composited properties)
   - Provide `prefers-reduced-motion` fallback (instant placement, no animation)

**Acceptance Criteria:**
- [ ] Cards animate from shoe to hand positions
- [ ] Dealer hole card has 3D flip reveal
- [ ] Animations are smooth at 60fps on mid-range devices
- [ ] Reduced motion preference is respected
- [ ] Hit cards animate correctly

---

### Enhancement 18: Chip Animation

| Field | Detail |
|-------|--------|
| **Priority** | Medium |
| **Effort** | Medium (4–8 hours) |
| **Risk** | Low |
| **Dependencies** | Enhancement 1 |

**Implementation Steps:**

1. **Design chip visuals** (1 hr)
   - SVG chip graphics for each denomination ($10=blue, $25=green, $50=red, $100=black)
   - Stacked chip appearance in bankroll area

2. **Animate bet placement** (2 hrs)
   - On chip click: chip slides from bankroll area to betting circle
   - Use `requestAnimationFrame` or CSS keyframes
   - Stack chips in the betting circle

3. **Animate win collection** (2 hrs)
   - On win: chips slide from pot to bankroll with slight scatter
   - On loss: chips slide from pot off-screen (or to dealer area)

4. **Integrate with game flow** (1 hr)
   - Timing: chip animations complete before card deal starts
   - Win animation plays after result is displayed

**Acceptance Criteria:**
- [ ] Chips animate between bankroll and betting circle
- [ ] Win/loss chip animations are visually satisfying
- [ ] Animations don't block game flow
- [ ] Performance is smooth

---

### Enhancement 19: Win/Loss Celebration Effects

| Field | Detail |
|-------|--------|
| **Priority** | Medium |
| **Effort** | Medium (5–8 hours) |
| **Risk** | Low |
| **Dependencies** | None |

**Implementation Steps:**

1. **Blackjack celebration** (2 hrs)
   - Gold particle burst from card area
   - Animated "BLACKJACK!" text (scale up + glow)
   - Particle system: 20–30 gold circles with physics (gravity + scatter)
   - Duration: < 2 seconds

2. **Big win effect** (1.5 hrs)
   - Trigger on win ≥ $200
   - Confetti rain from top of screen
   - Lightweight: CSS-only or minimal JS (no library)

3. **Bust/loss effect** (1 hr)
   - Subtle red flash overlay on bust
   - Cards shake briefly
   - Duration: < 0.5 seconds

4. **Implementation** (1.5 hrs)
   - `src/components/CelebrationEffects.tsx`
   - Canvas-based particle system or pure CSS animations
   - Non-blocking: effects don't prevent clicking "New Round"

5. **Reduced motion** (30 min)
   - Respect `prefers-reduced-motion`: show static text result only

**Acceptance Criteria:**
- [ ] Blackjack triggers gold particle + text animation
- [ ] Big wins trigger confetti
- [ ] Bust triggers red flash
- [ ] All effects are < 2 seconds and non-blocking
- [ ] Reduced motion is respected

---

### Enhancement 20: Card Back Design

| Field | Detail |
|-------|--------|
| **Priority** | Low |
| **Effort** | Small (2–3 hours) |
| **Risk** | Very low |
| **Dependencies** | None |

**Implementation Steps:**

1. **Design ornate card back SVG** (1.5 hrs)
   - Replace current simple striped pattern
   - Ornate border, crosshatch center pattern, decorative corners
   - Design in 4 color themes: Classic Blue, Casino Red, Royal Purple, Forest Green

2. **Add theme selection** (1 hr)
   - Setting in preferences panel
   - Previews in settings UI
   - Persist selection to localStorage

3. **Update Card component** (30 min)
   - Card back renders selected theme
   - CSS variable for theme colors

**Acceptance Criteria:**
- [ ] 4 card back themes available
- [ ] Selected theme persists
- [ ] Card back is visually polished and detailed

---

### Enhancement 21: Table Felt Customization

| Field | Detail |
|-------|--------|
| **Priority** | Low |
| **Effort** | Small (1–2 hours) |
| **Risk** | Very low |
| **Dependencies** | Enhancement 2 (config system) |

**Implementation Steps:**

1. **Define felt color themes** (30 min)
   - Classic Green (#0b6623), Casino Blue (#1a3a5c), Royal Red (#5c1a1a), Royal Purple (#3d1a5c)

2. **Color picker in settings** (30 min)
   - Four color swatches, click to select
   - Preview of felt color

3. **Apply dynamically** (30 min)
   - Update CSS variable `--felt` on selection
   - Persist to localStorage

**Acceptance Criteria:**
- [ ] 4 felt colors available
- [ ] Selection updates background immediately
- [ ] Preference persists

---

### Phase 4 Milestone Checklist

- [ ] All game events have sound effects with mute toggle
- [ ] Cards animate from shoe with 3D flip reveal
- [ ] Chip animations on bet/win/loss
- [ ] Celebration effects for blackjack and big wins
- [ ] 4 card back themes selectable
- [ ] 4 table felt colors selectable
- [ ] All animations respect reduced motion preference
- [ ] Performance remains smooth (60fps)

---

## Phase 5 — UX & Accessibility (Enhancements 22–26)

**Goal:** Accessible, installable game that works well for all users on all devices.
**Duration:** ~2 weeks
**Dependency:** Phase 2 (all game actions must exist before keyboard/ARIA mapping).

---

### Enhancement 22: Keyboard Shortcuts

| Field | Detail |
|-------|--------|
| **Priority** | High |
| **Effort** | Small (2–3 hours) |
| **Risk** | Very low |
| **Dependencies** | Phase 2 (all actions exist) |

**Implementation Steps:**

1. **Define shortcut map** (30 min)
   - `H` = Hit, `S` = Stand, `D` = Double, `P` = Split, `I` = Insurance, `R` = Surrender
   - `Space` = Deal / New Round
   - `1` = $10, `2` = $25, `3` = $50, `4` = $100
   - `Esc` = Clear bet
   - `M` = Toggle mute

2. **Implement key listener** (1 hr)
   - `src/hooks/useKeyboardShortcuts.ts`
   - Global `keydown` listener
   - Only active shortcuts for current game state (e.g., `H` does nothing during betting)
   - Ignore when input/textarea is focused

3. **Add tooltip hints** (1 hr)
   - Show shortcut key on button tooltips (e.g., "Hit (H)")
   - Optional: small key badge on buttons
   - Hide on touch devices

**Acceptance Criteria:**
- [ ] All shortcuts work correctly per game state
- [ ] Shortcuts are discoverable via tooltips
- [ ] No shortcuts fire when typing in inputs
- [ ] Touch devices don't show shortcut hints

---

### Enhancement 23: Screen Reader Accessibility

| Field | Detail |
|-------|--------|
| **Priority** | High |
| **Effort** | Medium (6–10 hours) |
| **Risk** | Low |
| **Dependencies** | Phase 2 (all actions and states exist) |

**Implementation Steps:**

1. **Add ARIA live regions** (2 hrs)
   - `aria-live="polite"` for game messages (results, scores, available actions)
   - `aria-live="assertive"` for critical announcements (bust, blackjack)
   - Screen reader announces: "You were dealt Ace of Spades and King of Hearts. Score: 21. Blackjack!"

2. **Label all interactive elements** (2 hrs)
   - `aria-label` on all buttons: "Hit — draw another card", "Stand — end your turn"
   - Chip buttons: "Bet $25 — current bet is $50, bankroll $950"
   - Card images: `alt` text like "Ace of Spades"
   - Score displays: proper `aria-label`

3. **Focus management** (2 hrs)
   - After deal: focus moves to first action button (Hit)
   - After result: focus moves to New Round button
   - Modal dialogs (insurance, settings) trap focus
   - Logical tab order through all controls

4. **Semantic HTML audit** (1.5 hrs)
   - Ensure proper heading hierarchy
   - Use `<main>`, `<nav>`, `<section>` landmarks
   - Cards use `<figure>` and `<figcaption>` where appropriate
   - Game area has `role="application"` or `role="region"` with label

5. **Test with screen reader** (1.5 hrs)
   - Test with VoiceOver (macOS) and NVDA (Windows)
   - Verify all game actions are navigable and announced
   - Fix any gaps

**Acceptance Criteria:**
- [ ] All game events are announced by screen readers
- [ ] All interactive elements are labeled
- [ ] Focus management is logical and predictable
- [ ] Lighthouse Accessibility score ≥ 95

---

### Enhancement 24: Tutorial / How-to-Play Overlay

| Field | Detail |
|-------|--------|
| **Priority** | Medium |
| **Effort** | Medium (4–8 hours) |
| **Risk** | Low |
| **Dependencies** | Phase 2 |

**Implementation Steps:**

1. **Design tutorial content** (1 hr)
   - Pages/sections:
     1. Welcome & game objective
     2. Card values and scoring
     3. How to bet (chip buttons, clear, deal)
     4. Player actions (hit, stand, double, split, surrender, insurance)
     5. Keyboard shortcuts
     6. Where to find stats and settings

2. **Build overlay component** (2 hrs)
   - `src/components/Tutorial.tsx`
   - Multi-step paginated overlay with next/prev/skip
   - Visual illustrations (use existing card components for examples)

3. **First-visit trigger** (1 hr)
   - Show automatically on first visit (check localStorage flag)
   - "Don't show again" checkbox
   - Also accessible from `?` help button in header

4. **Persist dismissal** (30 min)
   - Store "tutorial_dismissed" in localStorage

5. **Accessibility** (1 hr)
   - Focus trap within tutorial modal
   - Screen reader friendly navigation
   - `Esc` to dismiss

**Acceptance Criteria:**
- [ ] Tutorial shows on first visit
- [ ] "Don't show again" prevents future auto-show
- [ ] Help button opens tutorial at any time
- [ ] Content covers all game features
- [ ] Accessible navigation

---

### Enhancement 25: Responsive Layout Overhaul

| Field | Detail |
|-------|--------|
| **Priority** | Medium |
| **Effort** | Medium (6–10 hours) |
| **Risk** | Medium — risk of regressions across breakpoints |
| **Dependencies** | Phase 2 (split hands need responsive treatment) |

**Implementation Steps:**

1. **Audit current layout** (1 hr)
   - Test on: iPhone SE (375×667), iPhone 14 (390×844), iPad (768×1024), iPad Pro (1024×1366), Desktop (1440×900, 1920×1080)
   - Document all layout issues

2. **Mobile redesign** (3 hrs)
   - Full-width hand areas (cards scroll horizontally if many)
   - Bottom-anchored action bar (thumb-friendly)
   - Touch targets ≥ 44px
   - Larger text for scores and bets
   - Swipe between split hands

3. **Tablet optimization** (2 hrs)
   - Two-column layout where appropriate
   - Optimal card sizing
   - Side panels for stats/settings

4. **Desktop refinement** (1.5 hrs)
   - Max-width container for ultra-wide screens
   - Spacious card layout
   - Hover effects only on pointer devices (`@media (hover: hover)`)

5. **Testing** (1.5 hrs)
   - Chrome DevTools device simulation
   - Physical device testing if possible
   - Cross-browser (Chrome, Safari, Firefox)

**Acceptance Criteria:**
- [ ] No horizontal overflow on any device
- [ ] Touch targets ≥ 44px on mobile
- [ ] Split hands navigable on mobile (swipe)
- [ ] Looks good on iPhone SE through 4K desktop
- [ ] No hover-only interactions on touch devices

---

### Enhancement 26: PWA / Installable App

| Field | Detail |
|-------|--------|
| **Priority** | Medium |
| **Effort** | Medium (4–8 hours) |
| **Risk** | Low |
| **Dependencies** | Phase 4 (assets to cache) |

**Implementation Steps:**

1. **Create manifest.json** (1 hr)
   - App name, short name, description, theme color, background color
   - Icons: 192×192 and 512×512 PNG (design app icon with playing card motif)
   - Display: standalone
   - Start URL: /

2. **Implement service worker** (2 hrs)
   - Use Workbox (Vite plugin: `vite-plugin-pwa`)
   - Cache strategies:
     - App shell: cache-first
     - Audio assets: cache-first (lazy)
     - Images/SVGs: cache-first
   - Offline fallback: serve cached app shell

3. **Add install prompt** (1.5 hrs)
   - Listen for `beforeinstallprompt` event
   - Show subtle "Install" button in header/footer
   - Track install conversions in stats

4. **Offline mode** (1.5 hrs)
   - All game logic is client-side — should work offline by default
   - Ensure all assets are cached
   - Show offline indicator if desired

5. **Test** (1 hr)
   - Lighthouse PWA audit
   - Test "Add to Home Screen" on iOS and Android
   - Verify offline play works

**Acceptance Criteria:**
- [ ] App is installable on mobile and desktop
- [ ] Lighthouse PWA score passes
- [ ] Game works fully offline
- [ ] Install prompt appears on eligible browsers
- [ ] App icons display correctly

---

### Phase 5 Milestone Checklist

- [ ] Full keyboard control of all game actions
- [ ] Screen reader accessibility (Lighthouse ≥ 95)
- [ ] Tutorial overlay for new players
- [ ] Responsive layout from iPhone SE to 4K
- [ ] PWA installable with offline support
- [ ] All features work on touch and pointer devices

---

## Phase 6 — Advanced & Stretch Features (Enhancements 27–30)

**Goal:** Educational tools and social play that differentiate the game.
**Duration:** ~3 weeks
**Dependency:** Phases 1–3, particularly the state machine, full action set, and shoe system.

---

### Enhancement 27: Basic Strategy Trainer Mode

| Field | Detail |
|-------|--------|
| **Priority** | Medium |
| **Effort** | Large (15–20 hours) |
| **Risk** | Medium — strategy data complexity |
| **Dependencies** | Enhancements 6, 7, 8, 9 (all actions must exist) |

**Implementation Steps:**

1. **Encode basic strategy chart** (3 hrs)
   - `src/data/basicStrategy.ts`
   - Complete strategy matrix: player hand vs. dealer upcard → optimal action
   - Hard totals (5–21), soft totals (A,2 through A,9), pairs (2,2 through A,A)
   - Actions: Hit, Stand, Double, Split, Surrender
   - Variant for H17 vs S17 dealer rules

2. **Build trainer overlay** (4 hrs)
   - Toggle: "Strategy Trainer" mode on/off in settings
   - After player acts, show overlay:
     - Green highlight if player chose optimally
     - Red highlight + correct answer if player made a mistake
   - Show reasoning (e.g., "With 16 vs. dealer 10, you should Hit")

3. **Strategy chart reference** (3 hrs)
   - Viewable strategy chart (color-coded grid)
   - Accessible from help menu
   - Highlights current hand situation on the chart

4. **Accuracy tracking** (2 hrs)
   - Track: total decisions, optimal decisions, accuracy %
   - Per-situation accuracy (where does the player deviate most?)
   - Display in stats panel

5. **Persist trainer data** (1 hr)
   - Save accuracy stats to localStorage

6. **Write tests** (3 hrs)
   - Strategy lookup returns correct action for all hand/upcard combos
   - Accuracy tracking is correct
   - Edge cases: blackjack (no action needed), split with double-after-split disabled

**Acceptance Criteria:**
- [ ] Trainer mode toggleable
- [ ] Color-coded feedback after each player action
- [ ] Reference chart viewable
- [ ] Accuracy tracking with per-situation breakdown
- [ ] Strategy is correct for standard rules

---

### Enhancement 28: Card Counting Practice Mode

| Field | Detail |
|-------|--------|
| **Priority** | Medium |
| **Effort** | Medium (6–10 hours) |
| **Risk** | Low |
| **Dependencies** | Enhancement 10 (multi-deck shoe) |

**Implementation Steps:**

1. **Implement Hi-Lo count system** (2 hrs)
   - `src/utils/counting.ts`
   - Running count: +1 for 2-6, 0 for 7-9, -1 for 10-A
   - True count: running count / decks remaining
   - Update count as each card is revealed

2. **Count display overlay** (2 hrs)
   - Toggle: "Card Counting Practice" mode
   - Show/hide running count and true count
   - Position: small floating badge on table

3. **Self-testing mode** (2 hrs)
   - Hide the count, let player track mentally
   - After each hand, player inputs their count
   - Compare with actual count, show accuracy
   - Track accuracy over time

4. **Educational overlay** (1.5 hrs)
   - Explain Hi-Lo system
   - Show card values during play (highlight each dealt card's count value)
   - Link to strategy adjustments based on count

5. **Persist settings and accuracy** (30 min)
   - Save practice mode preferences and accuracy data

**Acceptance Criteria:**
- [ ] Hi-Lo count is correctly calculated
- [ ] Running and true count displayed (togglable)
- [ ] Self-test mode tracks accuracy
- [ ] Educational content explains the system
- [ ] Count resets on shoe shuffle

---

### Enhancement 29: Side Bets (21+3 & Perfect Pairs)

| Field | Detail |
|-------|--------|
| **Priority** | Low |
| **Effort** | Large (12–18 hours) |
| **Risk** | Medium |
| **Dependencies** | Enhancement 7 (pair detection from split logic) |

**Implementation Steps:**

1. **Define payout tables** (1 hr)
   - **Perfect Pairs:**
     - Perfect Pair (same rank + same suit): 25:1
     - Colored Pair (same rank + same color): 12:1
     - Mixed Pair (same rank, different color): 6:1
   - **21+3** (player's 2 cards + dealer upcard):
     - Suited Three of a Kind: 100:1
     - Straight Flush: 40:1
     - Three of a Kind: 30:1
     - Straight: 10:1
     - Flush: 5:1

2. **Build side bet UI** (3 hrs)
   - Side bet area on table (separate from main bet)
   - Toggle each side bet on/off
   - Separate chip placement for side bets
   - Min/max limits

3. **Implement evaluation logic** (4 hrs)
   - `src/utils/sideBets.ts`
   - Evaluate Perfect Pairs after player's initial 2 cards
   - Evaluate 21+3 after dealer upcard is visible
   - Calculate payouts

4. **Integrate with game flow** (3 hrs)
   - Side bets placed during betting phase
   - Resolved after initial deal (before player actions)
   - Results shown with main game results
   - Side bet wins/losses tracked in stats

5. **Write tests** (3 hrs)
   - All hand combinations evaluated correctly
   - Payouts are accurate
   - Side bets don't interfere with main game

**Acceptance Criteria:**
- [ ] Both side bet types available
- [ ] Correct payout calculations
- [ ] Side bet results shown clearly
- [ ] Stats tracking for side bets
- [ ] Side bets are optional (togglable)

---

### Enhancement 30: Multiplayer (Local Hot-Seat)

| Field | Detail |
|-------|--------|
| **Priority** | Low |
| **Effort** | Large (18–25 hours) |
| **Risk** | High — most significant architectural change |
| **Dependencies** | Enhancements 1, 3, 7 (clean architecture + state machine + split) |

**Implementation Steps:**

1. **Extend state for multiple players** (5 hrs)
   - `players: Player[]` with 2–4 player slots
   - Each player: name, bankroll, hand(s), bet, stats
   - `activePlayerIndex` tracks whose turn it is
   - Shared dealer hand

2. **Player setup screen** (2 hrs)
   - Pre-game screen: add 2–4 players, set names
   - Each player gets their own bankroll ($1,000 default)

3. **Turn-based flow** (5 hrs)
   - Betting phase: each player places bet in sequence
   - Playing phase: each player acts in sequence
   - Visual indicator for active player (highlight, banner)
   - Auto-advance to next player on stand/bust

4. **UI layout for multiple players** (4 hrs)
   - Each player's hand area labeled with name
   - Horizontal arrangement on desktop, vertical on mobile
   - Active player area highlighted, others dimmed
   - Per-player score and bet display

5. **Shared resolution** (3 hrs)
   - Dealer plays once against all hands
   - Per-player results displayed simultaneously
   - Per-player bankroll updates

6. **Per-player stats** (2 hrs)
   - Individual win/loss tracking
   - Leaderboard comparison view

7. **Write tests** (3 hrs)
   - Turn rotation works correctly
   - Each player's bet/hand is independent
   - Dealer resolves against all hands
   - Edge cases: all players bust, mixed results

**Acceptance Criteria:**
- [ ] 2–4 players supported
- [ ] Turn-based betting and play
- [ ] Visual clarity on whose turn it is
- [ ] Each player has independent bankroll and stats
- [ ] Dealer resolves against all players simultaneously
- [ ] Works on mobile layout

---

### Phase 6 Milestone Checklist

- [ ] Basic strategy trainer with accuracy tracking
- [ ] Card counting practice with self-test mode
- [ ] Two side bet types with correct payouts
- [ ] 2–4 player local multiplayer
- [ ] All advanced features are togglable
- [ ] All features tested and documented

---

## Dependency Graph

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          DEPENDENCY GRAPH                              │
│                                                                        │
│  Phase 1 (Foundation)                                                  │
│  ┌───┐   ┌───┐   ┌───┐   ┌───┐   ┌───┐                             │
│  │ 1 │──→│ 2 │──→│ALL│   │ 1 │──→│ 3 │──→ 6, 7, 8, 9              │
│  │Ref│   │Cfg│   │   │   │Ref│   │FSM│                              │
│  └───┘   └───┘   └───┘   └───┘   └───┘                              │
│    │                        │                                          │
│    ├────────────────────────┤                                          │
│    ▼                        ▼                                          │
│  ┌───┐                    ┌───┐                                       │
│  │ 4 │ Tests              │ 5 │ TypeScript                            │
│  └───┘                    └───┘                                       │
│                                                                        │
│  Phase 2 (Gameplay)                                                    │
│  ┌───┐   ┌───┐   ┌───┐   ┌───┐   ┌───┐   ┌───┐                    │
│  │ 6 │──→│ 7 │   │ 8 │   │ 9 │   │10 │──→│28 │                    │
│  │Dbl│   │Spl│   │Ins│   │Sur│   │Sho│   │Cnt│                    │
│  └───┘   └─┬─┘   └───┘   └───┘   └───┘   └───┘                    │
│            │                                                          │
│            ▼                                                          │
│          ┌───┐                                                        │
│          │29 │ Side Bets                                              │
│          └───┘                                                        │
│                                                                        │
│  Phase 3 (Persistence)                                                │
│  ┌───┐──→┌───┐                                                       │
│  │12 │   │13 │ Stats                                                 │
│  │Per│   │14 │ History                                               │
│  │   │   │15 │ Achievements                                          │
│  └───┘   └───┘                                                       │
│                                                                        │
│  Phase 4–6: Mostly independent, can be parallelized                  │
│  16 (Sound) — independent                                             │
│  17–19 (Animations) — best after Phase 2                              │
│  20–21 (Visual) — independent quick wins                              │
│  22 (Keyboard) — after Phase 2                                        │
│  23 (A11y) — after Phase 2                                            │
│  27 (Strategy) — after 6, 7, 8, 9                                    │
│  30 (Multiplayer) — after 1, 3, 7                                    │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Quick Wins

These can be implemented at any time as palette-cleansers between larger tasks:

| # | Enhancement | Effort | Notes |
|---|-------------|--------|-------|
| 9 | Surrender | 1–2 hrs | Simplest gameplay addition |
| 20 | Card Back Design | 2–3 hrs | Pure visual, no logic |
| 21 | Table Felt Customization | 1–2 hrs | CSS variable swap |
| 22 | Keyboard Shortcuts | 2–3 hrs | Event listener + tooltips |

---

## Risk Register & Mitigation

| # | Risk | Impact | Likelihood | Mitigation |
|---|------|--------|------------|------------|
| 1 | **Split logic complexity** — multiple active hands, re-splits, aces-only-one-card | High | High | TDD approach: write tests first. Implement behind feature flag. Incremental delivery (basic split → re-split → aces rule). |
| 2 | **Audio autoplay policies** — browsers block audio before user interaction | Medium | High | Require first click/tap to initialize AudioContext. Use silent audio unlock pattern. |
| 3 | **localStorage corruption** — bad data crashes app on load | High | Medium | Schema versioning. Try/catch on all reads. Validate before use. "Reset All" escape hatch. |
| 4 | **TypeScript migration breaks working code** — type errors or subtle behavior changes | Medium | Medium | Migrate incrementally per-file. Run `tsc --noEmit` before merging. Keep renames in dedicated commits. |
| 5 | **Animation jank on low-end mobile** — dropped frames, janky feel | Medium | Medium | Only animate `transform`/`opacity` (GPU-composited). Test with throttled CPU. Provide `prefers-reduced-motion` fallback. |
| 6 | **Multiplayer state explosion** — 4 players × split hands × side bets = complex state | High | Medium | Build on solid Phase 1 architecture. Limit initial multiplayer to core actions only. Add features incrementally. |
| 7 | **Bundle size bloat** — audio files, SVGs, charts add weight | Medium | Low | Lazy-load audio and chart code. Compress assets. Monitor with `vite-plugin-visualizer`. Budget: <200KB gzipped. |
| 8 | **Scope creep within enhancements** — each feature grows beyond estimate | Medium | High | Time-box each enhancement. Ship MVP of each feature, polish later. |

---

## Success Metrics

| Metric | Target | Measured By |
|--------|--------|-------------|
| Unit test coverage (utilities) | ≥ 90% | Vitest coverage report |
| Unit test coverage (overall) | ≥ 70% | Vitest coverage report |
| Lighthouse Performance | ≥ 90 | Chrome DevTools audit |
| Lighthouse Accessibility | ≥ 95 | Chrome DevTools audit |
| Lighthouse PWA | Pass | Chrome DevTools audit |
| Bundle size (gzipped) | < 200 KB | Vite build output |
| Time to interactive | < 2 seconds | Lighthouse / WebPageTest |
| All 30 enhancements shipped | 100% | This checklist |
| Zero critical bugs | 0 P0 bugs | Manual testing + automated tests |

---

## Appendix: File Impact Map

Estimated files created or modified per enhancement:

| # | Enhancement | New Files | Modified Files |
|---|-------------|-----------|----------------|
| 1 | Refactor | ~10 new components/utils | App.jsx, main.jsx |
| 2 | Config System | 2 (defaults.ts, context) | main.tsx, all consumers |
| 3 | State Machine | 1 (gameReducer.ts) | useGameEngine.ts |
| 4 | Tests | ~5 test files | package.json, vite config |
| 5 | TypeScript | 1 (types.ts, tsconfig) | All .jsx → .tsx |
| 6 | Double Down | 0 | gameReducer, ActionControls, useGameEngine |
| 7 | Split Pairs | 1 (SplitHand component) | gameReducer, PlayerHand, useGameEngine, types |
| 8 | Insurance | 1 (InsurancePrompt) | gameReducer, useGameEngine |
| 9 | Surrender | 0 | gameReducer, ActionControls |
| 10 | Multi-Deck Shoe | 1 (ShoeIndicator) | deck.ts, useGameEngine |
| 11 | House Rules | 1 (SettingsPanel) | GameSettingsContext, useGameEngine |
| 12 | Persistence | 1 (storage.ts) | useGameEngine, main |
| 13 | Stats Dashboard | 2 (StatsPanel, statistics.ts) | storage, useGameEngine |
| 14 | Hand History | 1 (HandHistory) | storage, useGameEngine |
| 15 | Achievements | 2 (achievements.ts, AchievementToast) | storage, useGameEngine |
| 16 | Sound Effects | 2 (audio.ts, sound files dir) | useGameEngine, components |
| 17 | Deal Animations | 0 | Card.tsx, DealerHand, PlayerHand, CSS |
| 18 | Chip Animation | 1 (ChipStack overhaul) | BettingControls, CSS |
| 19 | Celebrations | 1 (CelebrationEffects) | App.tsx |
| 20 | Card Backs | 0 | Card.tsx, SettingsPanel |
| 21 | Table Felt | 0 | SettingsPanel, index.css |
| 22 | Keyboard | 1 (useKeyboardShortcuts) | ActionControls, BettingControls |
| 23 | Accessibility | 0 | All components (ARIA attrs) |
| 24 | Tutorial | 1 (Tutorial) | App.tsx |
| 25 | Responsive | 0 | All CSS files |
| 26 | PWA | 3 (manifest, sw, icons) | index.html, vite config |
| 27 | Strategy | 2 (basicStrategy.ts, StrategyOverlay) | useGameEngine, StatsPanel |
| 28 | Card Counting | 2 (counting.ts, CountOverlay) | useGameEngine |
| 29 | Side Bets | 2 (sideBets.ts, SideBetUI) | BettingControls, gameReducer |
| 30 | Multiplayer | 3 (PlayerSetup, PlayerArea, Leaderboard) | gameReducer, App, most components |

**Total estimated new files:** ~45
**Total estimated modified files:** Touches nearly every existing file by Phase 6 completion.

---

## Implementation Timeline (Visual)

```
Week  1  2  3  4  5  6  7  8  9  10 11 12 13 14
      ├──┴──┤                                        Phase 1: Foundation
            ├──┴──┴──┤                               Phase 2: Gameplay
                     ├──┴──┤                          Phase 3: Persistence
                           ├──┴──┤                    Phase 4: Polish
                                 ├──┴──┤              Phase 5: UX/A11y
                                       ├──┴──┴──┤     Phase 6: Advanced

  ▸ Quick wins (9, 20, 21, 22) can be sprinkled in anywhere as breaks
  ▸ Timeline assumes ~20 hrs/week solo developer
  ▸ Phases 4–5 can overlap if multiple contributors
```

---

*This plan is a living document. Update it as enhancements are completed or requirements evolve.*
