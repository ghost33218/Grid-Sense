import { useState, useCallback, useRef } from 'react'
import { predict } from '../api/client'

const defaultForm = {
  event_cause: '',
  event_type: 'planned',
  corridor: '',
  zone: '',
  police_station: '',
  veh_type: 'none',
  priority: 'High',
  requires_road_closure: false,
  start_datetime: '',
  end_datetime: '',
  latitude: 12.9716,
  longitude: 77.5946,
}

export type FormData = typeof defaultForm

export function usePredict() {
  const [formData, setFormData] = useState<FormData>(defaultForm)
  const [result, setResult] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const updateField = useCallback((key: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }, [])

  const loadDemo = useCallback((demoForm: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...demoForm }))
    setResult(null)
    setError(false)
  }, [])

  const cancelPending = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort()
      abortRef.current = null
    }
  }, [])

  const submitPrediction = useCallback(async (overrideForm?: Partial<FormData>) => {
    cancelPending()
    const controller = new AbortController()
    abortRef.current = controller

    const payload = overrideForm ? { ...formData, ...overrideForm } : formData
    setLoading(true)
    setError(false)
    const res = await predict(payload)
    if (controller.signal.aborted) {
      return null
    }
    abortRef.current = null

    if (res.success && res.data?.prediction) {
      setResult(res.data.prediction as Record<string, unknown>)
      setLoading(false)
      return res.data.prediction as Record<string, unknown>
    }
    setError(true)
    setLoading(false)
    return null
  }, [formData, cancelPending])

  return {
    formData,
    result,
    loading,
    error,
    updateField,
    submitPrediction,
    loadDemo,
    setFormData,
    cancelPending,
  }
}
