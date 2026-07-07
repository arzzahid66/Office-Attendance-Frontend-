import { useEffect, useState, useCallback } from 'react'
import { api } from '../api'

const POLL_INTERVAL_MS = 60 * 1000

// TODO(push): random checks are currently delivered by polling GET /api/checks/pending
// while the app is open. A Web Push subscription would let the server wake the app
// immediately when a check is scheduled, instead of waiting up to 60s for the next poll.
export default function CheckBanner({ onRespond }) {
  const [checks, setChecks] = useState([])
  const [busyId, setBusyId] = useState(null)

  const poll = useCallback(() => {
    api
      .get('/checks/pending')
      .then(setChecks)
      .catch(() => {})
  }, [])

  useEffect(() => {
    poll()
    const interval = setInterval(poll, POLL_INTERVAL_MS)
    const onVisibility = () => {
      if (document.visibilityState === 'visible') poll()
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [poll])

  async function respond(id) {
    setBusyId(id)
    try {
      await api.post(`/checks/${id}/respond`)
      setChecks((prev) => prev.filter((c) => c.id !== id))
      onRespond?.()
    } catch {
      poll()
    } finally {
      setBusyId(null)
    }
  }

  if (checks.length === 0) return null

  return (
    <>
      {checks.map((c) => (
        <div className="banner" key={c.id}>
          <strong>Verify your presence</strong>
          <span>Tap within 15 minutes of the scheduled check to confirm you're working.</span>
          <button className="btn" onClick={() => respond(c.id)} disabled={busyId === c.id}>
            {busyId === c.id ? 'Confirming…' : "I'm here"}
          </button>
        </div>
      ))}
    </>
  )
}
