import { useCallback, useEffect, useState } from 'react'
import { api } from '../../api'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] // index = 0..6 (Mon..Sun)
const hhmm = (t) => (t ? t.slice(0, 5) : '')
const BLANK = { name: '', start_time: '10:00', end_time: '19:00', grace_minutes: 15, working_days: [0, 1, 2, 3, 4], is_default: false }

export default function AdminRosters() {
  const [rosters, setRosters] = useState(null)
  const [offices, setOffices] = useState([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState(BLANK)
  const [officeId, setOfficeId] = useState(null)

  const load = useCallback(() => {
    setError('')
    Promise.all([api.get('/rosters/all'), api.get('/admin/offices')])
      .then(([rs, os]) => {
        setRosters(rs)
        setOffices(os)
        if (!officeId && os.length) setOfficeId(os[0].id)
      })
      .catch((e) => setError(e.message))
  }, [officeId])

  useEffect(load, [load])

  function toggleDay(d) {
    setForm((f) => ({
      ...f,
      working_days: f.working_days.includes(d) ? f.working_days.filter((x) => x !== d) : [...f.working_days, d].sort(),
    }))
  }

  async function create(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await api.post('/rosters', { ...form, office_id: officeId })
      setForm(BLANK)
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function setDefault(id) {
    setError('')
    try {
      await api.patch(`/rosters/${id}`, { is_default: true })
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  async function toggleActive(r) {
    setError('')
    try {
      await api.patch(`/rosters/${r.id}`, { active: !r.active })
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  async function remove(id) {
    setError('')
    try {
      await api.delete(`/rosters/${id}`)
      load()
    } catch (err) {
      // 409 when employees are still assigned — surface the server's explanation verbatim.
      setError(err.message)
    }
  }

  if (!rosters) return <div className="muted">Loading…</div>

  return (
    <div>
      <h2 style={{ fontSize: 16, marginTop: 0 }}>Shifts / rosters</h2>
      {error && <div className="error-box">{error}</div>}

      {rosters.map((r) => (
        <div className="card" key={r.id} style={{ padding: 12 }}>
          <div className="row" style={{ marginBottom: 2 }}>
            <strong>{r.name}</strong>
            <span>
              {r.is_default && <span className="status-pill status-present" style={{ marginRight: 6 }}>default</span>}
              <span className={`status-pill ${r.active ? 'status-active' : 'status-disabled'}`}>
                {r.active ? 'active' : 'inactive'}
              </span>
            </span>
          </div>
          <p className="muted" style={{ margin: '0 0 8px' }}>
            {hhmm(r.start_time)}–{hhmm(r.end_time)} · grace {r.grace_minutes}m ·{' '}
            {r.working_days.map((d) => DAYS[d]).join(' ')}
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {!r.is_default && (
              <button className="btn small secondary" onClick={() => setDefault(r.id)}>Make default</button>
            )}
            <button className="btn small secondary" onClick={() => toggleActive(r)}>
              {r.active ? 'Deactivate' : 'Activate'}
            </button>
            <button className="btn small danger" onClick={() => remove(r.id)}>Delete</button>
          </div>
        </div>
      ))}

      <div className="card">
        <h2 style={{ fontSize: 15, marginTop: 0 }}>New shift</h2>
        <form onSubmit={create}>
          <div className="field">
            <label>Name</label>
            <input required value={form.name} placeholder="e.g. Evening" onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div className="field" style={{ flex: 1 }}>
              <label>Start</label>
              <input type="time" required value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label>End</label>
              <input type="time" required value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label>Grace (min)</label>
              <input type="number" min={0} max={240} value={form.grace_minutes} onChange={(e) => setForm({ ...form, grace_minutes: Number(e.target.value) })} />
            </div>
          </div>

          <div className="field">
            <label>Working days</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {DAYS.map((d, i) => (
                <label key={d} className={`status-pill ${form.working_days.includes(i) ? 'status-present' : 'status-off_day'}`}
                       style={{ cursor: 'pointer', padding: '6px 10px' }}>
                  <input type="checkbox" style={{ width: 'auto', margin: '0 6px 0 0' }}
                         checked={form.working_days.includes(i)} onChange={() => toggleDay(i)} />
                  {d}
                </label>
              ))}
            </div>
          </div>

          <div className="field">
            <label>Office</label>
            <select value={officeId ?? ''} onChange={(e) => setOfficeId(Number(e.target.value))}>
              {offices.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </div>

          <div className="field">
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" style={{ width: 'auto', margin: 0 }} checked={form.is_default}
                     onChange={(e) => setForm({ ...form, is_default: e.target.checked })} />
              Set as default (clears the current default)
            </label>
          </div>

          <button className="btn" type="submit" disabled={busy || !officeId || form.working_days.length === 0}>
            {busy ? 'Creating…' : 'Create shift'}
          </button>
        </form>
      </div>
    </div>
  )
}
