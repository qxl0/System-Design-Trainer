import type { SelfRating } from '@/types'

interface Sm2Input {
  interval: number
  easeFactor: number
}

interface Sm2Result {
  interval: number
  easeFactor: number
  nextReviewAt: string
}

export function applySm2(current: Sm2Input, rating: SelfRating): Sm2Result {
  const q = rating === 'Easy' ? 5 : 2
  const newEaseFactor = Math.max(
    1.3,
    current.easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  )

  let newInterval: number
  if (current.interval <= 1) {
    newInterval = rating === 'Easy' ? 3 : 1
  } else {
    newInterval = Math.round(current.interval * newEaseFactor)
  }

  const nextReviewAt = new Date(
    Date.now() + newInterval * 24 * 60 * 60 * 1000
  ).toISOString()

  return { interval: newInterval, easeFactor: newEaseFactor, nextReviewAt }
}
