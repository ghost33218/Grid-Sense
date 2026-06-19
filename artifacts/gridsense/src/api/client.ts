import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || 'https://gridsense-backend-tp2m.onrender.com'

const api = axios.create({ baseURL: BASE, timeout: 5000 })

export async function checkHealth() {
  try {
    const r = await api.get('/health')
    return r.data
  } catch (e) {
    console.error('checkHealth failed', e)
    return null
  }
}

export async function getSummary() {
  try {
    const r = await api.get('/summary')
    return r.data
  } catch (e) {
    console.error('getSummary failed', e)
    return null
  }
}

export async function getAnalytics() {
  try {
    const r = await api.get('/analytics')
    return r.data
  } catch (e) {
    console.error('getAnalytics failed', e)
    return null
  }
}

export async function getEvents(params: Record<string, string | number> = {}) {
  try {
    const r = await api.get('/events', { params })
    return r.data
  } catch (e) {
    console.error('getEvents failed', e)
    return null
  }
}

export async function getHotspots() {
  try {
    const r = await api.get('/hotspots')
    return r.data
  } catch (e) {
    console.error('getHotspots failed', e)
    return null
  }
}

export async function predict(body: Record<string, unknown>) {
  try {
    const r = await api.post('/predict', body)
    return r.data
  } catch (e) {
    console.error('predict failed', e)
    return null
  }
}

export async function getSimilar(eventId: string) {
  try {
    const r = await api.get(`/similar/${eventId}`)
    return r.data
  } catch (e) {
    console.error('getSimilar failed', e)
    return null
  }
}

export async function postFeedback(body: Record<string, unknown>) {
  try {
    const r = await api.post('/feedback', body)
    return r.data
  } catch (e) {
    console.error('postFeedback failed', e)
    return null
  }
}

export async function getFeedback() {
  try {
    const r = await api.get('/feedback')
    return r.data
  } catch (e) {
    console.error('getFeedback failed', e)
    return null
  }
}

export async function getCorridors() {
  try {
    const r = await api.get('/meta/corridors')
    return r.data
  } catch (e) {
    console.error('getCorridors failed', e)
    return null
  }
}

export async function getZones() {
  try {
    const r = await api.get('/meta/zones')
    return r.data
  } catch (e) {
    console.error('getZones failed', e)
    return null
  }
}

export async function getCauses() {
  try {
    const r = await api.get('/meta/causes')
    return r.data
  } catch (e) {
    console.error('getCauses failed', e)
    return null
  }
}

export async function getCorporations() {
  try {
    const r = await api.get('/meta/corporations')
    return r.data
  } catch (e) {
    console.error('getCorporations failed', e)
    return null
  }
}
