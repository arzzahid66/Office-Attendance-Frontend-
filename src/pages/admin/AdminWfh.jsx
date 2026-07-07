import { useEffect, useState } from 'react'
import { api } from '../../api'

export default function AdminWfh() {
  const [requests, setRequests] = useState(null)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)

  function load() {
    api
      .get('/admin/wfh')
      .then(setRequests)
      .catch((err) => setError(err.message))
  }

  useEffect(load, [])

  async function decide(id, status) {
    setBusyId(id)
    setError('')
    try {
      await api.post(`/admin/wfh/${id}/decide`, { status })
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
      <h2 style={{ fontSize: 16, marginTop: 0 }}>Pending WFH requests</h2>
      {pending.length === 0 && <p className="muted">Nothing pending.</p>}
      {pending.map((r) => (
        <div className="card" key={r.id} style={{ padding: 12 }}>
          <div className="row" style={{ marginBottom: 4 }}>
            <strong>#{r.user_id}</strong>
            <span>{r.date}</span>
          </div>
          <p className="muted" style={{ margin: '0 0 8px' }}>{r.reason}</p>
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
          <div className="row" style={{ marginBottom: 0 }}>
            <span>
              #{r.user_id} · {r.date}
            </span>
            <span className={`status-pill status-${r.status}`}>{r.status}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
