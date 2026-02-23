import { BLACKJACK_PAYOUT_RATIO } from '../constants'

export function getBlackjackPayout(bet) {
  return bet + Math.floor(bet * BLACKJACK_PAYOUT_RATIO)
}

export function getWinPayout(bet) {
  return bet * 2
}

export function getPushPayout(bet) {
  return bet
}
