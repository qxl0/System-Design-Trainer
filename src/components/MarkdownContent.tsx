'use client'

import { Fragment, useId, useState } from 'react'
import type { ReactNode } from 'react'

type ViewMode = 'rendered' | 'raw'

interface MarkdownContentProps {
  content: string
  className?: string
}

function renderInline(text: string): ReactNode[] {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).filter(Boolean)

  return parts.map((part, index) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={`${part}-${index}`}
          className="rounded bg-gray-900 px-1.5 py-0.5 font-mono text-[0.9em] text-gray-200"
        >
          {part.slice(1, -1)}
        </code>
      )
    }

    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={`${part}-${index}`} className="font-semibold text-gray-100">
          {part.slice(2, -2)}
        </strong>
      )
    }

    return <Fragment key={`${part}-${index}`}>{part}</Fragment>
  })
}

function renderHeading(line: string, index: number) {
  const match = line.match(/^(#{1,6})\s+(.+)$/)
  if (!match) return null

  const level = match[1].length
  const text = match[2]
  const className =
    level === 1
      ? 'text-2xl font-bold text-gray-100'
      : level === 2
        ? 'text-xl font-semibold text-gray-100'
        : 'text-lg font-semibold text-gray-200'

  return (
    <div key={`heading-${index}`} className={className}>
      {renderInline(text)}
    </div>
  )
}

function renderTable(tableLines: string[], key: string) {
  const rows = tableLines.map((line) =>
    line
      .split('|')
      .map((cell) => cell.trim())
      .filter(Boolean)
  )

  const [header, , ...body] = rows

  return (
    <div key={key} className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-gray-700">
            {header.map((cell) => (
              <th key={cell} className="px-3 py-2 font-semibold text-gray-100">
                {renderInline(cell)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, rowIndex) => (
            <tr key={`${key}-row-${rowIndex}`} className="border-b border-gray-800">
              {row.map((cell, cellIndex) => (
                <td key={`${key}-cell-${rowIndex}-${cellIndex}`} className="px-3 py-2 align-top text-gray-300">
                  {renderInline(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function RenderedMarkdown({ content, className }: { content: string; className?: string }) {
  const lines = content.replace(/\r\n/g, '\n').split('\n')
  const nodes: ReactNode[] = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index]
    const trimmed = line.trim()

    if (!trimmed) {
      index += 1
      continue
    }

    if (trimmed.startsWith('```')) {
      const codeLines: string[] = []
      index += 1

      while (index < lines.length && !lines[index].trim().startsWith('```')) {
        codeLines.push(lines[index])
        index += 1
      }

      if (index < lines.length) index += 1

      nodes.push(
        <pre
          key={`code-${index}`}
          className="overflow-x-auto rounded-lg border border-gray-700 bg-gray-950 p-4 text-xs text-green-300"
        >
          <code>{codeLines.join('\n')}</code>
        </pre>
      )
      continue
    }

    const heading = renderHeading(trimmed, index)
    if (heading) {
      nodes.push(heading)
      index += 1
      continue
    }

    if (
      trimmed.includes('|') &&
      index + 1 < lines.length &&
      lines[index + 1].includes('---')
    ) {
      const tableLines = [trimmed, lines[index + 1].trim()]
      index += 2

      while (index < lines.length && lines[index].trim().includes('|')) {
        tableLines.push(lines[index].trim())
        index += 1
      }

      nodes.push(renderTable(tableLines, `table-${index}`))
      continue
    }

    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = []

      while (index < lines.length && /^\s*[-*]\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\s*[-*]\s+/, '').trim())
        index += 1
      }

      nodes.push(
        <ul key={`ul-${index}`} className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-gray-300">
          {items.map((item, itemIndex) => (
            <li key={`ul-${index}-${itemIndex}`}>{renderInline(item)}</li>
          ))}
        </ul>
      )
      continue
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = []

      while (index < lines.length && /^\s*\d+\.\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\s*\d+\.\s+/, '').trim())
        index += 1
      }

      nodes.push(
        <ol key={`ol-${index}`} className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-gray-300">
          {items.map((item, itemIndex) => (
            <li key={`ol-${index}-${itemIndex}`}>{renderInline(item)}</li>
          ))}
        </ol>
      )
      continue
    }

    const paragraphLines: string[] = []
    while (
      index < lines.length &&
      lines[index].trim() &&
      !lines[index].trim().startsWith('```') &&
      !/^(#{1,6})\s+/.test(lines[index].trim()) &&
      !/^\s*[-*]\s+/.test(lines[index]) &&
      !/^\s*\d+\.\s+/.test(lines[index]) &&
      !(
        lines[index].trim().includes('|') &&
        index + 1 < lines.length &&
        lines[index + 1].includes('---')
      )
    ) {
      paragraphLines.push(lines[index].trim())
      index += 1
    }

    nodes.push(
      <p key={`p-${index}`} className="text-sm leading-7 text-gray-300">
        {paragraphLines.flatMap((paragraphLine, lineIndex) => [
          ...(lineIndex > 0 ? [<br key={`br-${index}-${lineIndex}`} />] : []),
          ...renderInline(paragraphLine),
        ])}
      </p>
    )
  }

  return <div className={className}>{nodes}</div>
}

export default function MarkdownContent({ content, className }: MarkdownContentProps) {
  const [mode, setMode] = useState<ViewMode>('rendered')
  const toggleId = useId()

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-4 text-xs text-gray-400">
        <span className="font-medium text-gray-300">Markdown View</span>
        <label htmlFor={toggleId} className="flex items-center gap-3">
          <span className={mode === 'rendered' ? 'text-gray-100' : 'text-gray-500'}>Rendered</span>
          <input
            id={toggleId}
            type="checkbox"
            role="switch"
            aria-label="Toggle raw markdown"
            checked={mode === 'raw'}
            onChange={(event) => setMode(event.target.checked ? 'raw' : 'rendered')}
            className="peer sr-only"
          />
          <span className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-700 transition-colors peer-checked:bg-blue-600">
            <span className="inline-block h-4 w-4 translate-x-1 rounded-full bg-white transition-transform peer-checked:translate-x-6" />
          </span>
          <span className={mode === 'raw' ? 'text-gray-100' : 'text-gray-500'}>Raw Markdown</span>
        </label>
      </div>

      {mode === 'rendered' ? (
        <RenderedMarkdown content={content} className={className ?? 'space-y-4'} />
      ) : (
        <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg bg-gray-900 p-4 font-mono text-sm leading-relaxed text-gray-300">
          {content}
        </pre>
      )}
    </div>
  )
}
