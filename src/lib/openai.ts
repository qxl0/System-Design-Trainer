import OpenAI from 'openai'
import type { AiFeedback } from '@/types'

interface EvaluateInput {
  question: string
  modelAnswer: string
  userAnswer: string
}

export async function evaluateAnswer(input: EvaluateInput): Promise<AiFeedback> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const systemPrompt = `You are a senior software engineer evaluating system design interview answers.
Evaluate based on: completeness, correctness, depth, and trade-off discussion.
Return ONLY valid JSON with this exact shape:
{"score": <1-10>, "strengths": [<strings>], "gaps": [<strings>], "tip": <string>}`

  const userPrompt = `Question: ${input.question}

Reference Answer: ${input.modelAnswer}

Candidate Answer: ${input.userAnswer}

Evaluate the candidate's answer against the reference.`

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    response_format: { type: 'json_object' },
  })

  const content = response.choices[0]?.message?.content
  if (!content) throw new Error('No content from OpenAI')

  const parsed = JSON.parse(content) as AiFeedback
  if (
    typeof parsed.score !== 'number' ||
    !Array.isArray(parsed.strengths) ||
    !Array.isArray(parsed.gaps) ||
    typeof parsed.tip !== 'string'
  ) {
    throw new Error('Invalid feedback shape from OpenAI')
  }

  return parsed
}
