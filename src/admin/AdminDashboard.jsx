import { useCallback, useEffect, useState } from 'react'
import { api } from '../services/api'

const clock = (iso) =>
  iso ? new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—'
const hhmm = (t) => (t ? t.slice(0, 5) : '—')

export default function AdminDashboard() {
  const [rows, setRows] = useState(null)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)

  const load = useCallback(() => {
    api.get('/admin/dashboard').then(setRows).catch((err) => setError(err.message))
  }, [])

  useEffect(() => {
    load()
    const interval = setInterval(load, 30 * 1000)
    return () => clearInterval(interval)
  }, [load])

  async function verify(dayId, action) {
    setBusyId(dayId)
    setError('')
    try {
      await api.post(`/admin/attendance/${dayId}/verify`, { action })
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  if (error) return <div className="error-box">{error}</div>
  if (!rows) return <div className="muted">Loading…</div>

  return (
    <div>
      <h2 style={{ fontSize: 16, marginTop: 0 }}>Today's live view</h2>
      {rows.length === 0 && <p className="muted">No active employees yet.</p>}

      {rows.map((r) => {
        const pending = r.verification === 'gps_pending'
        return (
          <div
            className="card"
            key={r.user_id}
            // GPS check-ins are never auto-trusted (a browser cannot detect mock locations),
            // so they are visually distinct until an admin approves them.
            style={pending ? { borderColor: 'var(--pill-amber-bd)', background: 'var(--pill-amber-bg)' } : undefined}
          >
            <div className="row" style={{ marginBottom: 2 }}>
              <strong>{r.name}</strong>
              {r.status ? (
                <span className={`status-pill status-${r.status}`}>{r.status}</span>
              ) : (
                <span className="status-pill status-off_day">not checked in</span>
              )}
            </div>
            <p className="muted" style={{ margin: '0 0 6px' }}>
              {r.email} · {r.roster_name || 'no roster'} {r.shift_start && `(${hhmm(r.shift_start)}–${hhmm(r.shift_end)})`}
            </p>

            <div className="row" style={{ marginBottom: 0 }}>
              <span className="muted">In / Out</span>
              <span>{clock(r.check_in)} / {clock(r.check_out)}</span>
            </div>
            <div className="row" style={{ marginBottom: 0 }}>
              <span className="muted">Last seen</span>
              <span>{clock(r.last_seen)}</span>
            </div>
            {r.method && (
              <div className="row" style={{ marginBottom: 0 }}>
                <span className="muted">Method</span>
                <span className={`status-pill ${r.method === 'wifi' ? 'status-present' : 'status-gps_pending'}`}>
                  {r.method === 'wifi' ? 'WiFi · verified' : pending ? 'GPS · pending' : 'GPS · verified'}
                </span>
              </div>
            )}
            {r.late_minutes > 0 && (
              <div className="row" style={{ marginBottom: 0 }}>
                <span className="muted">Late by</span>
                <span>{r.late_minutes} min</span>
              </div>
            )}

            {pending && (
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button className="btn small" disabled={busyId === r.day_id} onClick={() => verify(r.day_id, 'approve')}>
                  Approve
                </button>
                <button className="btn small secondary" disabled={busyId === r.day_id} onClick={() => verify(r.day_id, 'query')}>
                  Query
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
