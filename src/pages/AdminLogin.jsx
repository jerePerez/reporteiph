import { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase'
import { useNavigate } from 'react-router-dom'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigate('/admin')
    } catch (err) {
      setError('Credenciales incorrectas o usuario no habilitado.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-16 bg-surface border border-outline-variant rounded-xl p-8">
      <h2 className="text-headline-lg font-headline-lg mb-6 text-on-surface">Ingreso Administrador</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
          required
        />
        {error && <p className="text-status-critical text-label-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="bg-primary text-on-primary py-3 rounded-lg font-label-md hover:bg-primary-container transition-all disabled:opacity-50"
        >
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
      {/* <p className="text-label-sm text-on-surface-variant mt-4">
        El usuario administrador se crea desde Firebase Console &gt; Authentication &gt; Users.
      </p> */}
    </div>
  )
}
