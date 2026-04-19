'use client'

import { DIFFICULTIES, QUESTION_CATEGORIES } from '@/types'

type Difficulty = 'All' | (typeof DIFFICULTIES)[number]
type Category = 'All' | (typeof QUESTION_CATEGORIES)[number]
type StatusFilter = 'All' | 'Not Started' | 'Done' | 'Due Today'

interface FilterBarProps {
  difficulty: string
  category: string
  status: string
  searchQuery: string
  selectedTag: string
  availableTags: string[]
  onDifficultyChange: (v: string) => void
  onCategoryChange: (v: string) => void
  onStatusChange: (v: string) => void
  onSearchQueryChange: (v: string) => void
  onSelectedTagChange: (v: string) => void
}

const difficulties: Difficulty[] = ['All', ...DIFFICULTIES]
const categories: Category[] = ['All', ...QUESTION_CATEGORIES]
const statuses: StatusFilter[] = ['All', 'Not Started', 'Done', 'Due Today']

const difficultyColor: Record<string, string> = {
  Easy: 'text-green-400',
  Medium: 'text-yellow-400',
  Hard: 'text-red-400',
  All: 'text-gray-300',
}

export function FilterBar({
  difficulty,
  category,
  status,
  searchQuery,
  selectedTag,
  availableTags,
  onDifficultyChange,
  onCategoryChange,
  onStatusChange,
  onSearchQueryChange,
  onSelectedTagChange,
}: FilterBarProps) {
  return (
    <div className="mb-4 rounded-2xl border border-gray-800 bg-gray-900/80 p-4">
      <div className="flex flex-wrap gap-2">
        {difficulties.map((d) => (
          <button
            key={d}
            onClick={() => onDifficultyChange(d)}
            className={`px-3 py-1 rounded text-sm font-medium border transition-colors ${
              difficulty === d
                ? 'ring-2 ring-offset-1 ring-blue-400 bg-gray-700 border-blue-400'
                : 'bg-gray-800 border-gray-600 hover:bg-gray-700'
            } ${difficultyColor[d]}`}
          >
            {d}
          </button>
        ))}
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))]">
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          placeholder="Search titles, prompts, and tags"
          className="w-full rounded border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-200 placeholder:text-gray-500"
        />
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="rounded border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-300"
        >
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={selectedTag}
          onChange={(e) => onSelectedTagChange(e.target.value)}
          className="rounded border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-300"
        >
          <option value="All">All tags</option>
          {availableTags.map((tag) => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="rounded border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-300"
        >
          {statuses.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
