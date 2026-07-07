import { useEffect, useState } from 'react'
import { api } from '../../api'

function formatTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

export default function AdminDashboard() {
  const [rows, setRows] = useState(null)
  const [error, setError] = useState('')

  function load() {
    api
      .get('/admin/dashboard')
      .then(setRows)
      .catch((err) => setError(err.message))
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 30 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (error) return <div className="error-box">{error}</div>
  if (!rows) return <div className="muted">Loading…</div>

  return (
    <div>
      <h2 style={{ fontSize: 16, marginTop: 0 }}>Today's live view</h2>
      {rows.length === 0 && <p className="muted">No active employees yet.</p>}
      {rows.map((r) => (
        <div className="card" key={r.user_id} style={{ padding: 12 }}>
          <div className="row" style={{ marginBottom: 4 }}>
            <strong>{r.name}</strong>
            <span className={`status-pill status-${r.mode}`}>{r.mode}</span>
          </div>
          <p className="muted" style={{ margin: 0 }}>{r.email}</p>
          <div className="row" style={{ marginTop: 8, marginBottom: 0 }}>
            <span className="muted">In / Out</span>
            <span>
              {formatTime(r.check_in)} / {formatTime(r.check_out)}
            </span>
          </div>
          <div className="row" style={{ marginBottom: 0 }}>
            <span className="muted">Last heartbeat</span>
            <span>{formatTime(r.last_heartbeat_at)}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
