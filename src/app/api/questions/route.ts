import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const difficulty = searchParams.get('difficulty')
  const category = searchParams.get('category')

  const questions = await prisma.question.findMany({
    where: {
      ...(difficulty && difficulty !== 'All' ? { difficulty } : {}),
      ...(category && category !== 'All' ? { category } : {}),
    },
    include: { progress: true },
    orderBy: { createdAt: 'asc' },
  })

  const now = new Date()
  const result = questions.map((q) => ({
    id: q.id,
    title: q.title,
    prompt: q.prompt,
    difficulty: q.difficulty,
    category: q.category,
    tags: JSON.parse(q.tags) as string[],
    createdAt: q.createdAt.toISOString(),
    status: !q.progress
      ? 'not_started'
      : new Date(q.progress.nextReviewAt) <= now
        ? 'due'
        : 'done',
    nextReviewAt: q.progress?.nextReviewAt.toISOString(),
    lastScore: q.progress?.lastScore ?? null,
  }))

  return NextResponse.json(result)
}
