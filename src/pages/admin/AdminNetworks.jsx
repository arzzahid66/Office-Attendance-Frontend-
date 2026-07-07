import { useEffect, useState } from 'react'
import { api } from '../../api'

export default function AdminNetworks() {
  const [networks, setNetworks] = useState(null)
  const [error, setError] = useState('')
  const [label, setLabel] = useState('')
  const [ip, setIp] = useState('')
  const [busy, setBusy] = useState(false)

  function load() {
    api
      .get('/admin/office-networks')
      .then(setNetworks)
      .catch((err) => setError(err.message))
  }

  useEffect(load, [])

  async function addNetwork(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await api.post('/admin/office-networks', { label, public_ip: ip, active: true })
      setLabel('')
      setIp('')
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function addCurrentIp() {
    setError('')
    setBusy(true)
    try {
      await api.post('/admin/office-networks/add-current-ip')
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function toggleActive(n) {
    try {
      await api.patch(`/admin/office-networks/${n.id}`, { active: !n.active })
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  async function remove(n) {
    try {
      await api.delete(`/admin/office-networks/${n.id}`)
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      {error && <div className="error-box">{error}</div>}

      <button className="btn" onClick={addCurrentIp} disabled={busy} style={{ marginBottom: 14 }}>
        Add my current IP as office network
      </button>

      <div className="card">
        <h2 style={{ fontSize: 15, marginTop: 0 }}>Add network manually</h2>
        <form onSubmit={addNetwork}>
          <div className="field">
            <label>Label</label>
            <input required value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Main office" />
          </div>
          <div className="field">
            <label>Public IP</label>
            <input required value={ip} onChange={(e) => setIp(e.target.value)} placeholder="203.0.113.5" />
          </div>
          <button className="btn secondary" type="submit" disabled={busy}>
            Add network
          </button>
        </form>
      </div>

      <h2 style={{ fontSize: 15, marginBottom: 8 }}>Registered networks</h2>
      {!networks && <p className="muted">Loading…</p>}
      {networks?.length === 0 && <p className="muted">No office networks registered yet.</p>}
      {networks?.map((n) => (
        <div className="card" key={n.id} style={{ padding: 12 }}>
          <div className="row" style={{ marginBottom: 4 }}>
            <strong>{n.label}</strong>
            <span className={`status-pill status-${n.active ? 'active' : 'disabled'}`}>{n.active ? 'active' : 'inactive'}</span>
          </div>
          <p className="muted" style={{ margin: '0 0 8px' }}>{n.public_ip}</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn small secondary" onClick={() => toggleActive(n)}>
              {n.active ? 'Deactivate' : 'Activate'}
            </button>
            <button className="btn small danger" onClick={() => remove(n)}>
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
