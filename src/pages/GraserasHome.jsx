import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import Loader from '../components/Loader'
import { delay } from '../utils/delay'

export default function GraserasHome() {
    const navigate = useNavigate()
    const [enCurso, setEnCurso] = useState([])
    const [finalizados, setFinalizados] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [supervisor, setSupervisor] = useState('')
    const [creating, setCreating] = useState(false)

    useEffect(() => {
        load()
    }, [])

    async function load() {
        setLoading(true)
        const [snap] = await Promise.all([getDocs(collection(db, 'grasera_reports')), delay(600)])
        const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        all.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
        setEnCurso(all.filter((r) => r.status !== 'completo'))
        setFinalizados(all.filter((r) => r.status === 'completo').slice(0, 8))
        setLoading(false)
    }

    async function handleCreate() {
        if (!supervisor.trim()) {
            alert('Ingresá el nombre del supervisor.')
            return
        }
        setCreating(true)
        try {
            const graserasSnap = await getDocs(collection(db, 'graseras'))
            const list = graserasSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
            list.sort((a, b) => (a.order ?? 999) - (b.order ?? 999))

            if (list.length === 0) {
                alert('Todavía no hay graseras cargadas. Pedile a un administrador que las cargue desde Administrador > Graseras.')
                setCreating(false)
                return
            }

            const items = {}
            list.forEach((g) => {
                items[g.id] = {
                    codigo: g.codigo,
                    temperaturaObjetivo: g.temperaturaObjetivo || '',
                    calentador: g.calentador || '',
                    order: g.order ?? 0,
                    r1: null,
                    r1Hora: null,
                    r2: null,
                    r2Hora: null,
                    observaciones: '',
                }
            })

            const docRef = await addDoc(collection(db, 'grasera_reports'), {
                supervisor: supervisor.trim(),
                fecha: new Date().toISOString(),
                status: 'ronda1',
                ronda1ClosedAt: null,
                ronda2ClosedAt: null,
                items,
                createdAt: serverTimestamp(),
            })
            navigate(`/graseras/${docRef.id}`)
        } catch (err) {
            alert('Error al crear el control: ' + err.message)
            setCreating(false)
        }
    }

    if (loading) return <Loader label="Cargando controles..." />

    return (
        <section>
            <header className="mb-8">
                <h2 className="text-headline-lg font-headline-lg text-on-surface">Control de Graseras</h2>
                <p className="text-body-md text-on-surface-variant">
                    Encendido y control de temperatura de graseras para el fin de semana.
                </p>
            </header>

            {!showForm ? (
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-primary text-on-primary px-6 py-3 rounded-xl font-label-md hover:bg-primary-container transition-all mb-8"
                >
                    + Nuevo Control de Graseras
                </button>
            ) : (
                <div className="bg-surface border border-outline-variant rounded-lg p-6 mb-8 max-w-md">
                    <label className="text-label-sm font-label-md text-on-surface-variant block mb-2">Nombre del supervisor</label>
                    <input
                        value={supervisor}
                        onChange={(e) => setSupervisor(e.target.value)}
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-primary mb-4"
                        placeholder="Ej: Jere"
                    />
                    <div className="flex gap-3">
                        <button
                            onClick={handleCreate}
                            disabled={creating}
                            className="bg-primary text-on-primary px-6 py-2 rounded-lg font-label-md hover:bg-primary-container transition-all disabled:opacity-50"
                        >
                            {creating ? 'Creando...' : 'Iniciar Primera Vuelta'}
                        </button>
                        <button
                            onClick={() => setShowForm(false)}
                            className="border-2 border-outline-variant text-on-surface-variant px-6 py-2 rounded-lg font-label-md hover:bg-surface-container transition-all"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

            {enCurso.length > 0 && (
                <div className="mb-10">
                    <h3 className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider mb-3">
                        Controles en curso
                    </h3>
                    <div className="space-y-3">
                        {enCurso.map((r) => (
                            <Link
                                key={r.id}
                                to={`/graseras/${r.id}`}
                                className="flex justify-between items-center bg-surface border border-outline-variant rounded-lg p-4 hover:border-primary transition-all"
                            >
                                <div>
                                    <p className="text-label-md font-label-md text-on-surface">{new Date(r.fecha).toLocaleString('es-AR')}</p>
                                    <p className="text-label-sm text-on-surface-variant">Supervisor: {r.supervisor}</p>
                                </div>
                                <span className="text-label-sm font-label-sm px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed">
                                    {r.status === 'ronda1' ? 'RONDA 1 ABIERTA' : 'RONDA 2 ABIERTA'}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {finalizados.length > 0 && (
                <div>
                    <h3 className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider mb-3">
                        Últimos controles finalizados
                    </h3>
                    <div className="space-y-3">
                        {finalizados.map((r) => (
                            <Link
                                key={r.id}
                                to={`/graseras/${r.id}`}
                                className="flex justify-between items-center bg-surface border border-outline-variant rounded-lg p-4 hover:border-primary transition-all"
                            >
                                <div>
                                    <p className="text-label-md font-label-md text-on-surface">{new Date(r.fecha).toLocaleString('es-AR')}</p>
                                    <p className="text-label-sm text-on-surface-variant">Supervisor: {r.supervisor}</p>
                                </div>
                                <span className="text-label-sm font-label-sm px-3 py-1 rounded-full bg-status-success/10 text-status-success border border-status-success">
                                    COMPLETO
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {enCurso.length === 0 && finalizados.length === 0 && (
                <p className="text-on-surface-variant">Todavía no se registró ningún control de graseras.</p>
            )}
        </section>
    )
}