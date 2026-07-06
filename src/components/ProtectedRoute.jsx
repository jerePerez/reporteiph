import { Navigate } from 'react-router-dom'
import { useAdminAuth } from '../hooks/useAdminAuth'
import Loader from './Loader'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAdminAuth()

  if (loading) {
    return <Loader label="Verificando sesión..." />
  }
  if (!user) {
    return <Navigate to="/admin/login" replace />
  }
  return children
}