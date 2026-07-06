import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export function generateReportPDF(report) {
  const docPdf = new jsPDF()
  const dateStr = new Date(report.date).toLocaleString('es-AR')

  docPdf.setFontSize(18)
  docPdf.text('IPH CERO - Reporte de Inspección', 14, 18)
  docPdf.setFontSize(11)
  docPdf.text(`Fecha: ${dateStr}`, 14, 26)
  docPdf.text(`Técnico: ${report.technician}`, 14, 32)

  let y = 42

  report.sectors?.forEach((sector) => {
    if (y > 260) {
      docPdf.addPage()
      y = 20
    }
    docPdf.setFontSize(13)
    docPdf.text(`${sector.machineName} - ${sector.status}`, 14, y)
    y += 4

    autoTable(docPdf, {
      startY: y,
      head: [['Punto de control', 'Estado']],
      body: sector.items.map((i) => [i.label, i.verified ? 'Verificado' : 'Pendiente']),
      margin: { left: 14, right: 14 },
      styles: { fontSize: 10 },
    })

    y = docPdf.lastAutoTable.finalY + 6

    if (sector.comments) {
      docPdf.setFontSize(10)
      const lines = docPdf.splitTextToSize(`Comentarios: ${sector.comments}`, 180)
      docPdf.text(lines, 14, y)
      y += lines.length * 5 + 6
    } else {
      y += 6
    }
  })

  docPdf.save(`reporte-${new Date(report.date).toISOString().slice(0, 10)}.pdf`)
}
