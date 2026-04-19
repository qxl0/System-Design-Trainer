'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import type { AiFeedback, Question } from '@/types'
import MarkdownContent from '@/components/MarkdownContent'

interface StoredFeedback {
  feedback: AiFeedback
  answer: string
  durationSecs: number
}

type QuestionWithProgress = Question & { progress: { id: string } | null }

export default function FeedbackPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [question, setQuestion] = useState<QuestionWithProgress | null>(null)
  const [stored, setStored] = useState<StoredFeedback | null>(null)
  const [rated, setRated] = useState(false)
  const [rating, setRating] = useState<'Easy' | 'Hard' | null>(null)

  useEffect(() => {
    const raw = sessionStorage.getItem(`feedback:${id}`)
    if (raw) setStored(JSON.parse(raw) as StoredFeedback)

    fetch(`/api/questions/${id}`)
      .then((r) => r.json())
      .then(setQuestion)
  }, [id])

  async function handleRating(r: 'Easy' | 'Hard') {
    if (!question || !stored) return
    setRating(r)

    if (question.progress) {
      await fetch(`/api/progress/${question.progress.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: r, score: stored.feedback.score }),
      })
    } else {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId: id, rating: r, score: stored.feedback.score }),
      })
    }

    setRated(true)
  }

  if (!stored || !question) {
    return <div className="text-gray-400 p-8 text-center">Loading...</div>
  }

  const { feedback } = stored
  const scoreColor = feedback.score >= 8 ? 'bg-green-500' : feedback.score >= 5 ? 'bg-yellow-500' : 'bg-red-500'

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-xl font-bold text-gray-100">{question.title} — Feedback</h1>

      <div className="flex items-center gap-4 p-4 bg-gray-800 rounded-xl border border-gray-700">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl font-black text-black ${scoreColor}`}>
          {feedback.score}
        </div>
        <div>
          <div className="font-semibold text-gray-100">Score: {feedback.score} / 10</div>
          <div className="text-sm text-gray-400">
            {feedback.score >= 8 ? 'Excellent — you nailed it!' : feedback.score >= 5 ? 'Good foundation, some gaps' : 'Needs more depth — review the model answer'}
          </div>
        </div>
      </div>

      {feedback.strengths.length > 0 && (
        <div className="bg-green-950 border-l-4 border-green-500 rounded-r-lg p-4">
          <div className="font-semibold text-green-400 mb-2">✅ Strengths</div>
          <ul className="space-y-1">
            {feedback.strengths.map((s, i) => (
              <li key={i} className="text-green-200 text-sm">{s}</li>
            ))}
          </ul>
        </div>
      )}

      {feedback.gaps.length > 0 && (
        <div className="bg-red-950 border-l-4 border-red-500 rounded-r-lg p-4">
          <div className="font-semibold text-red-400 mb-2">❌ Gaps</div>
          <ul className="space-y-1">
            {feedback.gaps.map((g, i) => (
              <li key={i} className="text-red-200 text-sm">{g}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-blue-950 border-l-4 border-blue-500 rounded-r-lg p-4">
        <div className="font-semibold text-blue-400 mb-1">💡 Tip</div>
        <p className="text-blue-200 text-sm">{feedback.tip}</p>
      </div>

      {!rated ? (
        <div className="p-4 bg-gray-800 rounded-xl border border-gray-700">
          <p className="text-gray-300 mb-3 font-medium">How did this feel?</p>
          <div className="flex gap-3">
            <button
              onClick={() => handleRating('Easy')}
              className="px-5 py-2 bg-green-700 hover:bg-green-600 text-white font-bold rounded-lg transition-colors"
            >
              😊 Easy
            </button>
            <button
              onClick={() => handleRating('Hard')}
              className="px-5 py-2 bg-red-700 hover:bg-red-600 text-white font-bold rounded-lg transition-colors"
            >
              😅 Hard
            </button>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-gray-800 rounded-lg text-sm text-gray-400">
          Marked as <strong className="text-gray-200">{rating}</strong> — next review scheduled.
        </div>
      )}

      {rated && (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h2 className="text-lg font-bold text-gray-100 mb-4">📖 Model Answer</h2>
          <MarkdownContent content={question.modelAnswer} className="space-y-4" />
        </div>
      )}

      {rated && (
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => router.push('/')}
            className="px-5 py-2 bg-purple-700 hover:bg-purple-600 text-white font-bold rounded-lg transition-colors"
          >
            Next Question →
          </button>
          <button
            onClick={() => router.push('/')}
            className="px-5 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
          >
            Home
          </button>
        </div>
      )}
    </main>
  )
}
