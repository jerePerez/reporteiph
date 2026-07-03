export async function sendReportEmail(report) {
  const endpoint = import.meta.env.VITE_FORMSPREE_ENDPOINT

  if (!endpoint || endpoint.includes('tu_id_de_formulario')) {
    throw new Error('No se configuró VITE_FORMSPREE_ENDPOINT en el archivo .env')
  }

  const summary = report.sectors
    .map(
      (s) =>
        `${s.machineName} [${s.status}]\n` +
        s.items.map((i) => `  - ${i.label}: ${i.verified ? 'Verificado' : 'Pendiente'}`).join('\n') +
        (s.comments ? `\n  Comentarios: ${s.comments}` : '')
    )
    .join('\n\n')

  const body = {
    _subject: `Reporte de inspección - ${new Date(report.date).toLocaleString('es-AR')}`,
    technician: report.technician,
    date: report.date,
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
