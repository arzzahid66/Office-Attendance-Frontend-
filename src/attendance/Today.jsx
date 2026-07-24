import { useCallback, useEffect, useState } from 'react'
import { api } from '../services/api'
import { useAuth } from '../auth/AuthContext'
import Popup from '../components/Popup'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const hhmm = (t) => (t ? t.slice(0, 5) : '')
const clock = (iso) =>
  iso ? new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—'

const NEEDLOC_KEY = 'needloc_dismissed_at'
const HOUR = 60 * 60 * 1000

export default function Today() {
  const { user } = useAuth()
  const roster = user?.assigned_roster
  const [resp, setResp] = useState(null)
  const [error, setError] = useState('')
  const [locBusy, setLocBusy] = useState(false)
  const [needLocHidden, setNeedLocHidden] = useState(false)

  const attempt = useCallback(async () => {
    setError('')
    try {
      const r = await api.post('/attendance/checkin-attempt')
      setResp(r)
      if (r.state === 'need_location') {
        const last = Number(localStorage.getItem(NEEDLOC_KEY) || 0)
        setNeedLocHidden(Date.now() - last < HOUR)
      } else {
        setNeedLocHidden(false)
      }
    } catch (e) {
      setError(e.message)
    }
  }, [])

  useEffect(() => {
    attempt()
    // Called on app open, on regaining visibility, and on network reconnect — the server
    // decides the outcome each time.
    const onVis = () => document.visibilityState === 'visible' && attempt()
    const onOnline = () => attempt()
    document.addEventListener('visibilitychange', onVis)
    window.addEventListener('online', onOnline)
    return () => {
      document.removeEventListener('visibilitychange', onVis)
      window.removeEventListener('online', onOnline)
    }
  }, [attempt])

  function shareLocation() {
    setError('')
    if (!navigator.geolocation) {
      setError('Location is not supported on this device.')
      return
    }
    setLocBusy(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const r = await api.post('/attendance/verify-location', {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          })
          setResp(r)
          setNeedLocHidden(false)
        } catch (e) {
          setError(e.message)
        } finally {
          setLocBusy(false)
        }
      },
      (err) => {
        setLocBusy(false)
        setError(
          err.code === err.PERMISSION_DENIED
            ? 'Location permission denied. Enable it to check in.'
            : 'Could not get your location. Move near a window and retry.',
        )
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    )
  }

  function dismissNeedLoc() {
    localStorage.setItem(NEEDLOC_KEY, String(Date.now()))
    setNeedLocHidden(true)
  }

  const state = resp?.state
  const checkedIn = state === 'checked_in' || state === 'already_checked_in'
  const methodBadge =
    resp?.method === 'wifi'
      ? { cls: 'status-present', text: 'WiFi · verified' }
      : resp?.method === 'gps'
        ? { cls: 'status-flagged', text: 'GPS · pending' }
        : null

  return (
    <div>
      {error && <div className="error-box">{error}</div>}

      <div className="card">
        <div className="row" style={{ marginBottom: 2 }}>
          <strong>Today</strong>
          {roster && (
            <span className="muted">
              {hhmm(roster.start_time)}–{hhmm(roster.end_time)}
            </span>
          )}
        </div>
        {roster ? (
          <p className="muted" style={{ marginTop: 0 }}>
            {roster.name} · {roster.working_days.map((d) => DAYS[d]).join(' ')}
          </p>
        ) : (
          <p className="muted" style={{ marginTop: 0 }}>No roster assigned</p>
        )}

        {checkedIn ? (
          <>
            <div className="row">
              <span className="muted">Status</span>
              <span className={`status-pill status-${resp.status}`}>{resp.status}</span>
            </div>
            <div className="row">
              <span className="muted">Checked in</span>
              <span>{clock(resp.check_in)}</span>
            </div>
            {methodBadge && (
              <div className="row">
                <span className="muted">Method</span>
                <span className={`status-pill ${methodBadge.cls}`}>{methodBadge.text}</span>
              </div>
            )}
            {resp.late_minutes > 0 && (
              <div className="row" style={{ marginBottom: 0 }}>
                <span className="muted">Late by</span>
                <span>{resp.late_minutes} min</span>
              </div>
            )}
          </>
        ) : (
          <div className="row" style={{ marginBottom: 0 }}>
            <span className="muted">Status</span>
            <span>{state ? 'Not checked in' : 'Checking…'}</span>
          </div>
        )}
      </div>

      {/* Non-blocking popups, one per state. All dismissible; dismissing never penalizes. */}
      {state === 'off_day' && <Popup tone="info" title="Day off">{resp.message}</Popup>}

      {state === 'before_shift' && <Popup tone="info" title="Not started yet">{resp.message}</Popup>}

      {state === 'after_shift' && <Popup tone="info" title="Shift over">{resp.message}</Popup>}

      {state === 'no_roster' && <Popup tone="warn" title="No roster">{resp.message}</Popup>}

      {state === 'need_location' && !needLocHidden && (
        <Popup
          tone="warn"
          title="Verify your location"
          onClose={dismissNeedLoc}
          actions={
            <>
              <button className="btn small" onClick={shareLocation} disabled={locBusy}>
                {locBusy ? 'Locating…' : 'Share location'}
              </button>
              <button className="btn small secondary" onClick={dismissNeedLoc} disabled={locBusy}>
                Not now
              </button>
            </>
          }
        >
          {resp.message}
        </Popup>
      )}

      {state === 'outside_radius' && (
        <Popup
          tone="error"
          title="Too far from office"
          actions={
            <button className="btn small" onClick={shareLocation} disabled={locBusy}>
              {locBusy ? 'Locating…' : 'Retry'}
            </button>
          }
        >
          {resp.message}
        </Popup>
      )}

      {state === 'low_accuracy' && (
        <Popup
          tone="error"
          title="Weak location signal"
          actions={
            <button className="btn small" onClick={shareLocation} disabled={locBusy}>
              {locBusy ? 'Locating…' : 'Retry'}
            </button>
          }
        >
          {resp.message}
        </Popup>
      )}

      {/* Manual retry for the WiFi path (e.g. after connecting to office WiFi). */}
      {!checkedIn && state && state !== 'off_day' && state !== 'before_shift' && state !== 'after_shift' && (
        <button className="btn secondary" onClick={attempt} style={{ marginTop: 4 }}>
          Retry check-in
        </button>
      )}
    </div>
  )
}
