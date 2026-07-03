import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Dashboard from './pages/Dashboard'
import AdminLogin from './pages/AdminLogin'
import AdminPanel from './pages/AdminPanel'
import ReportsList from './pages/ReportsList'
import ReportDetail from './pages/ReportDetail'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow w-full max-w-max-width mx-auto px-margin-desktop py-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
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
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
