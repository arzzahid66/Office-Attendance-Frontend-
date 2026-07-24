import { useEffect, useRef } from 'react'
import { api } from '../services/api'

const HEARTBEAT_INTERVAL_MS = 5 * 60 * 1000 // 5 minutes

// Presence heartbeat while the app is OPEN and visible. A closed PWA cannot run this — a
// background trigger needs a native shell.
// TODO: Capacitor foreground service goes here (Phase 1.5) for true background presence.
export default function useHeartbeat(enabled) {
  const lastLocationAt = useRef(0)

  useEffect(() => {
    if (!enabled) return
    let cancelled = false

    async function sendLocationFix(reverifyMinutes) {
      const interval = (reverifyMinutes || 15) * 60 * 1000
      if (Date.now() - lastLocationAt.current < interval) return
      if (!navigator.geolocation) return
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          lastLocationAt.current = Date.now()
          try {
            await api.post('/attendance/heartbeat', {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
            })
          } catch { /* ignore */ }
        },
        () => { /* permission/again later */ },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
      )
    }

    async function beat() {
      try {
        const r = await api.post('/attendance/heartbeat', {})
        // On a GPS day the server asks for a fresh in-radius fix, at most every
        // reverify_minutes — that's what keeps last_seen advancing (and stops crediting
        // time once the user leaves the office radius).
        if (!cancelled && r && r.in_shift && r.requires_location) {
          await sendLocationFix(r.reverify_minutes)
        }
      } catch { /* ignore transient errors */ }
    }

    const tick = () => { if (document.visibilityState === 'visible') beat() }
    tick()
    const interval = setInterval(tick, HEARTBEAT_INTERVAL_MS)
    const onVis = () => { if (document.visibilityState === 'visible') beat() }
    document.addEventListener('visibilitychange', onVis)

    return () => {
      cancelled = true
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [enabled])
}
