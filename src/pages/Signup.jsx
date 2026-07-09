import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { api } from '../api'
import ThemeToggle from '../components/ThemeToggle'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const hhmm = (t) => (t ? t.slice(0, 5) : '')

export default function Signup() {
  const { signup } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [department, setDepartment] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [city, setCity] = useState('')
  const [password, setPassword] = useState('')
  const [rosters, setRosters] = useState([])
  const [rosterId, setRosterId] = useState(null)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    api
      .get('/rosters')
      .then((rs) => {
        setRosters(rs)
        const def = rs.find((r) => r.is_default) || rs[0]
        if (def) setRosterId(def.id)
      })
      .catch(() => {})
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await signup({
        name,
        email,
        phone,
        password,
        department,
        job_title: jobTitle,
        city,
        requested_roster_id: rosterId,
      })
      setDone(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    return (
      <div className="center-page">
        <div style={{ position: 'absolute', top: 16, right: 16 }}><ThemeToggle /></div>
        <div className="auth-card">
          <h1>Account created</h1>
          <div className="info-box">
            Your account is pending admin approval. You'll be able to sign in once an admin activates it.
          </div>
          <Link to="/login">
            <button className="btn secondary" type="button">Back to login</button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="center-page">
      <div style={{ position: 'absolute', top: 16, right: 16 }}><ThemeToggle /></div>
      <div className="auth-card">
        <h1>Create account</h1>
        <p className="muted">Sign up as an employee</p>
        {error && <div className="error-box">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Full name</label>
            <input required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="field">
            <label>Phone</label>
            <input type="tel" required value={phone} placeholder="+92 3xx xxxxxxx" onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="field">
            <label>Department</label>
            <input required value={department} placeholder="e.g. Engineering" onChange={(e) => setDepartment(e.target.value)} />
          </div>
          <div className="field">
            <label>Job title</label>
            <input required value={jobTitle} placeholder="e.g. Senior Developer" onChange={(e) => setJobTitle(e.target.value)} />
          </div>
          <div className="field">
            <label>City</label>
            <input required value={city} placeholder="e.g. Lahore" onChange={(e) => setCity(e.target.value)} />
          </div>

          <div className="field">
            <label>Preferred shift</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {rosters.map((r) => (
                <label
                  key={r.id}
                  className="card"
                  style={{ display: 'flex', gap: 10, alignItems: 'center', padding: 12, margin: 0, cursor: 'pointer' }}
                >
                  <input
                    type="radio"
                    name="roster"
                    style={{ width: 'auto', margin: 0 }}
                    checked={rosterId === r.id}
                    onChange={() => setRosterId(r.id)}
                  />
                  <span>
                    <strong>{r.name}</strong> {hhmm(r.start_time)}–{hhmm(r.end_time)}
                    <br />
                    <span className="muted" style={{ fontSize: 12 }}>
                      {r.working_days.map((d) => DAYS[d]).join(' · ')}
                    </span>
                  </span>
                </label>
              ))}
              {rosters.length === 0 && <p className="muted">No shifts configured yet — contact admin.</p>}
            </div>
          </div>

          <div className="field">
            <label>Password</label>
            <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button className="btn" type="submit" disabled={busy || !rosterId}>
            {busy ? 'Creating…' : 'Sign up'}
          </button>
        </form>
        <p className="muted" style={{ marginTop: 16, textAlign: 'center' }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
