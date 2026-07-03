import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { generateReportPDF } from '../utils/pdfGenerator'

export default function ReportDetail() {
  const { id } = useParams()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      const snap = await getDoc(doc(db, 'reports', id))
      if (snap.exists()) setReport({ id: snap.id, ...snap.data() })
      setLoading(false)
    })()
  }, [id])

  if (loading) return <div className="p-8 text-center text-on-surface-variant">Cargando reporte...</div>
  if (!report)
    return (
      <p className="text-on-surface-variant">
        Reporte no encontrado.{' '}
        <Link to="/reportes" className="text-primary">
          Volver
        </Link>
      </p>
    )

  return (
    <section>
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-headline-lg font-headline-lg text-on-surface">
            Reporte del {new Date(report.date).toLocaleString('es-AR')}
          </h2>
          <p className="text-body-md text-on-surface-variant">Técnico: {report.technician}</p>
        </div>
        <button
          onClick={() => generateReportPDF(report)}
          className="bg-primary text-on-primary px-6 py-2 rounded-lg font-label-md hover:bg-primary-container transition-all"
        >
          Descargar PDF
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {report.sectors?.map((sector) => (
          <div
            key={sector.machineId}
            className={`bg-surface border border-outline-variant rounded-lg p-6 ${
              sector.status === 'OK' ? 'card-accent-success' : 'card-accent-pending'
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-headline-md font-headline-md text-primary">{sector.machineName}</h3>
              <span
                className={`text-label-sm font-label-sm px-3 py-1 rounded-full ${
                  sector.status === 'OK'
                    ? 'bg-status-success/10 text-status-success border border-status-success'
                    : 'bg-primary-fixed text-on-primary-fixed'
                }`}
              >
                {sector.status === 'OK' ? 'INSPECTION OK' : 'INSPECTION PENDING'}
              </span>
            </div>
            <ul className="space-y-2 mb-4">
              {sector.items.map((item) => (
                <li key={item.id} className="flex justify-between text-body-md">
                  <span>{item.label}</span>
                  <span className={item.verified ? 'text-status-success' : 'text-status-critical'}>
                    {item.verified ? 'VERIFICADO' : 'PENDIENTE'}
                  </span>
                </li>
              ))}
            </ul>
            {sector.comments && (
              <p className="text-label-sm text-on-surface-variant italic border-t border-outline-variant pt-3">
                {sector.comments}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
