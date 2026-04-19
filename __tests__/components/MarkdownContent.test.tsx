import { fireEvent, render, screen } from '@testing-library/react'
import MarkdownContent from '@/components/MarkdownContent'

describe('MarkdownContent', () => {
  it('renders markdown view by default', () => {
    render(<MarkdownContent content={'## Heading\n### Requirements\n- First item\n- Second item'} />)

    expect(screen.getByText('Heading')).toBeInTheDocument()
    expect(screen.getByText('Requirements')).toBeInTheDocument()
    expect(screen.getByText('First item')).toBeInTheDocument()
    expect(screen.queryByText('## Heading')).not.toBeInTheDocument()
    expect(screen.queryByText('### Requirements')).not.toBeInTheDocument()
  })

  it('switches to raw markdown view', () => {
    render(<MarkdownContent content={'## Heading\n\nSome `code` here'} />)

    fireEvent.click(screen.getByRole('switch', { name: 'Toggle raw markdown' }))

    expect(screen.getByText(/## Heading/)).toBeInTheDocument()
    expect(screen.getByText(/Some `code` here/)).toBeInTheDocument()
  })
})
