'use client'

import mermaid from 'mermaid'
import { useEffect, useId, useRef, useState } from 'react'

let initialized = false

interface MermaidDiagramProps {
  chart: string
}

export default function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const rawId = useId()
  const uniqueId = `mermaid-${rawId.replace(/:/g, '')}`
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!chart) return

    if (!initialized) {
      mermaid.initialize({ startOnLoad: false, theme: 'dark', securityLevel: 'loose' })
      initialized = true
    }

    setError(null)

    mermaid
      .render(uniqueId, chart)
      .then(({ svg }) => {
        if (containerRef.current) {
          containerRef.current.innerHTML = svg
        }
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : String(err)
        setError(message)
      })
  }, [chart, uniqueId])

  if (!chart) return null

  if (error) {
    return (
      <div>
        <p className="text-red-400 text-xs">{error}</p>
        <pre className="text-xs text-gray-400 mt-1 overflow-auto">{chart}</pre>
      </div>
    )
  }

  return <div ref={containerRef} className="overflow-auto" />
}
