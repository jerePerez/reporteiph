import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import MachineCard from '../components/MachineCard'
import { generateReportPDF } from '../utils/pdfGenerator'
import { sendReportEmail } from '../utils/formspree'
import Loader from '../components/Loader'

export default function Dashboard() {
  const { grid } = useParams()
  const [allMachines, setAllMachines] = useState([])
  const [loading, setLoading] = useState(true)
  const [sessionData, setSessionData] = useState({})
  const [technician, setTechnician] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState(null)

  useEffect(() => {
    loadMachines()
  }, [])

  async function loadMachines() {
    setLoading(true)
    const snap = await getDocs(collection(db, 'machines'))
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    list.sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
    setAllMachines(list)
    setLoading(false)
  }

  const machines = allMachines.filter((m) => String(m.grid) === String(grid))

  function handleToggle(machineId, itemId) {
    setSessionData((prev) => {
      const current = prev[machineId] || { items: {}, comments: '' }
      return {
        ...prev,
        [machineId]: {
          ...current,
          items: { ...current.items, [itemId]: !current.items[itemId] },
        },
      }
    })
  }

  function handleComment(machineId, value) {
    setSessionData((prev) => ({
      ...prev,
      [machineId]: { ...(prev[machineId] || { items: {} }), comments: value },
    }))
  }

  function buildReportPayload() {
    const sectors = machines.map((machine) => {
      const state = sessionData[machine.id] || { items: {}, comments: '' }
      const items = (machine.items || []).map((item) => ({
        id: item.id,
        label: item.label,
        verified: !!state.items[item.id],
      }))
      const status = items.length > 0 && items.every((i) => i.verified) ? 'OK' : 'PENDIENTE'
      return {
        machineId: machine.id,
        machineName: machine.name,
        items,
        comments: state.comments || '',
        status,
      }
    })
    return {
      technician: technician || 'Sin especificar',
      grid,
      date: new Date().toISOString(),
      sectors,
    }
  }

  async function handleSubmit() {
    setSubmitting(true)
    setFeedback(null)
    try {
      const payload = buildReportPayload()
      const docRef = await addDoc(collection(db, 'reports'), {
        ...payload,
        createdAt: serverTimestamp(),
      })
      setFeedback({
        type: 'success',
        message: 'Reporte guardado correctamente.',
        reportId: docRef.id,
        payload,
      })
      setSessionData({})
    } catch (err) {
      console.error(err)
      setFeedback({ type: 'error', message: 'Error al guardar el reporte: ' + err.message })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSendEmail() {
    if (!feedback?.payload) return
    try {
      await sendReportEmail(feedback.payload)
      setFeedback((prev) => ({ ...prev, message: prev.message + ' Enviado por email.' }))
    } catch (err) {
      setFeedback((prev) => ({ ...prev, message: prev.message + ' (Error al enviar email: ' + err.message + ')' }))
    }
  }

  function handleDownloadPDF() {
    if (!feedback?.payload) return
    generateReportPDF(feedback.payload)
  }

  if (loading) {
    return <Loader label="Cargando máquinas..." />
  }

  return (
    <section>
      <div className="mb-4">
        <Link to="/" className="text-label-sm font-label-md text-primary hover:underline inline-flex items-center gap-1">
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Cambiar cuadrícula
        </Link>
      </div>

      <header className="mb-8 flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h2 className="text-headline-lg font-headline-lg text-on-surface">Inspección de Turno — Cuadrícula {grid}</h2>
          <p className="text-body-md text-on-surface-variant">
            Completá el listado de verificación.
          </p>
        </div>
        <input
          type="text"
          placeholder="Nombre"
          value={technician}
          onChange={(e) => setTechnician(e.target.value)}
          className="bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 text-body-md outline-none focus:ring-2 focus:ring-primary"
        />
      </header>

      {machines.length === 0 ? (
        <p className="text-on-surface-variant">
          No hay máquinas cargadas en esta cuadrícula. Ingresá al módulo Administrador para asignarlas.
        </p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {machines.map((machine) => (
            <MachineCard
              key={machine.id}
              machine={machine}
              state={sessionData[machine.id]}
              onToggle={handleToggle}
              onComment={handleComment}
            />
          ))}
        </div>
      )}

      <div className="mt-12 p-8 bg-surface-container rounded-xl border border-dashed border-outline flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary-container/20 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-3xl">cloud_upload</span>
          </div>
          <div>
            <h4 className="text-headline-md font-headline-md text-on-surface">Finalizar Reporte</h4>
            <p className="text-label-sm font-label-sm text-on-surface-variant uppercase">
              INTERFAZ DE REPORTE
            </p>
          </div>
        </div>
        <button
          disabled={submitting || machines.length === 0}
          onClick={handleSubmit}
          className="w-full md:w-auto bg-primary text-white px-12 py-4 rounded-xl text-headline-md font-bold uppercase tracking-widest hover:bg-primary-container transition-all active:scale-95 shadow-lg shadow-primary/20 disabled:opacity-50"
        >
          {submitting ? 'Guardando...' : 'Enviar Reporte'}
        </button>
      </div>

      {feedback && (
        <div
          className={`mt-6 p-4 rounded-lg border ${feedback.type === 'success' ? 'border-status-success bg-status-success/10' : 'border-status-critical bg-status-critical/10'
            }`}
        >
          <p className="text-body-md">{feedback.message}</p>
          {feedback.type === 'success' && (
            <div className="flex gap-3 mt-3">
              <button
                onClick={handleDownloadPDF}
                className="border-2 border-primary text-primary px-4 py-2 rounded-lg font-label-md hover:bg-primary-fixed transition-colors"
              >
                Descargar PDF
              </button>
              <button
                onClick={handleSendEmail}
                className="bg-primary text-on-primary px-4 py-2 rounded-lg font-label-md hover:bg-primary-container transition-all"
              >
                Enviar por email
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  )
}