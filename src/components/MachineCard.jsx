export default function MachineCard({ machine, state, onToggle, onComment }) {
  const items = machine.items || []
  const allVerified = items.length > 0 && items.every((it) => state?.items?.[it.id])
  const anyVerified = items.some((it) => state?.items?.[it.id])

  const accentClass = allVerified ? 'card-accent-success' : anyVerified ? 'card-accent-warning' : 'card-accent-pending'
  const statusLabel = allVerified ? 'INSPECCION OK' : 'INSPECCION PENDIENTE'
  const statusClass = allVerified
    ? 'bg-status-success/10 text-status-success border border-status-success'
    : 'bg-primary-fixed text-on-primary-fixed'

  return (
    <article className={`bg-surface border border-outline-variant rounded-lg overflow-hidden ${accentClass} flex flex-col transition-all hover:border-primary`}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-headline-md font-headline-md text-primary">{machine.name}</h3>
          <span className={`text-label-sm font-label-sm px-3 py-1 rounded-full ${statusClass}`}>{statusLabel}</span>
        </div>

        <div className="space-y-4">
          {items.map((item) => {
            const checked = !!state?.items?.[item.id]
            return (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg border border-outline-variant"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">{item.icon || 'check_circle'}</span>
                  <span className="text-label-md font-label-md">{item.label}</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only toggle-state"
                    checked={checked}
                    onChange={() => onToggle(machine.id, item.id)}
                  />
                  <div className="toggle-label px-4 py-1.5 rounded-full text-label-sm font-label-md transition-colors border border-outline-variant">
                    {checked ? 'VERIFICADO' : 'PENDIENTE'}
                  </div>
                </label>
              </div>
            )
          })}

          {items.length === 0 && (
            <p className="text-label-sm text-on-surface-variant italic">
              Esta máquina no tiene puntos de control cargados.
            </p>
          )}
        </div>

        <div className="mt-6">
          <label className="text-label-sm font-label-md text-on-surface-variant block mb-2">Comentarios</label>
          <textarea
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 text-body-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
            placeholder="Ingrese observaciones..."
            rows="3"
            value={state?.comments || ''}
            onChange={(e) => onComment(machine.id, e.target.value)}
          />
        </div>
      </div>
    </article>
  )
}
