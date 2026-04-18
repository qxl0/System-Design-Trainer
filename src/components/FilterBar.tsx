'use client'

type Difficulty = 'All' | 'Easy' | 'Medium' | 'Hard'
type Category = 'All' | 'Scalability' | 'Storage' | 'Caching' | 'Messaging' | 'Search' | 'Real-time' | 'Infrastructure' | 'URL/ID'
type StatusFilter = 'All' | 'Not Started' | 'Done' | 'Due Today'

interface FilterBarProps {
  difficulty: string
  category: string
  status: string
  onDifficultyChange: (v: string) => void
  onCategoryChange: (v: string) => void
  onStatusChange: (v: string) => void
}

const difficulties: Difficulty[] = ['All', 'Easy', 'Medium', 'Hard']
const categories: Category[] = ['All', 'Scalability', 'Storage', 'Caching', 'Messaging', 'Search', 'Real-time', 'Infrastructure', 'URL/ID']
const statuses: StatusFilter[] = ['All', 'Not Started', 'Done', 'Due Today']

const difficultyColor: Record<string, string> = {
  Easy: 'text-green-400',
  Medium: 'text-yellow-400',
  Hard: 'text-red-400',
  All: 'text-gray-300',
}

export function FilterBar({ difficulty, category, status, onDifficultyChange, onCategoryChange, onStatusChange }: FilterBarProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
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
      <select
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="px-3 py-1 rounded text-sm bg-gray-800 border border-gray-600 text-gray-300"
      >
        {categories.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        className="px-3 py-1 rounded text-sm bg-gray-800 border border-gray-600 text-gray-300"
      >
        {statuses.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
    </div>
  )
}
