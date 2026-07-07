import { useEffect } from 'react'
import { api } from '../api'

const HEARTBEAT_INTERVAL_MS = 10 * 60 * 1000

export default function useHeartbeat(enabled) {
  useEffect(() => {
    if (!enabled) return

    const send = () => {
      api.post('/attendance/heartbeat').catch(() => {})
    }

    send()
    const interval = setInterval(send, HEARTBEAT_INTERVAL_MS)

    const onVisibility = () => {
      if (document.visibilityState === 'visible') send()
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [enabled])
}
