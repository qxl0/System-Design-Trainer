import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { findSeedByTitle } from '@/lib/question-seed-lookup'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const question = await prisma.question.findUnique({
    where: { id },
    include: { progress: true },
  })

  if (!question) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const seed = findSeedByTitle(question.title)

  return NextResponse.json({
    id: question.id,
    title: question.title,
    prompt: question.prompt,
    difficulty: question.difficulty,
    category: question.category,
    tags: JSON.parse(question.tags) as string[],
    modelAnswer: question.modelAnswer,
    createdAt: question.createdAt.toISOString(),
    mermaidDiagram: seed?.mermaidDiagram,
    asciiDiagram: seed?.asciiDiagram,
    studyNotes: seed?.studyNotes,
    progress: question.progress
      ? {
          id: question.progress.id,
          interval: question.progress.interval,
          easeFactor: question.progress.easeFactor,
          nextReviewAt: question.progress.nextReviewAt.toISOString(),
          lastScore: question.progress.lastScore,
        }
      : null,
  })
}
