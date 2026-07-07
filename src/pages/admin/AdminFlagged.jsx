import { useEffect, useState } from 'react'
import { api } from '../../api'

const MODES = ['office', 'wfh', 'flagged', 'absent']

export default function AdminFlagged() {
  const [days, setDays] = useState(null)
  const [error, setError] = useState('')
  const [drafts, setDrafts] = useState({})
  const [busyId, setBusyId] = useState(null)

  function load() {
    api
      .get('/admin/flagged-days')
      .then(setDays)
      .catch((err) => setError(err.message))
  }

  useEffect(load, [])

  function setDraft(id, field, value) {
    setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }))
  }

  async function resolve(day) {
    const draft = drafts[day.id] || {}
    setBusyId(day.id)
    setError('')
    try {
      await api.post(`/admin/flagged-days/${day.id}/resolve`, {
        mode: draft.mode || 'office',
        note: draft.note || '',
      })
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  if (error) return <div className="error-box">{error}</div>
  if (!days) return <div className="muted">Loading…</div>

  return (
    <div>
      <h2 style={{ fontSize: 16, marginTop: 0 }}>Flagged days</h2>
      {days.length === 0 && <p className="muted">Nothing flagged.</p>}
      {days.map((d) => {
        const draft = drafts[d.id] || { mode: 'office', note: '' }
        return (
          <div className="card" key={d.id}>
            <div className="row" style={{ marginBottom: 4 }}>
              <strong>{d.name}</strong>
              <span>{d.date}</span>
            </div>
            <p className="muted" style={{ margin: '0 0 8px' }}>
              {d.email} · {d.passed_checks}/{d.total_checks} checks passed
            </p>
            <div className="field">
              <label>Resolve as</label>
              <select value={draft.mode} onChange={(e) => setDraft(d.id, 'mode', e.target.value)}>
                {MODES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Note</label>
              <textarea rows={2} value={draft.note} onChange={(e) => setDraft(d.id, 'note', e.target.value)} />
            </div>
            <button className="btn small" disabled={busyId === d.id} onClick={() => resolve(d)}>
              {busyId === d.id ? 'Saving…' : 'Resolve'}
            </button>
          </div>
        )
      })}
    </div>
  )
}
