import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { applySm2 } from '@/lib/sm2'

export async function GET() {
  const records = await prisma.progress.findMany({
    include: { question: { select: { title: true, category: true } } },
  })

  return NextResponse.json(
    records.map((p) => ({
      id: p.id,
      questionId: p.questionId,
      questionTitle: p.question.title,
      category: p.question.category,
      interval: p.interval,
      easeFactor: p.easeFactor,
      nextReviewAt: p.nextReviewAt.toISOString(),
      lastScore: p.lastScore,
      updatedAt: p.updatedAt.toISOString(),
    }))
  )
}

export async function POST(request: NextRequest) {
  const body = await request.json() as { questionId: string; rating: 'Easy' | 'Hard'; score: number }
  const { interval, easeFactor, nextReviewAt } = applySm2({ interval: 1, easeFactor: 2.5 }, body.rating)

  const progress = await prisma.progress.upsert({
    where: { questionId: body.questionId },
    create: {
      questionId: body.questionId,
      interval,
      easeFactor,
      nextReviewAt: new Date(nextReviewAt),
      lastScore: body.score,
    },
    update: {
      interval,
      easeFactor,
      nextReviewAt: new Date(nextReviewAt),
      lastScore: body.score,
    },
  })

  return NextResponse.json({ id: progress.id }, { status: 201 })
}
