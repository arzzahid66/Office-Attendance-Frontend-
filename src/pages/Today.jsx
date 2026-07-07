import { useCallback, useEffect, useState } from 'react'
import { api } from '../api'

function formatTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

export default function Today() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(() => {
    api
      .get('/attendance/today')
      .then(setData)
      .catch((err) => setError(err.message))
  }, [])

  useEffect(() => {
    load()
    const interval = setInterval(load, 60 * 1000)
    return () => clearInterval(interval)
  }, [load])

  async function checkIn() {
    setBusy(true)
    setError('')
    try {
      await api.post('/attendance/check-in')
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function checkOut() {
    setBusy(true)
    setError('')
    try {
      await api.post('/attendance/check-out')
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (!data) return <div className="muted">Loading…</div>

  const attendance = data.attendance
  const checkedIn = !!attendance?.check_in

  return (
    <div>
      {error && <div className="error-box">{error}</div>}

      <div className="card">
        <div className="row">
          <span className="muted">Detected IP</span>
          <strong>{data.detected_ip}</strong>
        </div>
        <div className="row">
          <span className="muted">Office network match</span>
          <span className={`status-pill ${data.ip_matched ? 'status-office' : 'status-absent'}`}>
            {data.ip_matched ? 'Matched' : 'Not matched'}
          </span>
        </div>
        {attendance && (
          <>
            <div className="row">
              <span className="muted">Today's mode</span>
              <span className={`status-pill status-${attendance.mode}`}>{attendance.mode}</span>
            </div>
            <div className="row">
              <span className="muted">Check-in</span>
              <span>{formatTime(attendance.check_in)}</span>
            </div>
            <div className="row">
              <span className="muted">Last seen (auto)</span>
              <span>{formatTime(attendance.check_out)}</span>
            </div>
          </>
        )}
      </div>

      {!checkedIn && (
        <button className="btn" onClick={checkIn} disabled={busy}>
          {busy ? 'Checking in…' : 'Check In'}
        </button>
      )}
      {checkedIn && (
        <button className="btn danger" onClick={checkOut} disabled={busy}>
          {busy ? 'Checking out…' : 'Check Out'}
        </button>
      )}

      <h2 style={{ fontSize: 15, marginTop: 20, marginBottom: 8 }}>Today's checks</h2>
      {data.checks.length === 0 && <p className="muted">No random checks yet today.</p>}
      {data.checks.map((c) => (
        <div className="card" key={c.id} style={{ padding: 12 }}>
          <div className="row" style={{ marginBottom: 0 }}>
            <span>{formatTime(c.scheduled_at)}</span>
            <span className={`status-pill status-${c.result}`}>{c.result}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
