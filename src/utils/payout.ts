import { BLACKJACK_PAYOUT_RATIO } from '../constants'

export function getBlackjackPayout(bet: number): number {
  return bet + Math.floor(bet * BLACKJACK_PAYOUT_RATIO)
}

export function getWinPayout(bet: number): number {
  return bet * 2
}

export function getPushPayout(bet: number): number {
  return bet
}
