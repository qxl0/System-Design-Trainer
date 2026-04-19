import { findSeedByTitle } from '@/lib/question-seed-lookup'

describe('findSeedByTitle', () => {
  it('returns the correct seed for a known question title', () => {
    const seed = findSeedByTitle('Design a URL Shortener')
    expect(seed).toBeDefined()
    expect(seed?.title).toBe('Design a URL Shortener')
    expect(seed?.difficulty).toBe('Medium')
    expect(seed?.category).toBe('URL/ID')
  })

  it('returns undefined for an unknown title', () => {
    const seed = findSeedByTitle('This Question Does Not Exist')
    expect(seed).toBeUndefined()
  })

  it('match is exact and case-sensitive', () => {
    const lowerCase = findSeedByTitle('design a url shortener')
    expect(lowerCase).toBeUndefined()

    const upperCase = findSeedByTitle('DESIGN A URL SHORTENER')
    expect(upperCase).toBeUndefined()

    const exact = findSeedByTitle('Design a URL Shortener')
    expect(exact).toBeDefined()
  })
})
