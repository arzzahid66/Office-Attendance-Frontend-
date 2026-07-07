import { useEffect, useState } from 'react'
import { api } from '../api'

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
      <h2 style={{ fontSize: 16, marginBottom: 10 }}>Last 30 days</h2>
      {rows.length === 0 && <p className="muted">No attendance records yet.</p>}
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Mode</th>
            <th>In / Out</th>
            <th>Checks</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{r.date}</td>
              <td>
                <span className={`status-pill status-${r.mode}`}>{r.mode}</span>
              </td>
              <td>
                {r.check_in ? new Date(r.check_in).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—'}
                {' / '}
                {r.check_out ? new Date(r.check_out).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—'}
              </td>
              <td>
                {r.passed_checks}/{r.total_checks}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
