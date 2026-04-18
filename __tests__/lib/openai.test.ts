import { evaluateAnswer } from '@/lib/openai'

jest.mock('openai', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    score: 7,
                    strengths: ['Clear API design'],
                    gaps: ['Missing cache layer'],
                    tip: 'Always mention Redis for read-heavy systems',
                  }),
                },
              },
            ],
          }),
        },
      },
    })),
  }
})

describe('evaluateAnswer', () => {
  it('returns parsed AiFeedback from OpenAI', async () => {
    const result = await evaluateAnswer({
      question: 'Design a URL Shortener',
      modelAnswer: 'Use Base62 hash...',
      userAnswer: 'I would use a hash function...',
    })

    expect(result.score).toBe(7)
    expect(result.strengths).toEqual(['Clear API design'])
    expect(result.gaps).toEqual(['Missing cache layer'])
    expect(result.tip).toBe('Always mention Redis for read-heavy systems')
  })

  it('throws if OpenAI returns invalid JSON', async () => {
    const OpenAI = require('openai').default
    OpenAI.mockImplementationOnce(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [{ message: { content: 'not json' } }],
          }),
        },
      },
    }))

    await expect(
      evaluateAnswer({
        question: 'Design something',
        modelAnswer: 'Answer',
        userAnswer: 'My answer',
      })
    ).rejects.toThrow()
  })
})
