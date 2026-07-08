import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { api, apiRequest, clearSession, setAccessToken, setDeviceToken, setRefreshToken, getAccessToken } from './api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadMe = useCallback(async () => {
    if (!getAccessToken()) {
      setUser(null)
      setLoading(false)
      return
    }
    try {
      const me = await api.get('/auth/me')
      setUser(me)
    } catch {
      clearSession()
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMe()
  }, [loadMe])

  async function login(email, password) {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: { email, password, platform: navigator.userAgent },
      skipRefresh: true,
    })
    setAccessToken(data.access_token)
    setRefreshToken(data.refresh_token)
    if (data.device_token) setDeviceToken(data.device_token)
    setUser(data.user)
    return data.user
  }

  async function signup(payload) {
    return apiRequest('/auth/signup', { method: 'POST', body: payload, skipRefresh: true })
  }

  function logout() {
    clearSession()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refreshMe: loadMe }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
