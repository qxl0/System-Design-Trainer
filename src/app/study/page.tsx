'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import type { QuestionWithStatus } from '@/types'

const difficultyColors = {
  Easy: 'bg-green-900 text-green-300',
  Medium: 'bg-yellow-900 text-yellow-300',
  Hard: 'bg-red-900 text-red-300',
}

export default function StudyListPage() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') ?? ''
  const [questions, setQuestions] = useState<QuestionWithStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState(initialQuery)

  useEffect(() => {
    fetch('/api/questions')
      .then((r) => r.json())
      .then((data) => {
        setQuestions(data as QuestionWithStatus[])
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    setQuery(initialQuery)
  }, [initialQuery])

  if (loading) return <div className="text-gray-400 p-8 text-center">Loading...</div>

  const normalizedQuery = query.trim().toLowerCase()
  const filteredQuestions = questions.filter((q) => {
    if (!normalizedQuery) return true
    return [q.title, q.prompt, q.category, ...q.tags].some((value) =>
      value.toLowerCase().includes(normalizedQuery)
    )
  })

  const byCategory = filteredQuestions.reduce<Record<string, QuestionWithStatus[]>>((acc, q) => {
    if (!acc[q.category]) acc[q.category] = []
    acc[q.category].push(q)
    return acc
  }, {})

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-100">Study Reference</h1>
        <p className="text-gray-400 text-sm mt-1">
          Deep dives into each system design — architecture diagrams, key trade-offs, and notes from Alex Xu&apos;s System Design Interview Vol 1 &amp; 2.
        </p>
      </div>

      <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search study questions..."
          className="w-full rounded-lg border border-gray-700 bg-gray-950 px-4 py-3 text-sm text-gray-100 outline-none transition-colors placeholder:text-gray-500 focus:border-blue-500"
        />
        <div className="mt-3 text-xs text-gray-500">
          Showing {filteredQuestions.length} of {questions.length} questions
        </div>
      </div>

      {Object.entries(byCategory).map(([category, qs]) => (
        <div key={category}>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            {category}
          </h2>
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            {qs.map((q, i) => (
              <Link
                key={q.id}
                href={`/study/${q.id}`}
                className={`flex items-center justify-between px-5 py-3 hover:bg-gray-700 transition-colors ${
                  i < qs.length - 1 ? 'border-b border-gray-700' : ''
                }`}
              >
                <span className="text-gray-200 text-sm">{q.title}</span>
                <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${difficultyColors[q.difficulty]}`}>
                  {q.difficulty}
                </span>
              </Link>
            ))}
          </div>
        </div>
      ))}

      {filteredQuestions.length === 0 && (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-8 text-center text-sm text-gray-400">
          No study questions match your search.
        </div>
      )}
    </main>
  )
}
