export function cardValue(card) {
  if (['J', 'Q', 'K'].includes(card.rank)) return 10
  if (card.rank === 'A') return 11
  return parseInt(card.rank)
}

export function calculateScore(hand) {
  let score = hand.reduce((sum, card) => sum + cardValue(card), 0)
  let aces = hand.filter(c => c.rank === 'A').length
  while (score > 21 && aces > 0) {
    score -= 10
    aces--
  }
  return score
}

export function isBlackjack(hand) {
  return hand.length === 2 && calculateScore(hand) === 21
}
