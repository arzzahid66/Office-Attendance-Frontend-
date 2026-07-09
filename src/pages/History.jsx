import { useEffect, useState } from 'react'
import { api } from '../api'

const clock = (iso) =>
  iso ? new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—'

export default function History() {
  const [rows, setRows] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/attendance/history')
      .then(setRows)
      .catch((err) => setError(err.message))
  }, [])

  if (error) return <div className="error-box">{error}</div>
  if (!rows) return <div className="muted">Loading…</div>

  return (
    <div>
      <h2 style={{ fontSize: 16, marginBottom: 10 }}>My attendance · last 30 days</h2>
      {rows.length === 0 && <p className="muted">No attendance records yet.</p>}
      {rows.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Status</th>
              <th>In / Out</th>
              <th>Method</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.date}</td>
                <td>
                  <span className={`status-pill status-${r.status}`}>{r.status}</span>
                  {r.late_minutes > 0 && <span className="muted"> +{r.late_minutes}m</span>}
                </td>
                <td>
                  {clock(r.check_in)} / {clock(r.check_out)}
                </td>
                <td className="muted">{r.method || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
