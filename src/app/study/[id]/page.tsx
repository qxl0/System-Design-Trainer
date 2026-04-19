'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import type { Question } from '@/types'

const MermaidDiagram = dynamic(() => import('@/components/MermaidDiagram'), { ssr: false })

const difficultyColors = {
  Easy: 'bg-green-900 text-green-300',
  Medium: 'bg-yellow-900 text-yellow-300',
  Hard: 'bg-red-900 text-red-300',
}

export default function StudyPage() {
  const { id } = useParams<{ id: string }>()
  const [question, setQuestion] = useState<Question | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    fetch(`/api/questions/${id}`)
      .then((r) => {
        if (!r.ok) { setNotFound(true); setLoading(false); return null }
        return r.json()
      })
      .then((data) => {
        if (data) { setQuestion(data as Question); setLoading(false) }
      })
  }, [id])

  if (loading) return <div className="text-gray-400 p-8 text-center">Loading...</div>

  if (notFound || !question) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-400">Question not found.</p>
        <Link href="/study" className="text-blue-400 hover:underline text-sm mt-2 inline-block">
          ← Back to Study List
        </Link>
      </main>
    )
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${difficultyColors[question.difficulty]}`}>
            {question.difficulty}
          </span>
          <span className="text-xs text-gray-400">{question.category}</span>
          {question.tags.map((tag) => (
            <span key={tag} className="text-xs bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded">
              {tag}
            </span>
          ))}
        </div>
        <h1 className="text-2xl font-bold text-gray-100">{question.title}</h1>
        <p className="text-gray-400 text-sm mt-1">{question.prompt}</p>
      </div>

      {/* Architecture Diagram — Mermaid */}
      {question.mermaidDiagram ? (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Architecture Diagram
          </h2>
          <div className="flex justify-center">
            <MermaidDiagram chart={question.mermaidDiagram} />
          </div>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-5 text-center text-gray-500 text-sm">
          No diagram available for this question yet.
        </div>
      )}

      {/* ASCII Diagram */}
      {question.asciiDiagram && (
        <div className="bg-gray-900 rounded-xl border border-gray-700 p-5">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            ASCII Reference
          </h2>
          <pre className="text-xs text-green-300 font-mono leading-relaxed overflow-x-auto whitespace-pre">
            {question.asciiDiagram}
          </pre>
        </div>
      )}

      {/* Model Answer */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Model Answer
        </h2>
        <div className="prose prose-invert prose-sm max-w-none text-gray-300 whitespace-pre-wrap font-mono text-sm leading-relaxed">
          {question.modelAnswer}
        </div>
      </div>

      {/* Study Notes (Alex Xu content) */}
      {question.studyNotes && (
        <div className="bg-blue-950 border border-blue-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-3">
            📖 Study Notes — Alex Xu
          </h2>
          <div className="prose prose-invert prose-sm max-w-none text-blue-100 whitespace-pre-wrap text-sm leading-relaxed">
            {question.studyNotes}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2 pb-8">
        <Link
          href={`/practice/${id}`}
          className="px-5 py-2 bg-green-700 hover:bg-green-600 text-white font-bold rounded-lg transition-colors text-sm"
        >
          Practice This →
        </Link>
        <Link
          href="/study"
          className="px-5 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors text-sm"
        >
          ← All Questions
        </Link>
      </div>
    </main>
  )
}
