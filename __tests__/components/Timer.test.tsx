import { render, screen, act } from '@testing-library/react'
import { Timer } from '@/components/Timer'

jest.useFakeTimers()

describe('Timer', () => {
  it('displays initial time correctly', () => {
    render(<Timer totalSeconds={2700} onExpire={jest.fn()} />)
    expect(screen.getByText('45:00')).toBeInTheDocument()
  })

  it('counts down each second', () => {
    render(<Timer totalSeconds={2700} onExpire={jest.fn()} />)
    act(() => { jest.advanceTimersByTime(1000) })
    expect(screen.getByText('44:59')).toBeInTheDocument()
  })

  it('calls onExpire when timer reaches zero', () => {
    const onExpire = jest.fn()
    render(<Timer totalSeconds={2} onExpire={onExpire} />)
    act(() => { jest.advanceTimersByTime(2000) })
    expect(onExpire).toHaveBeenCalledTimes(1)
  })

  it('shows red color when under 5 minutes', () => {
    render(<Timer totalSeconds={299} onExpire={jest.fn()} />)
    const display = screen.getByTestId('timer-display')
    expect(display).toHaveClass('text-red-400')
  })
})
