import { Link, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'
import { useAdminAuth } from '../hooks/useAdminAuth'
import { useEffect, useState } from 'react'
import logo from '../assets/logo.png'

export default function Header() {
  const { user } = useAdminAuth()
  const navigate = useNavigate()
  const [now, setNow] = useState(new Date())
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  async function handleLogout() {
    await signOut(auth)
    setMenuOpen(false)
    navigate('/')
  }

  function closeMenu() {
    setMenuOpen(false)
  }

  return (
    <header className="bg-surface border-b border-outline-variant sticky top-0 z-50">
      <div className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-4 max-w-max-width mx-auto">
        <div className="flex flex-col">
          <Link to="/" onClick={closeMenu} className="flex items-center">
            <img src={logo} alt="IPH CERO" className="h-14 md:h-16 w-auto object-contain" />
          </Link>
          <span className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">
            {now.toLocaleString('es-AR', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>

        {/* Links de navegación: visibles siempre a partir de md */}
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-on-surface-variant hover:text-primary transition-colors font-label-md">
            Inicio
          </Link>
          <Link to="/reportes" className="text-on-surface-variant hover:text-primary transition-colors font-label-md">
            Reportes
          </Link>
          <Link to="/graseras" className="text-on-surface-variant hover:text-primary transition-colors font-label-md">
            Graseras
          </Link>
          {user && (
            <Link to="/admin" className="text-on-surface-variant hover:text-primary transition-colors font-label-md">
              Administrador
            </Link>
          )}
        </nav>

        {/* Botón admin: se oculta en mobile, ahí vive dentro del menú hamburguesa */}
        <div className="hidden md:block">
          {user ? (
            <button
              onClick={handleLogout}
              className="bg-error text-on-error px-6 py-2 rounded-lg font-label-md hover:opacity-90 transition-all active:scale-95"
            >
              Cerrar sesión
            </button>
          ) : (
            <Link
              to="/admin/login"
              className="bg-primary text-on-primary px-6 py-2 rounded-lg font-label-md hover:bg-primary-container transition-all active:scale-95"
            >
              Admin Login
            </Link>
          )}
        </div>

        {/* Botón hamburguesa: solo visible en mobile */}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="md:hidden text-on-surface p-2 -mr-2 rounded-lg hover:bg-surface-container transition-colors"
          aria-label="Abrir menú"
          aria-expanded={menuOpen}
        >
          <span className="material-symbols-outlined text-3xl">{menuOpen ? 'close' : 'menu'}</span>
        </button>
      </div>

      {/* Panel desplegable mobile */}
      {menuOpen && (
        <nav className="md:hidden border-t border-outline-variant bg-surface px-margin-mobile py-4 flex flex-col gap-1">
          <Link
            to="/"
            onClick={closeMenu}
            className="text-on-surface px-3 py-3 rounded-lg hover:bg-surface-container transition-colors font-label-md"
          >
            Inicio
          </Link>
          <Link
            to="/reportes"
            onClick={closeMenu}
            className="text-on-surface px-3 py-3 rounded-lg hover:bg-surface-container transition-colors font-label-md"
          >
            Reportes
          </Link>
          <Link
            to="/graseras"
            onClick={closeMenu}
            className="text-on-surface px-3 py-3 rounded-lg hover:bg-surface-container transition-colors font-label-md"
          >
            Graseras
          </Link>
          {user && (
            <Link
              to="/admin"
              onClick={closeMenu}
              className="text-on-surface px-3 py-3 rounded-lg hover:bg-surface-container transition-colors font-label-md"
            >
              Administrador
            </Link>
          )}

          <div className="mt-2 pt-2 border-t border-outline-variant">
            {user ? (
              <button
                onClick={handleLogout}
                className="w-full bg-error text-on-error px-6 py-3 rounded-lg font-label-md hover:opacity-90 transition-all active:scale-95"
              >
                Cerrar sesión
              </button>
            ) : (
              <Link
                to="/admin/login"
                onClick={closeMenu}
                className="block text-center w-full bg-primary text-on-primary px-6 py-3 rounded-lg font-label-md hover:bg-primary-container transition-all active:scale-95"
              >
                Admin Login
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}