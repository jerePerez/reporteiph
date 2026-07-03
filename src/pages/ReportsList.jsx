import { useEffect, useState } from 'react'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '../firebase'
import { Link } from 'react-router-dom'

export default function ReportsList() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'))
      const snap = await getDocs(q)
      setReports(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })()
  }, [])

  if (loading) return <div className="p-8 text-center text-on-surface-variant">Cargando reportes...</div>

  return (
    <section>
      <h2 className="text-headline-lg font-headline-lg text-on-surface mb-8">Reportes Guardados</h2>
      {reports.length === 0 ? (
        <p className="text-on-surface-variant">Todavía no hay reportes enviados.</p>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => {
            const allOk = r.sectors?.every((s) => s.status === 'OK')
            return (
              <Link
                key={r.id}
                to={`/reportes/${r.id}`}
                className="flex justify-between items-center bg-surface border border-outline-variant rounded-lg p-4 hover:border-primary transition-all"
              >
                <div>
                  <p className="text-label-md font-label-md text-on-surface">
                    {new Date(r.date).toLocaleString('es-AR')}
                  </p>
                  <p className="text-label-sm text-on-surface-variant">
                    Técnico: {r.technician} · {r.sectors?.length || 0} sectores
                  </p>
                </div>
                <span
                  className={`text-label-sm font-label-sm px-3 py-1 rounded-full ${
                    allOk
                      ? 'bg-status-success/10 text-status-success border border-status-success'
                      : 'bg-primary-fixed text-on-primary-fixed'
                  }`}
                >
                  {allOk ? 'OK' : 'CON PENDIENTES'}
                </span>
              </Link>
            )
          })}
        </div>
      )}
    </section>
  )
}
