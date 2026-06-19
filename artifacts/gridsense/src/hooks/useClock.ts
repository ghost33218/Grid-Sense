import { useState, useEffect } from 'react'

export function useClock() {
  const [time, setTime] = useState('')

  useEffect(() => {
    const fmt = () => {
      const now = new Date()
      return now.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: 'Asia/Kolkata',
      })
    }
    setTime(fmt())
    const id = setInterval(() => setTime(fmt()), 1000)
    return () => clearInterval(id)
  }, [])

  return { time }
}
