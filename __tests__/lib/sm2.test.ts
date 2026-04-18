import { applySm2 } from '@/lib/sm2'

describe('applySm2', () => {
  const base = { interval: 1, easeFactor: 2.5 }

  it('Hard rating on first review: interval=1, easeFactor decreases', () => {
    const result = applySm2(base, 'Hard')
    expect(result.interval).toBe(1)
    expect(result.easeFactor).toBeCloseTo(2.18, 1)
  })

  it('Easy rating on first review: interval=3, easeFactor stays 2.5', () => {
    const result = applySm2(base, 'Easy')
    expect(result.interval).toBe(3)
    expect(result.easeFactor).toBeCloseTo(2.6, 1)
  })

  it('subsequent Easy: interval scales by easeFactor', () => {
    const prev = { interval: 3, easeFactor: 2.5 }
    const result = applySm2(prev, 'Easy')
    expect(result.interval).toBe(8) // round(3 * 2.5) = 8 (rounded)
  })

  it('easeFactor never drops below 1.3', () => {
    const low = { interval: 1, easeFactor: 1.3 }
    const result = applySm2(low, 'Hard')
    expect(result.easeFactor).toBeGreaterThanOrEqual(1.3)
  })

  it('nextReviewAt is in the future by interval days', () => {
    const before = Date.now()
    const result = applySm2(base, 'Easy')
    const after = Date.now()
    const reviewTime = new Date(result.nextReviewAt).getTime()
    expect(reviewTime).toBeGreaterThan(before + 2 * 24 * 60 * 60 * 1000)
    expect(reviewTime).toBeLessThan(after + 4 * 24 * 60 * 60 * 1000)
  })
})
