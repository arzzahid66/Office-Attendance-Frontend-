import { useEffect, useState } from 'react'
import { api } from '../../api'

export default function AdminEmployees() {
  const [employees, setEmployees] = useState(null)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [devices, setDevices] = useState(null)
  const [busyId, setBusyId] = useState(null)

  function load() {
    api
      .get('/admin/employees')
      .then(setEmployees)
      .catch((err) => setError(err.message))
  }

  useEffect(load, [])

  async function act(id, action) {
    setBusyId(id)
    setError('')
    try {
      await api.post(`/admin/employees/${id}/${action}`)
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  async function toggleDevices(id) {
    if (expandedId === id) {
      setExpandedId(null)
      setDevices(null)
      return
    }
    setExpandedId(id)
    setDevices(null)
    try {
      const list = await api.get(`/admin/employees/${id}/devices`)
      setDevices(list)
    } catch (err) {
      setError(err.message)
    }
  }

  async function revokeDevice(employeeId, deviceId) {
    try {
      await api.post(`/admin/employees/${employeeId}/devices/${deviceId}/revoke`)
      const list = await api.get(`/admin/employees/${employeeId}/devices`)
      setDevices(list)
    } catch (err) {
      setError(err.message)
    }
  }

  if (error) return <div className="error-box">{error}</div>
  if (!employees) return <div className="muted">Loading…</div>

  return (
    <div>
      <h2 style={{ fontSize: 16, marginTop: 0 }}>Employees</h2>
      {employees.length === 0 && <p className="muted">No employees yet.</p>}
      {employees.map((e) => (
        <div className="card" key={e.id} style={{ padding: 12 }}>
          <div className="row" style={{ marginBottom: 4 }}>
            <strong>{e.name}</strong>
            <span className={`status-pill status-${e.status}`}>{e.status}</span>
          </div>
          <p className="muted" style={{ margin: '0 0 2px' }}>
            {e.job_title || '—'} · {e.department || '—'} · {e.city || '—'}
          </p>
          <p className="muted" style={{ margin: '0 0 8px' }}>
            {e.email} · {e.active_device_count} device(s)
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {e.status === 'pending' && (
              <button className="btn small" disabled={busyId === e.id} onClick={() => act(e.id, 'approve')}>
                Approve
              </button>
            )}
            {e.status !== 'disabled' && (
              <button className="btn small danger" disabled={busyId === e.id} onClick={() => act(e.id, 'disable')}>
                Disable
              </button>
            )}
            {e.status === 'disabled' && (
              <button className="btn small secondary" disabled={busyId === e.id} onClick={() => act(e.id, 'enable')}>
                Enable
              </button>
            )}
            <button className="btn small secondary" onClick={() => toggleDevices(e.id)}>
              {expandedId === e.id ? 'Hide devices' : 'View devices'}
            </button>
          </div>

          {expandedId === e.id && (
            <div style={{ marginTop: 10 }}>
              {devices === null && <p className="muted">Loading devices…</p>}
              {devices?.length === 0 && <p className="muted">No devices registered.</p>}
              {devices?.map((d) => (
                <div className="row" key={d.id}>
                  <span className="muted">
                    {d.platform || 'Unknown device'} — <span className={`status-pill status-${d.status}`}>{d.status}</span>
                  </span>
                  {d.status === 'active' && (
                    <button className="link-btn" onClick={() => revokeDevice(e.id, d.id)}>
                      Revoke
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
