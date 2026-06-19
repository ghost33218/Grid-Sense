import { useState, useEffect, useCallback } from 'react'
import { getSummary, getAnalytics } from '../api/client'
import { DEMO_SUMMARY, DEMO_ANALYTICS } from '../data/demoData'

export function useAnalytics() {
  const [summary, setSummary] = useState<Record<string, unknown> | null>(null)
  const [analytics, setAnalytics] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [isDemo, setIsDemo] = useState(false)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(false)
    const [s, a] = await Promise.all([getSummary(), getAnalytics()])

    const summaryData = s.success && s.data?.data ? s.data.data : null
    const analyticsData = a.success && a.data?.data ? a.data.data : null

    if (!summaryData && !analyticsData) {
      setSummary(DEMO_SUMMARY as unknown as Record<string, unknown>)
      setAnalytics(DEMO_ANALYTICS as unknown as Record<string, unknown>)
      setIsDemo(true)
      setError(false)
    } else {
      setSummary((summaryData || DEMO_SUMMARY) as Record<string, unknown>)
      setAnalytics((analyticsData || DEMO_ANALYTICS) as Record<string, unknown>)
      setIsDemo(!summaryData || !analyticsData)
      setError(false)
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  return { summary, analytics, loading, error, isDemo, refetch: fetch }
}
