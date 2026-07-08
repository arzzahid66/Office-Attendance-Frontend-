import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import ThemeToggle from '../components/ThemeToggle'

export default function Signup() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [department, setDepartment] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [city, setCity] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await signup({ name, email, password, department, job_title: jobTitle, city })
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
        <div className="auth-card">
          <h1>Account created</h1>
          <div className="info-box">
            Your account is pending admin approval. You'll be able to sign in once an admin activates it.
          </div>
          <Link to="/login">
            <button className="btn secondary" type="button">
              Back to login
            </button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="center-page">
      <div style={{ position: 'absolute', top: 16, right: 16 }}>
        <ThemeToggle />
      </div>
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
            <label>Password</label>
            <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button className="btn" type="submit" disabled={busy}>
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
