export async function sendGraserasReportEmail(report) {
    const endpoint = import.meta.env.VITE_FORMSPREE_GRASERAS_ENDPOINT || import.meta.env.VITE_FORMSPREE_ENDPOINT

    if (!endpoint || endpoint.includes('tu_id_de_formulario')) {
        throw new Error('No se configuró VITE_FORMSPREE_ENDPOINT (ni VITE_FORMSPREE_GRASERAS_ENDPOINT) en el archivo .env')
    }

    const items = Object.values(report.items).sort((a, b) => (a.order ?? 999) - (b.order ?? 999))

    const summary = items
        .map((i) => {
            const r1 = i.r1 === null ? 'sin dato' : i.r1 ? 'SI' : 'NO'
            const r2 = i.r2 === null ? 'sin dato' : i.r2 ? 'SI' : 'NO'
            return `${i.codigo} (obj: ${i.temperaturaObjetivo || '-'}) - 1ª vuelta: ${r1} (${i.r1Hora || '-'}) - 2ª vuelta: ${r2} (${i.r2Hora || '-'})${i.observaciones ? ' - Obs: ' + i.observaciones : ''
                }`
        })
        .join('\n')

    const body = {
        _subject: `Control de Graseras - ${new Date(report.fecha).toLocaleString('es-AR')}`,
        supervisor: report.supervisor,
        fecha: report.fecha,
        message: summary,
    }

    const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body),
    })

    if (!res.ok) {
        throw new Error('Formspree respondió con error ' + res.status)
    }
}