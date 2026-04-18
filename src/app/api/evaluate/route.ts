import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { evaluateAnswer } from '@/lib/openai'

export async function POST(request: NextRequest) {
  const body = await request.json() as { questionId: string; answer: string }

  if (!body.questionId || !body.answer) {
    return NextResponse.json({ error: 'questionId and answer required' }, { status: 400 })
  }

  const question = await prisma.question.findUnique({
    where: { id: body.questionId },
  })

  if (!question) {
    return NextResponse.json({ error: 'Question not found' }, { status: 404 })
  }

  const feedback = await evaluateAnswer({
    question: question.title + '\n' + question.prompt,
    modelAnswer: question.modelAnswer,
    userAnswer: body.answer,
  })

  return NextResponse.json(feedback)
}
