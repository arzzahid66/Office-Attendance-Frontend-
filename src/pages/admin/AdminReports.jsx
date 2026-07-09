import { useState } from 'react'
import { api, apiDownload } from '../../api'

function currentMonth() {
  return new Date().toISOString().slice(0, 7)
}

export default function AdminReports() {
  const [month, setMonth] = useState(currentMonth())
  const [rows, setRows] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function load() {
    setBusy(true)
    setError('')
    try {
      setRows(await api.get(`/admin/reports?month=${month}`))
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function download() {
    setError('')
    try {
      // Goes through api.js (BASE_URL + auth headers) so it respects VITE_API_BASE_URL.
      await apiDownload(`/admin/reports/export?month=${month}`, `attendance-report-${month}.csv`)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <h2 style={{ fontSize: 16, marginTop: 0 }}>Monthly report</h2>
      {error && <div className="error-box">{error}</div>}

      <div className="card">
        <div className="field">
          <label>Month</label>
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn small" onClick={load} disabled={busy}>
            {busy ? 'Loading…' : 'Run report'}
          </button>
          <button className="btn small secondary" onClick={download} disabled={!rows}>
            Export CSV
          </button>
        </div>
      </div>

      {rows && rows.length === 0 && <p className="muted">No employees.</p>}
      {rows && rows.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Present</th>
                <th>Late</th>
                <th>Flagged</th>
                <th>Absent</th>
                <th>Leave</th>
                <th>Off</th>
                <th>GPS</th>
                <th>GPS pend.</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.user_id}>
                  <td>{r.name}</td>
                  <td>{r.present_days}</td>
                  <td>{r.late_days}</td>
                  <td>{r.flagged_days}</td>
                  <td>{r.absent_days}</td>
                  <td>{r.leave_days}</td>
                  <td>{r.off_days}</td>
                  <td>{r.gps_days}</td>
                  <td>{r.gps_pending_days}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
