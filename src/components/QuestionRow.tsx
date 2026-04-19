import Link from 'next/link'
import type { QuestionWithStatus } from '@/types'

const difficultyDotColor: Record<string, string> = {
  Easy: 'text-green-400',
  Medium: 'text-yellow-400',
  Hard: 'text-red-400',
}

function StatusBadge({ question }: { question: QuestionWithStatus }) {
  if (question.status === 'due') {
    return <span className="text-red-400 text-sm">📅 Due now</span>
  }
  if (question.status === 'done' && question.nextReviewAt) {
    const days = Math.ceil(
      (new Date(question.nextReviewAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )
    return <span className="text-green-400 text-sm">✓ Done · review in {days}d</span>
  }
  return <span className="text-gray-400 text-sm">Not started</span>
}

export function QuestionRow({ question }: { question: QuestionWithStatus }) {
  return (
    <tr className="border-b border-gray-700 hover:bg-gray-800 transition-colors">
      <td className="py-3 px-4 w-6">
        <span
          data-testid="difficulty-dot"
          className={`text-lg ${difficultyDotColor[question.difficulty]}`}
        >
          ●
        </span>
      </td>
      <td className="py-3 px-4">
        <Link
          href={`/practice/${question.id}`}
          className="text-gray-100 hover:text-blue-400 font-medium transition-colors"
        >
          {question.title}
        </Link>
        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-gray-500">{question.category}</span>
          {question.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-gray-700 bg-gray-900 px-2 py-0.5 text-gray-400"
            >
              #{tag}
            </span>
          ))}
        </div>
        <p className="mt-2 max-w-2xl text-sm text-gray-400">{question.prompt}</p>
      </td>
      <td className="py-3 px-4 text-right">
        <StatusBadge question={question} />
      </td>
      <td className="py-3 px-4 text-right">
        <Link
          href={`/study/${question.id}`}
          className="text-xs px-2 py-0.5 bg-indigo-900 text-indigo-300 rounded hover:bg-indigo-800 transition-colors"
        >
          Study
        </Link>
      </td>
    </tr>
  )
}
