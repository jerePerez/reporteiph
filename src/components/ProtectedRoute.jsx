import { Navigate } from 'react-router-dom'
import { useAdminAuth } from '../hooks/useAdminAuth'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAdminAuth()

  if (loading) {
    return <div className="p-8 text-center text-on-surface-variant">Verificando sesión...</div>
  }
  if (!user) {
    return <Navigate to="/admin/login" replace />
  }
  return children
}
