'use client'

import { useState, useEffect, useRef } from 'react'

interface TimerProps {
  totalSeconds: number
  onExpire: () => void
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function Timer({ totalSeconds, onExpire }: TimerProps) {
  const [remaining, setRemaining] = useState(totalSeconds)
  const onExpireRef = useRef(onExpire)
  onExpireRef.current = onExpire

  useEffect(() => {
    if (remaining <= 0) {
      onExpireRef.current()
      return
    }
    const id = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(id)
          onExpireRef.current()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const isLow = remaining < 300
  return (
    <span
      data-testid="timer-display"
      className={`font-mono font-bold text-lg px-3 py-1 rounded ${
        isLow ? 'text-red-400 bg-red-950' : 'text-gray-200 bg-gray-800'
      }`}
    >
      {formatTime(remaining)}
    </span>
  )
}
