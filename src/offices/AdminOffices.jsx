import { useCallback, useEffect, useState } from 'react'
import { api } from '../services/api'

const BLANK = { name: '', latitude: '', longitude: '', radius_meters: 80, timezone: 'Asia/Karachi' }

export default function AdminOffices() {
  const [offices, setOffices] = useState(null)
  const [detectedIp, setDetectedIp] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState(BLANK)
  const [ipInput, setIpInput] = useState({})

  const load = useCallback(() => {
    setError('')
    api.get('/admin/offices').then(setOffices).catch((e) => setError(e.message))
  }, [])

  useEffect(load, [load])

  async function detect() {
    setError('')
    try {
      const r = await api.get('/admin/offices/current-ip')
      setDetectedIp(r.detected_ip)
    } catch (e) {
      setError(e.message)
    }
  }

  async function act(fn) {
    setError('')
    try {
      await fn()
      load()
    } catch (e) {
      setError(e.message) // 409 / 422 messages surface verbatim
    }
  }

  async function create(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await api.post('/admin/offices', {
        name: form.name,
        latitude: form.latitude === '' ? null : Number(form.latitude),
        longitude: form.longitude === '' ? null : Number(form.longitude),
        radius_meters: Number(form.radius_meters),
        timezone: form.timezone,
      })
      setForm(BLANK)
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (!offices) return <div className="muted">Loading…</div>

  return (
    <div>
      <h2 style={{ fontSize: 16, marginTop: 0 }}>Offices</h2>
      {error && <div className="error-box">{error}</div>}

      <div className="card" style={{ padding: 12 }}>
        <div className="row" style={{ marginBottom: 6 }}>
          <span className="muted">Your detected public IP</span>
          <strong>{detectedIp || '—'}</strong>
        </div>
        <button className="btn small secondary" onClick={detect}>Detect my IP</button>
      </div>

      {offices.map((o) => (
        <div className="card" key={o.id}>
          <div className="row" style={{ marginBottom: 2 }}>
            <strong>{o.name}</strong>
            <span className={`status-pill ${o.active ? 'status-active' : 'status-disabled'}`}>
              {o.active ? 'active' : 'inactive'}
            </span>
          </div>
          <p className="muted" style={{ margin: '0 0 8px' }}>
            {o.latitude == null || o.longitude == null
              ? 'No coordinates set — GPS check-in will not work'
              : `${o.latitude}, ${o.longitude}`}{' '}
            · radius {o.radius_meters}m · {o.timezone}
          </p>

          <div className="field">
            <label>Coordinates & radius</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input placeholder="latitude" defaultValue={o.latitude ?? ''} id={`lat-${o.id}`} />
              <input placeholder="longitude" defaultValue={o.longitude ?? ''} id={`lng-${o.id}`} />
              <input type="number" placeholder="radius m" defaultValue={o.radius_meters} id={`rad-${o.id}`} />
            </div>
            <button
              className="btn small secondary"
              onClick={() =>
                act(() =>
                  api.patch(`/admin/offices/${o.id}`, {
                    latitude: Number(document.getElementById(`lat-${o.id}`).value),
                    longitude: Number(document.getElementById(`lng-${o.id}`).value),
                    radius_meters: Number(document.getElementById(`rad-${o.id}`).value),
                  }),
                )
              }
            >
              Save location
            </button>
          </div>

          <div className="field">
            <label>Public IPs ({o.public_ips.length})</label>
            {o.public_ips.length === 0 && <p className="muted" style={{ margin: '0 0 6px' }}>None — WiFi check-in will never match.</p>}
            {o.public_ips.map((ip) => (
              <div className="row" key={ip}>
                <span>{ip}</span>
                <button className="link-btn" onClick={() => act(() => api.delete(`/admin/offices/${o.id}/public-ips?ip=${encodeURIComponent(ip)}`))}>
                  Remove
                </button>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <input
                placeholder="e.g. 203.0.113.7"
                value={ipInput[o.id] || ''}
                onChange={(e) => setIpInput({ ...ipInput, [o.id]: e.target.value })}
              />
              <button
                className="btn small secondary"
                onClick={() => act(async () => { await api.post(`/admin/offices/${o.id}/public-ips`, { ip: ipInput[o.id] }); setIpInput({ ...ipInput, [o.id]: '' }) })}
              >
                Add
              </button>
            </div>
            <button className="btn small" style={{ marginTop: 8 }} onClick={() => act(() => api.post(`/admin/offices/${o.id}/add-current-ip`))}>
              Add my current public IP
            </button>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn small secondary" onClick={() => act(() => api.patch(`/admin/offices/${o.id}`, { active: !o.active }))}>
              {o.active ? 'Deactivate' : 'Activate'}
            </button>
            <button className="btn small danger" onClick={() => act(() => api.delete(`/admin/offices/${o.id}`))}>Delete</button>
          </div>
        </div>
      ))}

      <div className="card">
        <h2 style={{ fontSize: 15, marginTop: 0 }}>New office</h2>
        <form onSubmit={create}>
          <div className="field">
            <label>Name</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div className="field" style={{ flex: 1 }}>
              <label>Latitude</label>
              <input value={form.latitude} placeholder="31.5204" onChange={(e) => setForm({ ...form, latitude: e.target.value })} />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label>Longitude</label>
              <input value={form.longitude} placeholder="74.3587" onChange={(e) => setForm({ ...form, longitude: e.target.value })} />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label>Radius (m)</label>
              <input type="number" value={form.radius_meters} onChange={(e) => setForm({ ...form, radius_meters: e.target.value })} />
            </div>
          </div>
          <div className="field">
            <label>Timezone (IANA)</label>
            <input value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })} />
          </div>
          <button className="btn" type="submit" disabled={busy}>{busy ? 'Creating…' : 'Create office'}</button>
        </form>
      </div>
    </div>
  )
}
