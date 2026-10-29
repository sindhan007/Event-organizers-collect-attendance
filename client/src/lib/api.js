export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const TOKEN_KEY = 'gatherwell_access_token'

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function clearAccessToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export function saveAccessToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

async function request(path, options = {}) {
  const headers = new Headers(options.headers)
  headers.set('Content-Type', 'application/json')
  const token = getAccessToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const response = await fetch(`${API_URL}${path}`, { ...options, headers })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(payload.message || 'Request failed')
  return payload
}

export async function login(username, password) {
  const payload = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
  saveAccessToken(payload.token)
  return payload.user
}

export async function register(username, password, displayName) {
  const payload = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, password, displayName }),
  })
  saveAccessToken(payload.token)
  return payload.user
}

export function getCurrentUser() {
  return request('/api/auth/me').then((payload) => payload.user)
}
