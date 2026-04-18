'use client'

import { useState, useEffect } from 'react'

interface ProgressRecord {
  id: string
  questionId: string
  questionTitle: string
  category: string
  lastScore: number | null
  nextReviewAt: string
  updatedAt: string
}

export default function ProgressPage() {
  const [records, setRecords] = useState<ProgressRecord[]>([])
  const [totalAvailable, setTotalAvailable] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/progress').then((r) => r.json()),
      fetch('/api/questions').then((r) => r.json()),
    ]).then(([progress, questions]) => {
      setRecords(progress as ProgressRecord[])
      setTotalAvailable((questions as unknown[]).length)
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="text-gray-400 p-8 text-center">Loading...</div>

  const attempted = records.filter((r) => r.lastScore !== null)
  const avgScore = attempted.length
    ? Math.round((attempted.reduce((s, r) => s + (r.lastScore ?? 0), 0) / attempted.length) * 10) / 10
    : 0

  const categoryScores: Record<string, number[]> = {}
  for (const r of attempted) {
    if (!categoryScores[r.category]) categoryScores[r.category] = []
    categoryScores[r.category].push(r.lastScore ?? 0)
  }
  const weakest = Object.entries(categoryScores)
    .map(([category, scores]) => ({
      category,
      avgScore: Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10,
    }))
    .sort((a, b) => a.avgScore - b.avgScore)
    .slice(0, 3)

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-gray-100">Your Progress</h1>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 text-center">
          <div className="text-3xl font-black text-green-400">{records.length}</div>
          <div className="text-xs text-gray-400 mt-1">of {totalAvailable} attempted</div>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 text-center">
          <div className="text-3xl font-black text-blue-400">{avgScore || '—'}</div>
          <div className="text-xs text-gray-400 mt-1">avg score</div>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 text-center">
          <div className="text-3xl font-black text-purple-400">
            {records.filter((r) => new Date(r.nextReviewAt) <= new Date()).length}
          </div>
          <div className="text-xs text-gray-400 mt-1">due for review</div>
        </div>
      </div>

      {weakest.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <h2 className="font-semibold text-gray-200 mb-3">Weakest Categories</h2>
          <div className="space-y-2">
            {weakest.map(({ category, avgScore: catScore }) => (
              <div key={category} className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">{category}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-700 rounded-full h-1.5">
                    <div
                      className="bg-red-500 h-1.5 rounded-full"
                      style={{ width: `${catScore * 10}%` }}
                    />
                  </div>
                  <span className="text-sm text-red-400 w-8 text-right">{catScore}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {records.length > 0 && (
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-700">
            <h2 className="font-semibold text-gray-200">History</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700 text-gray-400 text-xs">
                <th className="text-left px-5 py-2">Question</th>
                <th className="text-center px-3 py-2">Score</th>
                <th className="text-right px-5 py-2">Next Review</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} className="border-b border-gray-700 last:border-0">
                  <td className="px-5 py-3 text-gray-200">{r.questionTitle}</td>
                  <td className="px-3 py-3 text-center">
                    <span className={`font-bold ${(r.lastScore ?? 0) >= 7 ? 'text-green-400' : 'text-yellow-400'}`}>
                      {r.lastScore ?? '—'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right text-gray-400">
                    {new Date(r.nextReviewAt) <= new Date()
                      ? <span className="text-red-400">Due now</span>
                      : new Date(r.nextReviewAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {records.length === 0 && (
        <p className="text-gray-400 text-center py-8">
          No attempts yet. <a href="/" className="text-blue-400 hover:underline">Start practicing →</a>
        </p>
      )}
    </main>
  )
}
