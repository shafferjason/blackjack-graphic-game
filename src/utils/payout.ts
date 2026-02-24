import { BLACKJACK_PAYOUT_RATIO } from '../constants'

export function getBlackjackPayout(bet: number, ratio: number = BLACKJACK_PAYOUT_RATIO): number {
  return bet + Math.floor(bet * ratio)
}

export function getWinPayout(bet: number): number {
  return bet * 2
}

export function getPushPayout(bet: number): number {
  return bet
}
