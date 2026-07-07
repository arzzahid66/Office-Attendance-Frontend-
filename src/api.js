// In dev, this is unset, so it falls back to '/api' which Vite proxies to the backend
// (see vite.config.js). In production (Vercel), set VITE_API_BASE_URL to the full backend
// URL, e.g. https://oas-ai.nlpbusiness.site/api
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

function getAccessToken() {
  return localStorage.getItem('access_token')
}
function setAccessToken(token) {
  if (token) localStorage.setItem('access_token', token)
  else localStorage.removeItem('access_token')
}
function getRefreshToken() {
  return localStorage.getItem('refresh_token')
}
function setRefreshToken(token) {
  if (token) localStorage.setItem('refresh_token', token)
  else localStorage.removeItem('refresh_token')
}
function getDeviceToken() {
  return localStorage.getItem('device_token')
}
function setDeviceToken(token) {
  if (token) localStorage.setItem('device_token', token)
  else localStorage.removeItem('device_token')
}

export function clearSession() {
  setAccessToken(null)
  setRefreshToken(null)
  setDeviceToken(null)
}

async function doFetch(path, options) {
  const headers = new Headers(options.headers || {})
  if (!headers.has('Content-Type') && options.body) headers.set('Content-Type', 'application/json')
  const access = getAccessToken()
  if (access) headers.set('Authorization', `Bearer ${access}`)
  const device = getDeviceToken()
  if (device) headers.set('X-Device-Token', device)

  return fetch(BASE_URL + path, { ...options, headers })
}

async function tryRefresh() {
  const refresh = getRefreshToken()
  if (!refresh) return false
  const res = await fetch(BASE_URL + '/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refresh }),
  })
  if (!res.ok) return false
  const data = await res.json()
  setAccessToken(data.access_token)
  return true
}

export async function apiRequest(path, { method = 'GET', body, skipRefresh = false } = {}) {
  let res = await doFetch(path, { method, body: body ? JSON.stringify(body) : undefined })

  if (res.status === 401 && !skipRefresh && getRefreshToken()) {
    const refreshed = await tryRefresh()
    if (refreshed) {
      res = await doFetch(path, { method, body: body ? JSON.stringify(body) : undefined })
    }
  }

  let data = null
  const text = await res.text()
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }

  if (!res.ok) {
    const message = (data && data.detail) || `Request failed (${res.status})`
    const error = new Error(typeof message === 'string' ? message : JSON.stringify(message))
    error.status = res.status
    error.data = data
    throw error
  }

  return data
}

export const api = {
  get: (path) => apiRequest(path),
  post: (path, body) => apiRequest(path, { method: 'POST', body }),
  patch: (path, body) => apiRequest(path, { method: 'PATCH', body }),
  delete: (path) => apiRequest(path, { method: 'DELETE' }),
}

export { getAccessToken, setAccessToken, getRefreshToken, setRefreshToken, getDeviceToken, setDeviceToken }
