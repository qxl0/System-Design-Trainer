'use client'

import { useState, useEffect } from 'react'
import { FilterBar } from '@/components/FilterBar'
import { QuestionRow } from '@/components/QuestionRow'
import type { QuestionWithStatus } from '@/types'

export default function HomePage() {
  const [questions, setQuestions] = useState<QuestionWithStatus[]>([])
  const [difficulty, setDifficulty] = useState('All')
  const [category, setCategory] = useState('All')
  const [status, setStatus] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const params = new URLSearchParams()
    if (difficulty !== 'All') params.set('difficulty', difficulty)
    if (category !== 'All') params.set('category', category)

    setLoading(true)
    fetch(`/api/questions?${params}`)
      .then((r) => r.json())
      .then((data: QuestionWithStatus[]) => {
        setQuestions(data)
        setLoading(false)
      })
  }, [difficulty, category])

  const filtered = questions.filter((q) => {
    if (status === 'All') return true
    if (status === 'Not Started') return q.status === 'not_started'
    if (status === 'Done') return q.status === 'done'
    if (status === 'Due Today') return q.status === 'due'
    return true
  })

  const dueCount = questions.filter((q) => q.status === 'due').length

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-100">System Design Practice</h1>
        {dueCount > 0 && (
          <span className="bg-red-900 text-red-300 px-3 py-1 rounded-full text-sm font-medium">
            📅 {dueCount} due for review
          </span>
        )}
      </div>

      <FilterBar
        difficulty={difficulty}
        category={category}
        status={status}
        onDifficultyChange={setDifficulty}
        onCategoryChange={setCategory}
        onStatusChange={setStatus}
      />

      {loading ? (
        <div className="text-gray-400 py-12 text-center">Loading questions...</div>
      ) : (
        <table className="w-full">
          <tbody>
            {filtered.map((q) => (
              <QuestionRow key={q.id} question={q} />
            ))}
          </tbody>
        </table>
      )}

      {!loading && filtered.length === 0 && (
        <p className="text-gray-400 py-8 text-center">No questions match your filters.</p>
      )}
    </main>
  )
}
