import { useEffect, useState } from 'react'
import { API_URL, clearAccessToken, getCurrentUser, login, register, saveAccessToken } from '../lib/api.js'

export function AuthPanel() {
  const [user, setUser] = useState(null)
  const [open, setOpen] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [form, setForm] = useState({ username: '', password: '', displayName: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const googleToken = new URLSearchParams(window.location.search).get('google_token')
    if (googleToken) {
      saveAccessToken(googleToken)
      window.history.replaceState({}, document.title, window.location.pathname)
    }
    if (localStorage.getItem('gatherwell_access_token')) {
      getCurrentUser().then(setUser).catch(clearAccessToken)
    }
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const authenticatedUser = isRegistering
        ? await register(form.username, form.password, form.displayName)
        : await login(form.username, form.password)
      setUser(authenticatedUser)
      setOpen(false)
      setForm({ username: '', password: '', displayName: '' })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  function handleLogout() {
    clearAccessToken()
    setUser(null)
  }

  if (user) {
    return <div className="profile"><span>{user.displayName}</span><button className="profile-avatar" onClick={handleLogout} title="Sign out" type="button">{user.displayName.slice(0, 2).toUpperCase()}</button></div>
  }

  return (
    <div className="auth-control">
      <button className="sign-in-button" onClick={() => setOpen((isOpen) => !isOpen)} type="button">Sign in</button>
      {open && <form className="auth-popover" onSubmit={handleSubmit}>
        <strong>{isRegistering ? 'Create your workspace' : 'Welcome back'}</strong>
        {isRegistering && <input aria-label="Display name" autoComplete="name" onChange={(event) => setForm({ ...form, displayName: event.target.value })} placeholder="Display name" required value={form.displayName} />}
        <input aria-label="Username" autoComplete="username" onChange={(event) => setForm({ ...form, username: event.target.value })} placeholder="Username" required value={form.username} />
        <input aria-label="Password" autoComplete={isRegistering ? 'new-password' : 'current-password'} minLength="8" onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Password" required type="password" value={form.password} />
        {error && <span className="auth-error" role="alert">{error}</span>}
        <button className="auth-submit" disabled={submitting} type="submit">{submitting ? 'Working...' : isRegistering ? 'Create account' : 'Sign in'}</button>
        {!isRegistering && <button className="google-button" onClick={() => { window.location.href = `${API_URL}/api/auth/google` }} type="button"><span>G</span> Continue with Google</button>}
        <button className="auth-switch" onClick={() => { setError(''); setIsRegistering((value) => !value) }} type="button">{isRegistering ? 'Already have an account?' : 'Create an account'}</button>
      </form>}
    </div>
  )
}
