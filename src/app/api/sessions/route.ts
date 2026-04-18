import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { AiFeedback } from '@/types'

export async function POST(request: NextRequest) {
  const body = await request.json() as {
    questionId: string
    answer: string
    aiFeedback: AiFeedback
    score: number
    durationSecs: number
  }

  const session = await prisma.session.create({
    data: {
      questionId: body.questionId,
      answer: body.answer,
      aiFeedback: JSON.stringify(body.aiFeedback),
      score: body.score,
      durationSecs: body.durationSecs,
    },
  })

  return NextResponse.json({ id: session.id }, { status: 201 })
}
