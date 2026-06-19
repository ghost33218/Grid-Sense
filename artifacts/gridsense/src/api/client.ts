import axios, { AxiosError } from 'axios'

const BASE = import.meta.env.VITE_API_URL || 'https://gridsense-backend-tp2m.onrender.com'
const TIMEOUT_MS = 5000
const MAX_RETRIES = 1

export type ApiResponse<T> = {
  success: boolean
  data: T | null
  error: string | null
  fallback: boolean
}

const api = axios.create({ baseURL: BASE, timeout: TIMEOUT_MS })

async function withRetry<T>(
  fn: (signal: AbortSignal) => Promise<T>,
  retries = MAX_RETRIES
): Promise<T> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const result = await fn(controller.signal)
    clearTimeout(timeoutId)
    return result
  } catch (err) {
    clearTimeout(timeoutId)
    if (retries > 0 && err instanceof Error && err.name !== 'AbortError') {
      return withRetry(fn, retries - 1)
    }
    throw err
  }
}

function handleError(e: unknown): { error: string; fallback: boolean } {
  if (e instanceof AxiosError) {
    if (e.code === 'ECONNABORTED' || e.name === 'AbortError') {
      return { error: 'Request timed out', fallback: true }
    }
    if (e.response) {
      return { error: `Server error: ${e.response.status}`, fallback: false }
    }
    if (e.request) {
      return { error: 'Network error - no response', fallback: true }
    }
    return { error: e.message || 'Unknown error', fallback: true }
  }
  if (e instanceof Error) {
    return { error: e.message, fallback: true }
  }
  return { error: 'Unknown error', fallback: true }
}

type HealthResponse = { status: string }
type SummaryResponse = { data: Record<string, unknown> }
type AnalyticsResponse = { data: Record<string, unknown> }
type EventsResponse = { events: Record<string, unknown>[]; total: number }
type HotspotsResponse = { hotspots: Record<string, unknown>[] }
type PredictResponse = { prediction: Record<string, unknown> }
type SimilarResponse = { similar_events: Record<string, unknown>[] }
type FeedbackPostResponse = { success: boolean }
type FeedbackGetResponse = { records: Record<string, unknown>[]; total: number; accuracy: number }
type CorridorsResponse = { corridors: string[] }
type ZonesResponse = { zones: string[] }
type CausesResponse = { causes: string[] }
type CorporationsResponse = { corporations: string[] }

export async function checkHealth(): Promise<ApiResponse<HealthResponse>> {
  try {
    const r = await withRetry(async (signal) => {
      return api.get('/health', { signal })
    })
    return { success: true, data: r.data, error: null, fallback: false }
  } catch (e) {
    const { error, fallback } = handleError(e)
    return { success: false, data: null, error, fallback }
  }
}

export async function getSummary(): Promise<ApiResponse<SummaryResponse>> {
  try {
    const r = await withRetry(async (signal) => {
      return api.get('/summary', { signal })
    })
    return { success: true, data: r.data, error: null, fallback: false }
  } catch (e) {
    const { error, fallback } = handleError(e)
    return { success: false, data: null, error, fallback }
  }
}

export async function getAnalytics(): Promise<ApiResponse<AnalyticsResponse>> {
  try {
    const r = await withRetry(async (signal) => {
      return api.get('/analytics', { signal })
    })
    return { success: true, data: r.data, error: null, fallback: false }
  } catch (e) {
    const { error, fallback } = handleError(e)
    return { success: false, data: null, error, fallback }
  }
}

export async function getEvents(params: Record<string, string | number> = {}): Promise<ApiResponse<EventsResponse>> {
  try {
    const r = await withRetry(async (signal) => {
      return api.get('/events', { params, signal })
    })
    return { success: true, data: r.data, error: null, fallback: false }
  } catch (e) {
    const { error, fallback } = handleError(e)
    return { success: false, data: null, error, fallback }
  }
}

export async function getHotspots(): Promise<ApiResponse<HotspotsResponse>> {
  try {
    const r = await withRetry(async (signal) => {
      return api.get('/hotspots', { signal })
    })
    return { success: true, data: r.data, error: null, fallback: false }
  } catch (e) {
    const { error, fallback } = handleError(e)
    return { success: false, data: null, error, fallback }
  }
}

export async function predict(body: Record<string, unknown>): Promise<ApiResponse<PredictResponse>> {
  try {
    const r = await withRetry(async (signal) => {
      return api.post('/predict', body, { signal })
    })
    return { success: true, data: r.data, error: null, fallback: false }
  } catch (e) {
    const { error, fallback } = handleError(e)
    return { success: false, data: null, error, fallback }
  }
}

export async function getSimilar(eventId: string): Promise<ApiResponse<SimilarResponse>> {
  try {
    const r = await withRetry(async (signal) => {
      return api.get(`/similar/${eventId}`, { signal })
    })
    return { success: true, data: r.data, error: null, fallback: false }
  } catch (e) {
    const { error, fallback } = handleError(e)
    return { success: false, data: null, error, fallback }
  }
}

export async function postFeedback(body: Record<string, unknown>): Promise<ApiResponse<FeedbackPostResponse>> {
  try {
    const r = await withRetry(async (signal) => {
      return api.post('/feedback', body, { signal })
    })
    return { success: true, data: r.data, error: null, fallback: false }
  } catch (e) {
    const { error, fallback } = handleError(e)
    return { success: false, data: null, error, fallback }
  }
}

export async function getFeedback(): Promise<ApiResponse<FeedbackGetResponse>> {
  try {
    const r = await withRetry(async (signal) => {
      return api.get('/feedback', { signal })
    })
    return { success: true, data: r.data, error: null, fallback: false }
  } catch (e) {
    const { error, fallback } = handleError(e)
    return { success: false, data: null, error, fallback }
  }
}

export async function getCorridors(): Promise<ApiResponse<CorridorsResponse>> {
  try {
    const r = await withRetry(async (signal) => {
      return api.get('/meta/corridors', { signal })
    })
    return { success: true, data: r.data, error: null, fallback: false }
  } catch (e) {
    const { error, fallback } = handleError(e)
    return { success: false, data: null, error, fallback }
  }
}

export async function getZones(): Promise<ApiResponse<ZonesResponse>> {
  try {
    const r = await withRetry(async (signal) => {
      return api.get('/meta/zones', { signal })
    })
    return { success: true, data: r.data, error: null, fallback: false }
  } catch (e) {
    const { error, fallback } = handleError(e)
    return { success: false, data: null, error, fallback }
  }
}

export async function getCauses(): Promise<ApiResponse<CausesResponse>> {
  try {
    const r = await withRetry(async (signal) => {
      return api.get('/meta/causes', { signal })
    })
    return { success: true, data: r.data, error: null, fallback: false }
  } catch (e) {
    const { error, fallback } = handleError(e)
    return { success: false, data: null, error, fallback }
  }
}

export async function getCorporations(): Promise<ApiResponse<CorporationsResponse>> {
  try {
    const r = await withRetry(async (signal) => {
      return api.get('/meta/corporations', { signal })
    })
    return { success: true, data: r.data, error: null, fallback: false }
  } catch (e) {
    const { error, fallback } = handleError(e)
    return { success: false, data: null, error, fallback }
  }
}
