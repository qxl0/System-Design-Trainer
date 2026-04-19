'use client'

import mermaid from 'mermaid'
import { useEffect, useRef, useState } from 'react'

let renderCount = 0

interface MermaidDiagramProps {
  chart: string
}

export default function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!chart || !containerRef.current) return

    mermaid.initialize({ startOnLoad: false, theme: 'dark', securityLevel: 'loose' })

    const id = `mermaid-${++renderCount}`
    let cancelled = false

    mermaid
      .render(id, chart)
      .then(({ svg, bindFunctions }) => {
        if (cancelled || !containerRef.current) return
        containerRef.current.innerHTML = svg
        bindFunctions?.(containerRef.current)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        const message = err instanceof Error ? err.message : String(err)
        setError(message)
      })

    return () => {
      cancelled = true
      // clean up the hidden element mermaid creates in the body
      document.getElementById(`d${id}`)?.remove()
    }
  }, [chart])

  if (!chart) return null

  if (error) {
    return (
      <div>
        <p className="text-red-400 text-xs mb-1">Diagram render error: {error}</p>
        <pre className="text-xs text-gray-400 overflow-auto">{chart}</pre>
      </div>
    )
  }

  return <div ref={containerRef} className="overflow-auto w-full" />
}
