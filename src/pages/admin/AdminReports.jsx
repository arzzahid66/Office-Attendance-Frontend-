import { useState } from 'react'
import { api, getAccessToken, getDeviceToken } from '../../api'

function currentMonth() {
  return new Date().toISOString().slice(0, 7)
}

export default function AdminReports() {
  const [month, setMonth] = useState(currentMonth())
  const [rows, setRows] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function loadReport() {
    setError('')
    setBusy(true)
    try {
      const data = await api.get(`/admin/reports?month=${month}`)
      setRows(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function exportCsv() {
    setError('')
    try {
      const res = await fetch(`/api/admin/reports/export?month=${month}`, {
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,
          'X-Device-Token': getDeviceToken() || '',
        },
      })
      if (!res.ok) throw new Error('Export failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `attendance-report-${month}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      {error && <div className="error-box">{error}</div>}

      <div className="card">
        <label>Month</label>
        <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" onClick={loadReport} disabled={busy}>
            {busy ? 'Loading…' : 'Load report'}
          </button>
          <button className="btn secondary" onClick={exportCsv}>
            Export CSV
          </button>
        </div>
      </div>

      {rows && (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Office</th>
              <th>WFH</th>
              <th>Flagged</th>
              <th>Absent</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.user_id}>
                <td>{r.name}</td>
                <td>{r.office_days}</td>
                <td>{r.wfh_days}</td>
                <td>{r.flagged_days}</td>
                <td>{r.absent_days}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
