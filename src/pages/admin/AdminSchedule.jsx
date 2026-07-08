import { useEffect, useState } from 'react'
import { api } from '../../api'

function fmtTime(t) {
  return t ? t.slice(0, 5) : '—'
}

export default function AdminSchedule() {
  const [requests, setRequests] = useState(null)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [notes, setNotes] = useState({})

  function load() {
    api
      .get('/admin/schedule')
      .then(setRequests)
      .catch((err) => setError(err.message))
  }

  useEffect(load, [])

  async function decide(id, status) {
    setBusyId(id)
    setError('')
    try {
      await api.post(`/admin/schedule/${id}/decide`, { status, note: notes[id] || null })
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  if (error) return <div className="error-box">{error}</div>
  if (!requests) return <div className="muted">Loading…</div>

  const pending = requests.filter((r) => r.status === 'pending')
  const decided = requests.filter((r) => r.status !== 'pending')

  return (
    <div>
      <h2 style={{ fontSize: 16, marginTop: 0 }}>Pending hours requests</h2>
      {pending.length === 0 && <p className="muted">Nothing pending.</p>}
      {pending.map((r) => (
        <div className="card" key={r.id} style={{ padding: 12 }}>
          <div className="row" style={{ marginBottom: 4 }}>
            <strong>{r.name}</strong>
            <span className="status-pill status-wfh">
              {fmtTime(r.start_time)}–{fmtTime(r.end_time)}
            </span>
          </div>
          <p className="muted" style={{ margin: '0 0 6px' }}>
            {r.job_title || '—'} · {r.department || '—'} · {r.city || '—'}
          </p>
          <p className="muted" style={{ margin: '0 0 6px' }}>
            {r.email}
          </p>
          <div className="row" style={{ marginBottom: 6 }}>
            <span className="muted">Effective</span>
            <span>
              {r.start_date} → {r.end_date}
            </span>
          </div>
          <p style={{ margin: '0 0 8px' }}>{r.reason}</p>
          <div className="field">
            <input
              placeholder="Optional note to employee"
              value={notes[r.id] || ''}
              onChange={(e) => setNotes((n) => ({ ...n, [r.id]: e.target.value }))}
            />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn small" disabled={busyId === r.id} onClick={() => decide(r.id, 'approved')}>
              Approve
            </button>
            <button className="btn small danger" disabled={busyId === r.id} onClick={() => decide(r.id, 'rejected')}>
              Reject
            </button>
          </div>
        </div>
      ))}

      <h2 style={{ fontSize: 15, marginTop: 20, marginBottom: 8 }}>History</h2>
      {decided.length === 0 && <p className="muted">No decisions yet.</p>}
      {decided.map((r) => (
        <div className="card" key={r.id} style={{ padding: 12 }}>
          <div className="row" style={{ marginBottom: 4 }}>
            <span>
              {r.name} · {fmtTime(r.start_time)}–{fmtTime(r.end_time)}
            </span>
            <span className={`status-pill status-${r.status}`}>{r.status}</span>
          </div>
          <p className="muted" style={{ margin: 0 }}>
            {r.start_date} → {r.end_date}
          </p>
          {r.decision_note && (
            <p className="muted" style={{ margin: '4px 0 0' }}>
              Note: {r.decision_note}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}
