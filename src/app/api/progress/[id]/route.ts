import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { applySm2 } from '@/lib/sm2'
import type { SelfRating } from '@/types'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json() as { rating: SelfRating; score: number }

  const current = await prisma.progress.findUnique({ where: { id } })

  if (!current) {
    return NextResponse.json({ error: 'Progress record not found' }, { status: 404 })
  }

  const { interval, easeFactor, nextReviewAt } = applySm2(
    { interval: current.interval, easeFactor: current.easeFactor },
    body.rating
  )

  const updated = await prisma.progress.update({
    where: { id },
    data: { interval, easeFactor, nextReviewAt: new Date(nextReviewAt), lastScore: body.score },
  })

  return NextResponse.json({
    id: updated.id,
    interval: updated.interval,
    easeFactor: updated.easeFactor,
    nextReviewAt: updated.nextReviewAt.toISOString(),
    lastScore: updated.lastScore,
  })
}
