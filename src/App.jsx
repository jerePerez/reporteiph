import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import GridSelector from './pages/GridSelector'
import Dashboard from './pages/Dashboard'
import GraserasHome from './pages/GraserasHome'
import GraserasControl from './pages/GraserasControl'
import AdminLogin from './pages/AdminLogin'
import AdminPanel from './pages/AdminPanel'
import AdminGraseras from './pages/AdminGraseras'
import ReportsList from './pages/ReportsList'
import ReportDetail from './pages/ReportDetail'
import ProtectedRoute from './components/ProtectedRoute'
import Loader from './components/Loader'

export default function App() {
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setInitializing(false), 2000)
    return () => clearTimeout(t)
  }, [])

  if (initializing) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <Loader label="Iniciando IPH Cero..." size={80} />
      </div>
    )
  }

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow w-full max-w-max-width mx-auto px-margin-desktop py-8">
        <Routes>
          <Route path="/" element={<GridSelector />} />
          <Route path="/cuadricula/:grid" element={<Dashboard />} />
          <Route path="/graseras" element={<GraserasHome />} />
          <Route path="/graseras/:id" element={<GraserasControl />} />
          <Route path="/reportes" element={<ReportsList />} />
          <Route path="/reportes/:id" element={<ReportDetail />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/graseras"
            element={
              <ProtectedRoute>
                <AdminGraseras />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}