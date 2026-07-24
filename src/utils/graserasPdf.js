import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export function generateGraserasPDF(report) {
    const docPdf = new jsPDF()
    const items = Object.values(report.items).sort((a, b) => (a.order ?? 999) - (b.order ?? 999))

    docPdf.setFontSize(18)
    docPdf.text('IPH Cero - Control de Graseras', 14, 18)
    docPdf.setFontSize(11)
    docPdf.text(`Fecha: ${new Date(report.fecha).toLocaleString('es-AR')}`, 14, 26)
    docPdf.text(`Supervisor: ${report.supervisor}`, 14, 32)
    if (report.ronda1ClosedAt)
        docPdf.text(`Cierre 1ª vuelta: ${new Date(report.ronda1ClosedAt).toLocaleTimeString('es-AR')}`, 14, 38)
    if (report.ronda2ClosedAt)
        docPdf.text(`Cierre 2ª vuelta: ${new Date(report.ronda2ClosedAt).toLocaleTimeString('es-AR')}`, 100, 38)

    autoTable(docPdf, {
        startY: 44,
        head: [['Recurso', 'Objetivo', 'Calent.', '1ª Vuelta', 'Hora', '2ª Vuelta', 'Hora', 'Obs.']],
        body: items.map((i) => [
            i.codigo,
            i.temperaturaObjetivo || '-',
            i.calentador || '-',
            i.r1 === null ? '-' : i.r1 ? 'SI' : 'NO',
            i.r1Hora || '-',
            i.r2 === null ? '-' : i.r2 ? 'SI' : 'NO',
            i.r2Hora || '-',
            i.observaciones || '',
        ]),
        styles: { fontSize: 8 },
        margin: { left: 14, right: 14 },
    })

    docPdf.save(`graseras-${new Date(report.fecha).toISOString().slice(0, 10)}.pdf`)
}