import { useEffect, useState } from 'react'
import { api } from '../api'

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export default function WfhRequest() {
  const [date, setDate] = useState(todayStr())
  const [reason, setReason] = useState('')
  const [requests, setRequests] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  function load() {
    api
      .get('/wfh/mine')
      .then(setRequests)
      .catch((err) => setError(err.message))
  }

  useEffect(load, [])

  async function submit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await api.post('/wfh', { date, reason })
      setReason('')
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <div className="card">
        <h2 style={{ fontSize: 16, marginTop: 0 }}>Request WFH</h2>
        {error && <div className="error-box">{error}</div>}
        <form onSubmit={submit}>
          <div className="field">
            <label>Date</label>
            <input type="date" required value={date} min={todayStr()} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="field">
            <label>Reason</label>
            <textarea required rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
          <button className="btn" type="submit" disabled={busy}>
            {busy ? 'Submitting…' : 'Submit request'}
          </button>
        </form>
      </div>

      <h2 style={{ fontSize: 15, marginBottom: 8 }}>My requests</h2>
      {!requests && <p className="muted">Loading…</p>}
      {requests?.length === 0 && <p className="muted">No WFH requests yet.</p>}
      {requests?.map((r) => (
        <div className="card" key={r.id} style={{ padding: 12 }}>
          <div className="row" style={{ marginBottom: 4 }}>
            <strong>{r.date}</strong>
            <span className={`status-pill status-${r.status}`}>{r.status}</span>
          </div>
          <p className="muted" style={{ margin: 0 }}>
            {r.reason}
          </p>
        </div>
      ))}
    </div>
  )
}
