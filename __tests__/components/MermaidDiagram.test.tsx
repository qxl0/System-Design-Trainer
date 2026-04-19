import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import mermaid from 'mermaid'
import MermaidDiagram from '@/components/MermaidDiagram'

jest.mock('mermaid', () => ({
  __esModule: true,
  default: {
    initialize: jest.fn(),
    render: jest.fn(),
  },
}))

const mockRender = mermaid.render as jest.MockedFunction<typeof mermaid.render>

beforeEach(() => {
  jest.clearAllMocks()
  mockRender.mockResolvedValue({ svg: '<svg>test</svg>', bindFunctions: undefined as never, diagramType: 'flowchart' })
})

describe('MermaidDiagram', () => {
  test('renders a container div when given a valid chart string', async () => {
    const { container } = render(<MermaidDiagram chart="graph TD; A-->B;" />)

    await waitFor(() => {
      expect(container.querySelector('div.overflow-auto')).toBeInTheDocument()
    })
  })

  test('calls mermaid.render with the chart string', async () => {
    const chart = 'graph TD; A-->B;'
    render(<MermaidDiagram chart={chart} />)

    await waitFor(() => {
      expect(mockRender).toHaveBeenCalledWith(
        expect.stringMatching(/^mermaid-/),
        chart
      )
    })
  })

  test('shows error message when mermaid.render rejects', async () => {
    mockRender.mockRejectedValueOnce(new Error('bad syntax'))

    const chart = 'graph TD; INVALID'
    render(<MermaidDiagram chart={chart} />)

    await waitFor(() => {
      expect(screen.getByText('bad syntax')).toBeInTheDocument()
    })

    expect(screen.getByText(chart)).toBeInTheDocument()
  })

  test('returns null when chart is empty string', () => {
    const { container } = render(<MermaidDiagram chart="" />)
    expect(container.firstChild).toBeNull()
  })
})
