import { useEffect, useState } from 'react'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, writeBatch } from 'firebase/firestore'
import { db } from '../firebase'
import Loader from '../components/Loader'
import { delay } from '../utils/delay'
import { GRASERAS_SEED } from '../utils/graserasSeedData'

export default function AdminGraseras() {
    const [graseras, setGraseras] = useState([])
    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState(null)
    const [importing, setImporting] = useState(false)

    useEffect(() => {
        load()
    }, [])

    async function load() {
        setLoading(true)
        const [snap] = await Promise.all([getDocs(collection(db, 'graseras')), delay(600)])
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        list.sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
        setGraseras(list)
        setLoading(false)
    }

    function startNew() {
        const nextOrder = graseras.length > 0 ? Math.max(...graseras.map((g) => g.order ?? 0)) + 1 : 1
        setEditing({ codigo: '', temperaturaObjetivo: '', calentador: '', order: nextOrder })
    }

    function startEdit(g) {
        setEditing({ ...g })
    }

    async function handleDelete(id) {
        if (!confirm('¿Eliminar esta grasera de la lista? Esta acción no se puede deshacer.')) return
        await deleteDoc(doc(db, 'graseras', id))
        load()
    }

    async function handleSave() {
        if (!editing.codigo.trim()) {
            alert('El código es obligatorio (ej: TU23).')
            return
        }
        const payload = {
            codigo: editing.codigo.trim(),
            temperaturaObjetivo: editing.temperaturaObjetivo?.trim() || '',
            calentador: editing.calentador?.trim() || '',
            order: Number(editing.order) || 0,
        }
        if (editing.id) {
            await updateDoc(doc(db, 'graseras', editing.id), payload)
        } else {
            await addDoc(collection(db, 'graseras'), payload)
        }
        setEditing(null)
        load()
    }

    async function handleImport() {
        if (
            !confirm(
                `Se van a agregar ${GRASERAS_SEED.length} graseras según la planilla. Si ya cargaste algunas manualmente, esto puede duplicarlas. ¿Continuar?`
            )
        )
            return
        setImporting(true)
        const batch = writeBatch(db)
        GRASERAS_SEED.forEach((item, idx) => {
            const ref = doc(collection(db, 'graseras'))
            batch.set(ref, {
                codigo: item.codigo,
                temperaturaObjetivo: item.temp,
                calentador: item.calentador,
                order: idx + 1,
            })
        })
        await batch.commit()
        setImporting(false)
        load()
    }

    if (loading) return <Loader label="Cargando graseras..." />

    return (
        <section>
            <header className="mb-8 flex flex-col md:flex-row justify-between md:items-center gap-4">
                <h2 className="text-headline-lg font-headline-lg text-on-surface">Administrador de Graseras</h2>
                {!editing && (
                    <div className="flex gap-3">
                        <button
                            onClick={handleImport}
                            disabled={importing}
                            className="border-2 border-primary text-primary px-6 py-2 rounded-lg font-label-md hover:bg-primary-fixed transition-colors disabled:opacity-50"
                        >
                            {importing ? 'Importando...' : 'Cargar planilla completa'}
                        </button>
                        <button
                            onClick={startNew}
                            className="bg-primary text-on-primary px-6 py-2 rounded-lg font-label-md hover:bg-primary-container transition-all"
                        >
                            + Nueva Grasera
                        </button>
                    </div>
                )}
            </header>

            {editing ? (
                <div className="bg-surface border border-outline-variant rounded-lg p-6 max-w-xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="text-label-sm font-label-md text-on-surface-variant block mb-2">Código (ej: TU23)</label>
                            <input
                                value={editing.codigo}
                                onChange={(e) => setEditing({ ...editing, codigo: e.target.value })}
                                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label className="text-label-sm font-label-md text-on-surface-variant block mb-2">Orden</label>
                            <input
                                type="number"
                                value={editing.order}
                                onChange={(e) => setEditing({ ...editing, order: e.target.value })}
                                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label className="text-label-sm font-label-md text-on-surface-variant block mb-2">Temperatura objetivo</label>
                            <input
                                value={editing.temperaturaObjetivo}
                                onChange={(e) => setEditing({ ...editing, temperaturaObjetivo: e.target.value })}
                                placeholder="Ej: 100, 90, Fijo, o vacío"
                                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label className="text-label-sm font-label-md text-on-surface-variant block mb-2">N° Calentador (opcional)</label>
                            <input
                                value={editing.calentador}
                                onChange={(e) => setEditing({ ...editing, calentador: e.target.value })}
                                placeholder="Ej: 1, 9/10, o vacío"
                                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleSave}
                            className="bg-primary text-on-primary px-6 py-2 rounded-lg font-label-md hover:bg-primary-container transition-all"
                        >
                            Guardar
                        </button>
                        <button
                            onClick={() => setEditing(null)}
                            className="border-2 border-outline-variant text-on-surface-variant px-6 py-2 rounded-lg font-label-md hover:bg-surface-container transition-all"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            ) : (
                <div className="bg-surface border border-outline-variant rounded-lg overflow-hidden">
                    {graseras.length === 0 ? (
                        <p className="p-6 text-on-surface-variant">
                            No hay graseras cargadas todavía. Usá "Cargar planilla completa" para importar la lista de la planta
                            de una vez, o "Nueva Grasera" para cargarlas una por una.
                        </p>
                    ) : (
                        <ul className="divide-y divide-outline-variant">
                            {graseras.map((g) => (
                                <li key={g.id} className="flex items-center justify-between px-4 py-3">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <span className="text-label-sm font-label-sm text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">
                                            #{g.order}
                                        </span>
                                        <span className="font-bold text-on-surface">{g.codigo}</span>
                                        {g.temperaturaObjetivo && (
                                            <span className="text-label-sm text-on-surface-variant bg-surface-container-low px-2 py-0.5 rounded">
                                                Obj: {g.temperaturaObjetivo}°
                                            </span>
                                        )}
                                        {g.calentador && (
                                            <span className="text-label-sm text-primary bg-primary-fixed px-2 py-0.5 rounded">
                                                Calent. {g.calentador}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                        <button onClick={() => startEdit(g)} className="text-primary hover:opacity-70">
                                            <span className="material-symbols-outlined">edit</span>
                                        </button>
                                        <button onClick={() => handleDelete(g.id)} className="text-status-critical hover:opacity-70">
                                            <span className="material-symbols-outlined">delete</span>
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </section>
    )
}