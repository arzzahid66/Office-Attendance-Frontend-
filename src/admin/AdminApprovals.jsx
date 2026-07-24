import { useCallback, useEffect, useState } from 'react'
import { api } from '../services/api'

const hhmm = (t) => (t ? t.slice(0, 5) : '')

export default function AdminApprovals() {
  const [employees, setEmployees] = useState(null)
  const [rosters, setRosters] = useState([])
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [form, setForm] = useState({}) // per-user: { rosterId, feedback }

  const load = useCallback(() => {
    setError('')
    Promise.all([api.get('/admin/employees'), api.get('/rosters/all')])
      .then(([emps, rs]) => {
        setEmployees(emps)
        setRosters(rs)
        // Default each pending user's dropdown to what THEY requested.
        const next = {}
        emps
          .filter((e) => e.status === 'pending')
          .forEach((e) => {
            next[e.id] = { rosterId: e.requested_roster_id || rs.find((r) => r.is_default)?.id || rs[0]?.id, feedback: '' }
          })
        setForm(next)
      })
      .catch((err) => setError(err.message))
  }, [])

  useEffect(load, [load])

  async function decide(id, action) {
    setBusyId(id)
    setError('')
    try {
      await api.post(`/admin/users/${id}/decision`, {
        action,
        assigned_roster_id: action === 'approve' ? form[id]?.rosterId : null,
        feedback: form[id]?.feedback || null,
      })
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  const rosterName = (id) => rosters.find((r) => r.id === id)?.name || '—'

  if (error) return <div className="error-box">{error}</div>
  if (!employees) return <div className="muted">Loading…</div>

  const pending = employees.filter((e) => e.status === 'pending')
  const decided = employees.filter((e) => e.status === 'rejected')

  return (
    <div>
      <h2 style={{ fontSize: 16, marginTop: 0 }}>Pending approvals</h2>
      {pending.length === 0 && <p className="muted">Nothing pending.</p>}

      {pending.map((e) => (
        <div className="card" key={e.id}>
          <div className="row" style={{ marginBottom: 2 }}>
            <strong>{e.name}</strong>
            <span className="status-pill status-pending">pending</span>
          </div>
          <p className="muted" style={{ margin: '0 0 2px' }}>
            {e.job_title || '—'} · {e.department || '—'} · {e.city || '—'}
          </p>
          <p className="muted" style={{ margin: '0 0 8px' }}>
            {e.email} · {e.phone || 'no phone'}
          </p>
          <div className="row" style={{ marginBottom: 8 }}>
            <span className="muted">Requested shift</span>
            <strong>{rosterName(e.requested_roster_id)}</strong>
          </div>

          <div className="field">
            <label>Assign shift (you may override)</label>
            <select
              value={form[e.id]?.rosterId ?? ''}
              onChange={(ev) => setForm((f) => ({ ...f, [e.id]: { ...f[e.id], rosterId: Number(ev.target.value) } }))}
            >
              {rosters
                .filter((r) => r.active)
                .map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({hhmm(r.start_time)}–{hhmm(r.end_time)})
                  </option>
                ))}
            </select>
          </div>
          <div className="field">
            <label>Feedback to employee (optional)</label>
            <textarea
              rows={2}
              value={form[e.id]?.feedback ?? ''}
              onChange={(ev) => setForm((f) => ({ ...f, [e.id]: { ...f[e.id], feedback: ev.target.value } }))}
            />
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn small" disabled={busyId === e.id} onClick={() => decide(e.id, 'approve')}>
              Approve
            </button>
            <button className="btn small danger" disabled={busyId === e.id} onClick={() => decide(e.id, 'reject')}>
              Reject
            </button>
          </div>
        </div>
      ))}

      <h2 style={{ fontSize: 15, marginTop: 20, marginBottom: 8 }}>Rejected</h2>
      {decided.length === 0 && <p className="muted">None.</p>}
      {decided.map((e) => (
        <div className="card" key={e.id} style={{ padding: 12 }}>
          <div className="row" style={{ marginBottom: 0 }}>
            <span>{e.name} · {e.email}</span>
            <span className="status-pill status-rejected">rejected</span>
          </div>
          {e.admin_feedback && <p className="muted" style={{ margin: '4px 0 0' }}>{e.admin_feedback}</p>}
        </div>
      ))}
    </div>
  )
}
