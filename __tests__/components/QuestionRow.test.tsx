import { render, screen } from '@testing-library/react'
import { QuestionRow } from '@/components/QuestionRow'
import type { QuestionWithStatus } from '@/types'

const q: QuestionWithStatus = {
  id: 'cuid1',
  title: 'Design a URL Shortener',
  prompt: 'Design bit.ly',
  difficulty: 'Medium',
  category: 'URL/ID',
  tags: ['redis', 'sql'],
  modelAnswer: '...',
  createdAt: new Date().toISOString(),
  status: 'not_started',
}

describe('QuestionRow', () => {
  it('renders question title', () => {
    render(<table><tbody><QuestionRow question={q} /></tbody></table>)
    expect(screen.getByText('Design a URL Shortener')).toBeInTheDocument()
  })

  it('shows "Not started" for not_started status', () => {
    render(<table><tbody><QuestionRow question={q} /></tbody></table>)
    expect(screen.getByText('Not started')).toBeInTheDocument()
  })

  it('shows "Due now" for due status', () => {
    render(<table><tbody><QuestionRow question={{ ...q, status: 'due' }} /></tbody></table>)
    expect(screen.getByText('📅 Due now')).toBeInTheDocument()
  })

  it('shows difficulty dot with correct color class', () => {
    render(<table><tbody><QuestionRow question={q} /></tbody></table>)
    const dot = screen.getByTestId('difficulty-dot')
    expect(dot).toHaveClass('text-yellow-400')
  })
})
