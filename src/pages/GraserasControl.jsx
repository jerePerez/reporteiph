import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import Loader from '../components/Loader'
import { delay } from '../utils/delay'
import { generateGraserasPDF } from '../utils/graserasPdf'
import { sendGraserasReportEmail } from '../utils/graserasEmail'

function nowStr() {
    const d = new Date()
    return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0')
}

export default function GraserasControl() {
    const { id } = useParams()
    const [report, setReport] = useState(null)
    const [loading, setLoading] = useState(true)
    const [savingId, setSavingId] = useState(null)
    const [closing, setClosing] = useState(false)
    const [feedback, setFeedback] = useState(null)
    const [openComment, setOpenComment] = useState(null)

    useEffect(() => {
        load()
    }, [id])

    async function load() {
        setLoading(true)
        const [snap] = await Promise.all([getDoc(doc(db, 'grasera_reports', id)), delay(600)])
        if (snap.exists()) setReport({ id: snap.id, ...snap.data() })
        setLoading(false)
    }

    const round = report?.status === 'ronda1' ? 1 : report?.status === 'ronda2' ? 2 : 3 // 3 = completo

    const itemsArray = report
        ? Object.entries(report.items)
            .map(([itemId, data]) => ({ itemId, ...data }))
            .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
        : []

    function applyLocal(itemId, patch) {
        setReport((prev) => ({
            ...prev,
            items: { ...prev.items, [itemId]: { ...prev.items[itemId], ...patch } },
        }))
    }

    async function toggleItem(itemId) {
        const item = report.items[itemId]
        let updates = {}

        if (round === 1) {
            const next = item.r1 === null ? true : item.r1 === true ? false : null
            const hora = next === null ? null : nowStr()
            updates = { [`items.${itemId}.r1`]: next, [`items.${itemId}.r1Hora`]: hora }
            applyLocal(itemId, { r1: next, r1Hora: hora })
        } else if (round === 2) {
            if (item.r1 !== true) return
            const next = item.r2 === null ? true : item.r2 === true ? false : null
            const hora = next === null ? null : nowStr()
            updates = { [`items.${itemId}.r2`]: next, [`items.${itemId}.r2Hora`]: hora }
            applyLocal(itemId, { r2: next, r2Hora: hora })
        } else {
            return
        }

        setSavingId(itemId)
        try {
            await updateDoc(doc(db, 'grasera_reports', id), updates)
        } catch (err) {
            alert('No se pudo guardar el cambio: ' + err.message)
        } finally {
            setSavingId(null)
        }
    }

    function handleComment(itemId, value) {
        applyLocal(itemId, { observaciones: value })
    }

    async function saveComment(itemId) {
        const value = report.items[itemId].observaciones || ''
        try {
            await updateDoc(doc(db, 'grasera_reports', id), { [`items.${itemId}.observaciones`]: value })
        } catch (err) {
            alert('No se pudo guardar la observación: ' + err.message)
        }
    }

    async function closeRonda1() {
        if (!confirm('¿Cerrar la Primera Vuelta? Después vas a poder abrir la Segunda Vuelta cuando quieras, más tarde.'))
            return
        setClosing(true)
        try {
            const closedAt = new Date().toISOString()
            await updateDoc(doc(db, 'grasera_reports', id), { status: 'ronda2', ronda1ClosedAt: closedAt })
            setReport((prev) => ({ ...prev, status: 'ronda2', ronda1ClosedAt: closedAt }))
        } catch (err) {
            alert('Error al cerrar la ronda: ' + err.message)
        } finally {
            setClosing(false)
        }
    }

    async function closeRonda2() {
        if (!confirm('¿Cerrar la Segunda Vuelta y finalizar el reporte?')) return
        setClosing(true)
        try {
            const closedAt = new Date().toISOString()
            await updateDoc(doc(db, 'grasera_reports', id), { status: 'completo', ronda2ClosedAt: closedAt })
            const updatedReport = { ...report, status: 'completo', ronda2ClosedAt: closedAt }
            setReport(updatedReport)
            setFeedback({ type: 'success', message: 'Control finalizado correctamente.' })
        } catch (err) {
            alert('Error al cerrar la ronda: ' + err.message)
        } finally {
            setClosing(false)
        }
    }

    function handleDownloadPDF() {
        generateGraserasPDF(report)
    }

    async function handleSendEmail() {
        try {
            await sendGraserasReportEmail(report)
            setFeedback((prev) => ({ ...prev, message: (prev?.message || '') + ' Enviado por email.' }))
        } catch (err) {
            setFeedback((prev) => ({
                ...prev,
                message: (prev?.message || '') + ' (Error al enviar email: ' + err.message + ')',
            }))
        }
    }

    if (loading) return <Loader label="Cargando control..." />
    if (!report)
        return (
            <p className="text-on-surface-variant">
                Control no encontrado.{' '}
                <Link to="/graseras" className="text-primary">
                    Volver
                </Link>
            </p>
        )

    const total = round === 2 ? itemsArray.filter((i) => i.r1 === true).length : itemsArray.length
    const done =
        round === 1
            ? itemsArray.filter((i) => i.r1 !== null).length
            : round === 2
                ? itemsArray.filter((i) => i.r1 === true && i.r2 !== null).length
                : total

    const roundLabel = round === 1 ? 'RONDA 1' : round === 2 ? 'RONDA 2' : 'COMPLETO'

    return (
        <section>
            <div className="mb-4">
                <Link to="/graseras" className="text-label-sm font-label-md text-primary hover:underline inline-flex items-center gap-1">
                    <span className="material-symbols-outlined text-base">arrow_back</span>
                    Volver a Graseras
                </Link>
            </div>

            <header className="mb-4 flex justify-between items-start flex-wrap gap-3">
                <div>
                    <h2 className="text-headline-lg font-headline-lg text-on-surface">Control de Graseras</h2>
                    <p className="text-body-md text-on-surface-variant">
                        {new Date(report.fecha).toLocaleDateString('es-AR')} · Supervisor: {report.supervisor}
                    </p>
                </div>
                <span className="text-label-sm font-label-sm px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed">
                    {roundLabel}
                </span>
            </header>

            {round !== 3 && (
                <div className="mb-6">
                    <div className="w-full bg-surface-container rounded-full h-2">
                        <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: total > 0 ? `${(done / total) * 100}%` : '0%' }}
                        />
                    </div>
                    <p className="text-label-sm text-on-surface-variant mt-1">
                        {done} / {total} verificadas
                    </p>
                </div>
            )}

            <div className="space-y-2">
                {itemsArray.map((item) => {
                    const disabledR2 = round === 2 && item.r1 !== true
                    const isCommentOpen = openComment === item.itemId

                    let statusColor = 'bg-surface-container text-on-surface-variant border border-outline-variant'
                    let statusLabel = 'PENDIENTE'
                    const okLabel = item.temperaturaObjetivo ? 'TEMP. OK' : 'OK'
                    const badLabel = item.temperaturaObjetivo ? 'NO LLEGÓ' : 'NO OK'

                    if (round === 1) {
                        if (item.r1 === true) {
                            statusColor = 'bg-status-success text-white'
                            statusLabel = 'ENCENDIDO'
                        }
                        if (item.r1 === false) {
                            statusColor = 'bg-status-critical text-white'
                            statusLabel = 'APAGADO'
                        }
                    } else if (round === 2) {
                        if (item.r2 === true) {
                            statusColor = 'bg-status-success text-white'
                            statusLabel = okLabel
                        }
                        if (item.r2 === false) {
                            statusColor = 'bg-status-critical text-white'
                            statusLabel = badLabel
                        }
                    }

                    return (
                        <div
                            key={item.itemId}
                            className={`bg-surface border border-outline-variant rounded-lg p-3 ${disabledR2 ? 'opacity-40' : ''}`}
                        >
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-bold text-on-surface text-body-md">{item.codigo}</span>
                                        {item.temperaturaObjetivo && (
                                            <span className="text-label-sm text-on-surface-variant bg-surface-container-low px-2 py-0.5 rounded">
                                                Obj: {item.temperaturaObjetivo}°
                                            </span>
                                        )}
                                        {item.calentador && (
                                            <span className="text-label-sm text-primary bg-primary-fixed px-2 py-0.5 rounded">
                                                Calent. {item.calentador}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex gap-3 mt-1">
                                        {item.r1Hora && <span className="text-label-sm text-on-surface-variant">1ª vuelta: {item.r1Hora}</span>}
                                        {item.r2Hora && <span className="text-label-sm text-on-surface-variant">2ª vuelta: {item.r2Hora}</span>}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    {round !== 3 && (
                                        <button
                                            onClick={() => setOpenComment(isCommentOpen ? null : item.itemId)}
                                            className="text-on-surface-variant hover:text-primary transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-xl">
                                                {item.observaciones ? 'chat' : 'chat_bubble_outline'}
                                            </span>
                                        </button>
                                    )}

                                    {round === 3 ? (
                                        <div className="flex gap-2">
                                            <span
                                                className={`text-label-sm font-label-sm px-3 py-1.5 rounded-full ${item.r1
                                                    ? 'bg-status-success/10 text-status-success border border-status-success'
                                                    : 'bg-status-critical/10 text-status-critical border border-status-critical'
                                                    }`}
                                            >
                                                1ª: {item.r1 ? 'SI' : 'NO'}
                                            </span>
                                            {item.r1 && (
                                                <span
                                                    className={`text-label-sm font-label-sm px-3 py-1.5 rounded-full ${item.r2
                                                        ? 'bg-status-success/10 text-status-success border border-status-success'
                                                        : 'bg-status-critical/10 text-status-critical border border-status-critical'
                                                        }`}
                                                >
                                                    2ª: {item.r2 === null ? 'S/D' : item.r2 ? 'SI' : 'NO'}
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        <button
                                            disabled={disabledR2 || savingId === item.itemId}
                                            onClick={() => toggleItem(item.itemId)}
                                            className={`text-label-sm font-label-md px-3 py-2 rounded-full transition-all active:scale-95 ${statusColor} disabled:cursor-not-allowed`}
                                        >
                                            {savingId === item.itemId ? '...' : statusLabel}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {isCommentOpen && (
                                <textarea
                                    className="w-full mt-3 bg-surface-container-lowest border border-outline-variant rounded-lg p-2 text-body-md outline-none focus:ring-2 focus:ring-primary resize-none"
                                    rows="2"
                                    placeholder="Observaciones..."
                                    value={item.observaciones || ''}
                                    onChange={(e) => handleComment(item.itemId, e.target.value)}
                                    onBlur={() => saveComment(item.itemId)}
                                />
                            )}
                            {round === 3 && item.observaciones && (
                                <p className="text-label-sm text-on-surface-variant italic mt-2 border-t border-outline-variant pt-2">
                                    {item.observaciones}
                                </p>
                            )}
                        </div>
                    )
                })}
            </div>

            {round === 1 && (
                <div className="mt-8">
                    <button
                        onClick={closeRonda1}
                        disabled={closing}
                        className="w-full md:w-auto bg-primary text-white px-12 py-4 rounded-xl text-headline-md font-bold uppercase tracking-widest hover:bg-primary-container transition-all active:scale-95 shadow-lg shadow-primary/20 disabled:opacity-50"
                    >
                        {closing ? 'Cerrando...' : 'Cerrar Primera Vuelta'}
                    </button>
                </div>
            )}

            {round === 2 && (
                <div className="mt-8">
                    <button
                        onClick={closeRonda2}
                        disabled={closing}
                        className="w-full md:w-auto bg-primary text-white px-12 py-4 rounded-xl text-headline-md font-bold uppercase tracking-widest hover:bg-primary-container transition-all active:scale-95 shadow-lg shadow-primary/20 disabled:opacity-50"
                    >
                        {closing ? 'Cerrando...' : 'Cerrar Segunda Vuelta y Finalizar'}
                    </button>
                </div>
            )}

            {round === 3 && (
                <div className="mt-8 p-6 bg-surface-container rounded-xl border border-dashed border-outline flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <h4 className="text-headline-md font-headline-md text-on-surface">Control finalizado</h4>
                        <p className="text-label-sm text-on-surface-variant">
                            Cerrado el {report.ronda2ClosedAt ? new Date(report.ronda2ClosedAt).toLocaleString('es-AR') : ''}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleDownloadPDF}
                            className="border-2 border-primary text-primary px-4 py-2 rounded-lg font-label-md hover:bg-primary-fixed transition-colors"
                        >
                            Descargar PDF
                        </button>
                        {/* <button
                            onClick={handleSendEmail}
                            className="bg-primary text-on-primary px-4 py-2 rounded-lg font-label-md hover:bg-primary-container transition-all"
                        >
                            Enviar por email
                        </button> */}
                    </div>
                </div>
            )}

            {feedback && (
                <div className="mt-6 p-4 rounded-lg border border-status-success bg-status-success/10">
                    <p className="text-body-md">{feedback.message}</p>
                </div>
            )}
        </section>
    )
}