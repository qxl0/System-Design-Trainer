'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  allReferenceLinks,
  latencyNumbers,
  powersOfTwo,
  referenceFolders,
  referenceSections,
  referenceTables,
} from '@/lib/references'

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-blue-300 hover:text-blue-200 hover:underline"
    >
      {children}
    </a>
  )
}

function ExplorerFolder({
  title,
  description,
  isOpen,
  onToggle,
  children,
}: {
  title: string
  description: string
  isOpen: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center gap-2 rounded px-2 py-1 text-left text-sm text-gray-200 hover:bg-[#2b2b2b]"
      >
        <span className="w-4 shrink-0 text-center text-[10px] text-gray-400">
          {isOpen ? '▾' : '▸'}
        </span>
        <span className="shrink-0 text-[15px] leading-none">📁</span>
        <span className="truncate">{title}</span>
      </button>
      {isOpen && description && (
        <div className="ml-8 pr-2 text-[11px] leading-4 text-gray-500">{description}</div>
      )}
      {isOpen && <div className="mt-0.5 space-y-0.5">{children}</div>}
    </div>
  )
}

function ExplorerItem({
  href,
  label,
  isActive,
  onSelect,
}: {
  href: string
  label: string
  isActive: boolean
  onSelect: () => void
}) {
  return (
    <a
      href={href}
      onClick={onSelect}
      className={`ml-6 flex items-center gap-2 rounded px-2 py-1 text-sm transition-colors ${
        isActive
          ? 'bg-[#373d41] text-white'
          : 'text-gray-300 hover:bg-[#2b2b2b] hover:text-white'
      }`}
    >
      <span className="w-4 shrink-0 text-center text-[10px] text-transparent">•</span>
      <span className="shrink-0 text-[14px] leading-none text-gray-400">📄</span>
      <span className="truncate">{label}</span>
    </a>
  )
}

export default function ReferencesBrowser() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') ?? ''
  const [query, setQuery] = useState(initialQuery)
  const [selectedNavId, setSelectedNavId] = useState('powers-of-two')
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(referenceFolders.map((folder) => [folder.id, true]))
  )

  useEffect(() => {
    setQuery(initialQuery)
  }, [initialQuery])

  useEffect(() => {
    if (query.trim()) {
      setOpenFolders(Object.fromEntries(referenceFolders.map((folder) => [folder.id, true])))
    }
  }, [query])

  const normalizedQuery = query.trim().toLowerCase()

  const filteredSections = useMemo(() => {
    return referenceSections
      .map((section) => ({
        ...section,
        links: section.links.filter((link) => {
          if (!normalizedQuery) return true

          const haystack = [
            section.title,
            section.description,
            link.title,
            link.note,
            ...link.tags,
            ...(link.relatedQuestions ?? []),
          ]
            .join(' ')
            .toLowerCase()

          return haystack.includes(normalizedQuery)
        }),
      }))
      .filter((section) => section.links.length > 0)
  }, [normalizedQuery])

  const visibleSectionIds = new Set(filteredSections.map((section) => section.id))

  const matchingQuestionTitles = useMemo(() => {
    const titles = filteredSections.flatMap((section) =>
      section.links.flatMap((link) => link.relatedQuestions ?? [])
    )
    return Array.from(new Set(titles)).sort((a, b) => a.localeCompare(b))
  }, [filteredSections])

  const stats = useMemo(() => {
    const visibleLinks = filteredSections.reduce((sum, section) => sum + section.links.length, 0)
    return {
      sectionCount: filteredSections.length,
      linkCount: visibleLinks,
      totalLinkCount: allReferenceLinks.length,
    }
  }, [filteredSections])

  const showPowersTable =
    !normalizedQuery ||
    ['powers', 'power', 'storage', 'binary', 'appendix', 'kb', 'mb', 'gb', 'tb', 'pb'].some(
      (term) => term.includes(normalizedQuery) || normalizedQuery.includes(term)
    )

  const showLatencyTable =
    !normalizedQuery ||
    ['latency', 'numbers', 'timing', 'network', 'cache', 'ssd', 'hdd', 'appendix'].some(
      (term) => term.includes(normalizedQuery) || normalizedQuery.includes(term)
    )

  const visibleFolders = useMemo(() => {
    return referenceFolders
      .map((folder) => {
        const items = folder.itemIds
          .filter(
            (itemId) =>
              visibleSectionIds.has(itemId) ||
              (!normalizedQuery && referenceTables.some((table) => table.id === itemId))
          )
          .map((itemId) => {
            const section = referenceSections.find((entry) => entry.id === itemId)
            const table = referenceTables.find((entry) => entry.id === itemId)
            return {
              id: itemId,
              title: section?.title ?? table?.title ?? itemId,
            }
          })

        if (normalizedQuery && items.length === 0) return null

        return { ...folder, items }
      })
      .filter((folder): folder is NonNullable<typeof folder> => folder !== null)
  }, [normalizedQuery, visibleSectionIds])

  const toggleFolder = (folderId: string) => {
    setOpenFolders((current) => ({ ...current, [folderId]: !current[folderId] }))
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <section className="rounded-3xl border border-gray-800 bg-gradient-to-br from-slate-950 via-gray-950 to-blue-950/30 p-8">
        <div className="max-w-3xl space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-blue-400">
            Appendix
          </p>
          <h1 className="text-3xl font-bold text-gray-50">System Design References</h1>
          <p className="text-sm leading-6 text-gray-300">
            A structured reference shelf inspired by the system design primer appendix: quick estimation tables, primary papers, engineering blogs, and real-world system writeups you can jump through quickly.
          </p>
          <div className="flex flex-wrap gap-3 pt-1 text-sm">
            <Link
              href="/study"
              className="rounded-full border border-blue-700 bg-blue-950/60 px-4 py-2 text-blue-200 transition-colors hover:bg-blue-900/70"
            >
              Go to Study
            </Link>
            <ExternalLink href="https://github.com/donnemartin/system-design-primer/blob/master/README.md?plain=1">
              View original primer appendix
            </ExternalLink>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-800 bg-gray-900/80 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-gray-100">Find references fast</h2>
            <p className="text-sm text-gray-400">
              Search by topic, company, tag, paper, or question title.
            </p>
          </div>
          <div className="w-full lg:max-w-xl">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search: twitter, payments, dynamo, cache, url shortener..."
              className="w-full rounded-xl border border-gray-700 bg-gray-950 px-4 py-3 text-sm text-gray-100 outline-none transition-colors placeholder:text-gray-500 focus:border-blue-500"
            />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-400">
          <span className="rounded-full border border-gray-800 bg-gray-950 px-3 py-1">
            {stats.sectionCount} sections shown
          </span>
          <span className="rounded-full border border-gray-800 bg-gray-950 px-3 py-1">
            {stats.linkCount} of {stats.totalLinkCount} links shown
          </span>
          {matchingQuestionTitles.slice(0, 6).map((title) => (
            <Link
              key={title}
              href={`/study?q=${encodeURIComponent(title)}`}
              className="rounded-full border border-gray-800 bg-gray-950 px-3 py-1 text-gray-300 hover:border-blue-500 hover:text-blue-300"
            >
              {title}
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-6 self-start rounded-xl border border-[#3a3a3a] bg-[#202020] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
          <div className="mb-3 border-b border-[#343434] px-2 pb-2">
            <p className="text-[11px] uppercase tracking-[0.28em] text-gray-500">Navigation</p>
            <h2 className="mt-1 text-base font-semibold text-gray-100">Reference Index</h2>
          </div>
          <div className="rounded-lg border border-[#343434] bg-[#191919] p-2">
            <div className="mb-2 px-2 text-[11px] uppercase tracking-[0.24em] text-gray-500">
              This PC &gt; References
            </div>
            <div className="space-y-0.5">
              {visibleFolders.map((folder) => (
                <ExplorerFolder
                  key={folder.id}
                  title={folder.title}
                  description={folder.description}
                  isOpen={!!openFolders[folder.id]}
                  onToggle={() => toggleFolder(folder.id)}
                >
                  {folder.items.map((item) => (
                    <ExplorerItem
                      key={item.id}
                      href={`#${item.id}`}
                      label={item.title}
                      isActive={selectedNavId === item.id}
                      onSelect={() => setSelectedNavId(item.id)}
                    />
                  ))}
                </ExplorerFolder>
              ))}
            </div>
          </div>
        </aside>

        <div className="space-y-6">
          {showPowersTable && (
            <section
              id="powers-of-two"
              className="rounded-2xl border border-gray-800 bg-gray-900/80 p-5"
            >
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-100">Powers of Two</h2>
                <p className="text-sm text-gray-400">
                  Useful for fast storage and cardinality estimates in interviews.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-gray-500">
                    <tr className="border-b border-gray-800">
                      <th className="py-2 pr-3 font-medium">Power</th>
                      <th className="py-2 pr-3 font-medium">Exact</th>
                      <th className="py-2 pr-3 font-medium">Approx</th>
                      <th className="py-2 font-medium">Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {powersOfTwo.map((row) => (
                      <tr key={row.power} className="border-b border-gray-900 text-gray-300">
                        <td className="py-2 pr-3 font-mono text-blue-300">{row.power}</td>
                        <td className="py-2 pr-3 font-mono">{row.exact}</td>
                        <td className="py-2 pr-3">{row.approx}</td>
                        <td className="py-2">{row.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {showLatencyTable && (
            <section
              id="latency-numbers"
              className="rounded-2xl border border-gray-800 bg-gray-900/80 p-5"
            >
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-100">Latency Numbers</h2>
                <p className="text-sm text-gray-400">
                  Canonical order-of-magnitude timings for reasoning about bottlenecks.
                </p>
              </div>
              <div className="space-y-2">
                {latencyNumbers.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between gap-4 rounded-xl border border-gray-800 bg-gray-950/70 px-4 py-3"
                  >
                    <span className="text-sm text-gray-300">{item.label}</span>
                    <span className="font-mono text-sm text-amber-300">{item.value}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {filteredSections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="rounded-2xl border border-gray-800 bg-gray-900/80 p-5"
            >
              <div className="mb-4 space-y-1">
                <p className="text-xs uppercase tracking-[0.24em] text-gray-500">
                  {section.folderId.replaceAll('-', ' / ')}
                </p>
                <h2 className="text-lg font-semibold text-gray-100">{section.title}</h2>
                <p className="text-sm leading-6 text-gray-400">{section.description}</p>
              </div>

              <div className="space-y-3">
                {section.links.map((link) => (
                  <div
                    key={link.id}
                    className="rounded-xl border border-gray-800 bg-gray-950/70 p-4 transition-colors hover:border-gray-700"
                  >
                    <div className="mb-1 text-sm font-medium text-gray-100">
                      <ExternalLink href={link.url}>{link.title}</ExternalLink>
                    </div>
                    <p className="text-sm leading-6 text-gray-400">{link.note}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {link.tags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => setQuery(tag)}
                          className="rounded-full border border-gray-800 px-2.5 py-1 text-xs text-gray-300 hover:border-blue-500 hover:text-blue-300"
                        >
                          #{tag}
                        </button>
                      ))}
                      {(link.relatedQuestions ?? []).map((title) => (
                        <Link
                          key={title}
                          href={`/study?q=${encodeURIComponent(title)}`}
                          className="rounded-full border border-blue-900 bg-blue-950/40 px-2.5 py-1 text-xs text-blue-200 hover:bg-blue-950/70"
                        >
                          {title}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}

          {normalizedQuery &&
            filteredSections.length === 0 &&
            !showPowersTable &&
            !showLatencyTable && (
              <div className="rounded-2xl border border-gray-800 bg-gray-900/80 p-8 text-center text-sm text-gray-400">
                No references matched your search.
              </div>
            )}
        </div>
      </section>
    </main>
  )
}
