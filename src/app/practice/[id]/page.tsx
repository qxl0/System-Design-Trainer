'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Timer } from '@/components/Timer'
import type { Question } from '@/types'

const DEFAULT_MINUTES = 45

export default function PracticePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [question, setQuestion] = useState<Question | null>(null)
  const [answer, setAnswer] = useState('')
  const [minutes, setMinutes] = useState(DEFAULT_MINUTES)
  const [started, setStarted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const startTimeRef = useRef<number>(0)

  useEffect(() => {
    fetch(`/api/questions/${id}`)
      .then((r) => r.json())
      .then(setQuestion)
  }, [id])

  async function handleSubmit() {
    if (!question || !answer.trim()) return
    setSubmitting(true)

    const durationSecs = Math.floor((Date.now() - startTimeRef.current) / 1000)

    const evalRes = await fetch('/api/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId: id, answer }),
    })
    const feedback = await evalRes.json()

    await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        questionId: id,
        answer,
        aiFeedback: feedback,
        score: feedback.score,
        durationSecs,
      }),
    })

    sessionStorage.setItem(`feedback:${id}`, JSON.stringify({ feedback, answer, durationSecs }))
    router.push(`/practice/${id}/feedback`)
  }

  if (!question) {
    return <div className="text-gray-400 p-8 text-center">Loading...</div>
  }

  if (!started) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${
              question.difficulty === 'Hard' ? 'bg-red-900 text-red-300' :
              question.difficulty === 'Medium' ? 'bg-yellow-900 text-yellow-300' :
              'bg-green-900 text-green-300'
            }`}>{question.difficulty}</span>
            <span className="text-xs text-gray-400">{question.category}</span>
          </div>
          <h1 className="text-xl font-bold text-gray-100 mb-3">{question.title}</h1>
          <p className="text-gray-300 mb-6">{question.prompt}</p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-400">Timer (min):</label>
              <input
                type="number"
                value={minutes}
                onChange={(e) => setMinutes(Number(e.target.value))}
                className="w-16 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-gray-100 text-sm"
                min={5}
                max={120}
              />
            </div>
            <button
              onClick={() => { startTimeRef.current = Date.now(); setStarted(true) }}
              className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-colors"
            >
              ▶ Start
            </button>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
            >
              Skip
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold text-gray-100">{question.title}</h1>
        <Timer totalSeconds={minutes * 60} onExpire={handleSubmit} />
      </div>
      <p className="text-gray-400 text-sm mb-3">{question.prompt}</p>
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Write your system design here — describe components, data flow, trade-offs..."
        className="w-full h-96 bg-gray-900 border border-gray-700 rounded-lg p-4 text-gray-100 font-mono text-sm resize-none focus:outline-none focus:border-blue-500"
      />
      <div className="mt-4 flex gap-3">
        <button
          onClick={handleSubmit}
          disabled={submitting || !answer.trim()}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-lg transition-colors"
        >
          {submitting ? 'Evaluating...' : 'Submit for Review'}
        </button>
      </div>
    </main>
  )
}
