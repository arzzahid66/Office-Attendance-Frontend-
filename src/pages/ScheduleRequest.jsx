import { useEffect, useState } from 'react'
import { api } from '../api'

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function fmtTime(t) {
  // backend returns "HH:MM:SS"; show HH:MM
  return t ? t.slice(0, 5) : '—'
}

export default function ScheduleRequest() {
  const [startDate, setStartDate] = useState(todayStr())
  const [endDate, setEndDate] = useState(todayStr())
  const [startTime, setStartTime] = useState('11:00')
  const [endTime, setEndTime] = useState('20:00')
  const [reason, setReason] = useState('')
  const [requests, setRequests] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  function load() {
    api
      .get('/schedule/mine')
      .then(setRequests)
      .catch((err) => setError(err.message))
  }

  useEffect(load, [])

  async function submit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await api.post('/schedule', {
        start_date: startDate,
        end_date: endDate,
        start_time: startTime,
        end_time: endTime,
        reason,
      })
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
        <h2 style={{ fontSize: 16, marginTop: 0 }}>Request working hours change</h2>
        <p className="muted" style={{ marginTop: 0 }}>
          Ask HR to approve a custom daily window for a date range (e.g. 11:00–20:00).
        </p>
        {error && <div className="error-box">{error}</div>}
        <form onSubmit={submit}>
          <div style={{ display: 'flex', gap: 10 }}>
            <div className="field" style={{ flex: 1 }}>
              <label>From date</label>
              <input type="date" required value={startDate} min={todayStr()} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label>To date</label>
              <input type="date" required value={endDate} min={startDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div className="field" style={{ flex: 1 }}>
              <label>Start time</label>
              <input type="time" required value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label>End time</label>
              <input type="time" required value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
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
      {requests?.length === 0 && <p className="muted">No schedule requests yet.</p>}
      {requests?.map((r) => (
        <div className="card" key={r.id} style={{ padding: 12 }}>
          <div className="row" style={{ marginBottom: 4 }}>
            <strong>
              {r.start_date} → {r.end_date}
            </strong>
            <span className={`status-pill status-${r.status}`}>{r.status}</span>
          </div>
          <p className="muted" style={{ margin: '0 0 4px' }}>
            {fmtTime(r.start_time)} – {fmtTime(r.end_time)}
          </p>
          <p className="muted" style={{ margin: 0 }}>{r.reason}</p>
          {r.decision_note && (
            <p className="muted" style={{ margin: '6px 0 0' }}>
              <strong>HR note:</strong> {r.decision_note}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}
