import { useCallback, useEffect, useState } from 'react'
import { api } from '../../api'

const clock = (iso) =>
  iso ? new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—'

export default function AdminFlagged() {
  const [rows, setRows] = useState(null)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [notes, setNotes] = useState({})

  const load = useCallback(() => {
    api.get('/admin/flagged-days').then(setRows).catch((err) => setError(err.message))
  }, [])

  useEffect(load, [load])

  async function resolve(id, status) {
    setBusyId(id)
    setError('')
    try {
      await api.post(`/admin/flagged-days/${id}/resolve`, { status, note: notes[id] || null })
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
      <h2 style={{ fontSize: 16, marginTop: 0 }}>Flagged days</h2>
      <p className="muted" style={{ marginTop: 0 }}>
        The system never marks anyone absent automatically — a human decides each of these.
      </p>
      {rows.length === 0 && <p className="muted">Nothing flagged.</p>}

      {rows.map((r) => (
        <div className="card" key={r.id}>
          <div className="row" style={{ marginBottom: 2 }}>
            <strong>{r.name}</strong>
            <span className="status-pill status-flagged">flagged</span>
          </div>
          <p className="muted" style={{ margin: '0 0 6px' }}>{r.email} · {r.date}</p>
          <div className="row" style={{ marginBottom: 0 }}>
            <span className="muted">In / Out</span>
            <span>{clock(r.check_in)} / {clock(r.check_out)}</span>
          </div>
          {r.method && (
            <div className="row" style={{ marginBottom: 0 }}>
              <span className="muted">Method</span>
              <span className="muted">
                {r.method}{r.verification === 'gps_pending' ? ' (gps pending)' : ''}
              </span>
            </div>
          )}

          <div className="field" style={{ marginTop: 10 }}>
            <input
              placeholder="Note (optional)"
              value={notes[r.id] || ''}
              onChange={(e) => setNotes((n) => ({ ...n, [r.id]: e.target.value }))}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn small" disabled={busyId === r.id} onClick={() => resolve(r.id, 'present')}>
              Mark present
            </button>
            <button className="btn small secondary" disabled={busyId === r.id} onClick={() => resolve(r.id, 'leave')}>
              Mark leave
            </button>
            <button className="btn small danger" disabled={busyId === r.id} onClick={() => resolve(r.id, 'absent')}>
              Mark absent
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
