import { render, screen, fireEvent } from '@testing-library/react'
import { FilterBar } from '@/components/FilterBar'

const defaultProps = {
  difficulty: 'All',
  category: 'All',
  status: 'All',
  onDifficultyChange: jest.fn(),
  onCategoryChange: jest.fn(),
  onStatusChange: jest.fn(),
}

describe('FilterBar', () => {
  it('renders difficulty buttons', () => {
    render(<FilterBar {...defaultProps} />)
    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Easy' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Medium' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Hard' })).toBeInTheDocument()
  })

  it('calls onDifficultyChange when Hard clicked', () => {
    const onDifficultyChange = jest.fn()
    render(<FilterBar {...defaultProps} onDifficultyChange={onDifficultyChange} />)
    fireEvent.click(screen.getByText('Hard'))
    expect(onDifficultyChange).toHaveBeenCalledWith('Hard')
  })

  it('highlights active difficulty filter', () => {
    render(<FilterBar {...defaultProps} difficulty="Easy" />)
    const easyBtn = screen.getByText('Easy')
    expect(easyBtn.closest('button')).toHaveClass('ring-2')
  })
})
