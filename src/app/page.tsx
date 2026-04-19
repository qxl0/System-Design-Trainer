'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FilterBar } from '@/components/FilterBar'
import { QuestionRow } from '@/components/QuestionRow'
import { QUESTION_CATEGORIES } from '@/types'
import type { QuestionWithStatus } from '@/types'

export default function HomePage() {
  const [questions, setQuestions] = useState<QuestionWithStatus[]>([])
  const [difficulty, setDifficulty] = useState('All')
  const [category, setCategory] = useState('All')
  const [status, setStatus] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch('/api/questions')
      .then((r) => r.json())
      .then((data: QuestionWithStatus[]) => {
        setQuestions(data)
        setLoading(false)
      })
  }, [])

  const availableTags = Array.from(new Set(questions.flatMap((q) => q.tags))).sort((a, b) =>
    a.localeCompare(b)
  )

  const normalizedQuery = searchQuery.trim().toLowerCase()

  const filtered = questions.filter((q) => {
    if (difficulty !== 'All' && q.difficulty !== difficulty) return false
    if (category !== 'All' && q.category !== category) return false
    if (status === 'Not Started' && q.status !== 'not_started') return false
    if (status === 'Done' && q.status !== 'done') return false
    if (status === 'Due Today' && q.status !== 'due') return false
    if (selectedTag !== 'All' && !q.tags.includes(selectedTag)) return false
    if (
      normalizedQuery &&
      ![q.title, q.prompt, q.category, ...q.tags].some((value) =>
        value.toLowerCase().includes(normalizedQuery)
      )
    ) {
      return false
    }
    return true
  })

  const searchedAndScoped = questions.filter((q) => {
    if (difficulty !== 'All' && q.difficulty !== difficulty) return false
    if (
      normalizedQuery &&
      ![q.title, q.prompt, q.category, ...q.tags].some((value) =>
        value.toLowerCase().includes(normalizedQuery)
      )
    ) {
      return false
    }
    return true
  })

  const dueCount = questions.filter((q) => q.status === 'due').length
  const categoryCounts = QUESTION_CATEGORIES.map((name) => ({
    name,
    count: questions.filter((q) => q.category === name).length,
  })).filter((item) => item.count > 0)

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">System Design Practice</h1>
          <p className="mt-1 text-sm text-gray-400">
            {questions.length} questions across {categoryCounts.length} categories
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/references"
            className="rounded-full border border-gray-700 bg-gray-900 px-3 py-1 text-sm font-medium text-gray-300 transition-colors hover:border-blue-500 hover:text-blue-300"
          >
            Appendix & references
          </Link>
          {dueCount > 0 && (
            <span className="bg-red-900 text-red-300 px-3 py-1 rounded-full text-sm font-medium">
              📅 {dueCount} due for review
            </span>
          )}
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {categoryCounts.map(({ name, count }) => (
          <button
            key={name}
            onClick={() => setCategory(name)}
            className={`rounded-full border px-3 py-1 text-xs transition-colors ${
              category === name
                ? 'border-blue-400 bg-blue-950 text-blue-200'
                : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-500 hover:text-gray-200'
            }`}
          >
            {name} · {count}
          </button>
        ))}
      </div>

      <FilterBar
        difficulty={difficulty}
        category={category}
        status={status}
        searchQuery={searchQuery}
        selectedTag={selectedTag}
        availableTags={availableTags}
        onDifficultyChange={setDifficulty}
        onCategoryChange={setCategory}
        onStatusChange={setStatus}
        onSearchQueryChange={setSearchQuery}
        onSelectedTagChange={setSelectedTag}
      />

      {!loading && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-sm text-gray-400">
          <span>
            Showing {filtered.length} of {questions.length} questions
          </span>
          {selectedTag !== 'All' && (
            <button
              onClick={() => setSelectedTag('All')}
              className="rounded-full border border-gray-700 px-3 py-1 text-xs text-gray-300 hover:border-gray-500"
            >
              Clear tag: #{selectedTag}
            </button>
          )}
        </div>
      )}

      {!loading && selectedTag === 'All' && searchedAndScoped.length > 0 && (
        <div className="mb-6">
          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-gray-500">Popular tags</p>
          <div className="flex flex-wrap gap-2">
            {Array.from(new Set(searchedAndScoped.flatMap((q) => q.tags)))
              .sort((a, b) => a.localeCompare(b))
              .slice(0, 12)
              .map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className="rounded-full border border-gray-700 bg-gray-900 px-3 py-1 text-xs text-gray-300 hover:border-blue-400 hover:text-blue-300"
                >
                  #{tag}
                </button>
              ))}
          </div>
        </div>
      )}

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
