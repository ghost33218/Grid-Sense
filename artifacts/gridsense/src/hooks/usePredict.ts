import { useState, useCallback } from 'react'
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

  const updateField = useCallback((key: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }, [])

  const loadDemo = useCallback((demoForm: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...demoForm }))
    setResult(null)
    setError(false)
  }, [])

  const submitPrediction = useCallback(async (overrideForm?: Partial<FormData>) => {
    const payload = overrideForm ? { ...formData, ...overrideForm } : formData
    setLoading(true)
    setError(false)
    const res = await predict(payload)
    if (res?.prediction) {
      setResult(res.prediction)
      setLoading(false)
      return res.prediction as Record<string, unknown>
    }
    setError(true)
    setLoading(false)
    return null
  }, [formData])

  return { formData, result, loading, error, updateField, submitPrediction, loadDemo, setFormData }
}
