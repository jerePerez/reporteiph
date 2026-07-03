import { useEffect, useState } from 'react'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../firebase'

const emptyItem = () => ({ id: crypto.randomUUID(), label: '', icon: 'check_circle' })

export default function AdminPanel() {
  const [machines, setMachines] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)

  useEffect(() => {
    loadMachines()
  }, [])

  async function loadMachines() {
    setLoading(true)
    const snap = await getDocs(collection(db, 'machines'))
    setMachines(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    setLoading(false)
  }

  function startNew() {
    setEditing({ name: '', sector: '', items: [emptyItem()] })
  }

  function startEdit(machine) {
    setEditing({ ...machine, items: (machine.items || []).map((i) => ({ ...i })) })
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar esta máquina? Esta acción no se puede deshacer.')) return
    await deleteDoc(doc(db, 'machines', id))
    loadMachines()
  }

  async function handleSave() {
    if (!editing.name.trim()) {
      alert('El nombre de la máquina es obligatorio.')
      return
    }
    const payload = {
      name: editing.name.trim(),
      sector: editing.sector?.trim() || '',
      items: editing.items
        .filter((i) => i.label.trim())
        .map((i) => ({ id: i.id, label: i.label.trim(), icon: i.icon || 'check_circle' })),
    }
    if (editing.id) {
      await updateDoc(doc(db, 'machines', editing.id), payload)
    } else {
      await addDoc(collection(db, 'machines'), payload)
    }
    setEditing(null)
    loadMachines()
  }

  function updateItem(idx, field, value) {
    setEditing((prev) => {
      const items = [...prev.items]
      items[idx] = { ...items[idx], [field]: value }
      return { ...prev, items }
    })
  }

  function addItem() {
    setEditing((prev) => ({ ...prev, items: [...prev.items, emptyItem()] }))
  }

  function removeItem(idx) {
    setEditing((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }))
  }

  if (loading) return <div className="p-8 text-center text-on-surface-variant">Cargando...</div>

  return (
    <section>
      <header className="mb-8 flex justify-between items-center">
        <h2 className="text-headline-lg font-headline-lg text-on-surface">Administrador de Máquinas</h2>
        {!editing && (
          <button
            onClick={startNew}
            className="bg-primary text-on-primary px-6 py-2 rounded-lg font-label-md hover:bg-primary-container transition-all"
          >
            + Nueva Máquina
          </button>
        )}
      </header>

      {editing ? (
        <div className="bg-surface border border-outline-variant rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="text-label-sm font-label-md text-on-surface-variant block mb-2">
                Nombre / Sector (ej: Sector PL01)
              </label>
              <input
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-label-sm font-label-md text-on-surface-variant block mb-2">
                Código de sector (opcional)
              </label>
              <input
                value={editing.sector}
                onChange={(e) => setEditing({ ...editing, sector: e.target.value })}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <h4 className="text-label-md font-label-md text-on-surface-variant mb-3">Puntos a controlar</h4>
          <div className="space-y-3 mb-4">
            {editing.items.map((item, idx) => (
              <div key={item.id} className="flex gap-3 items-center">
                <input
                  value={item.label}
                  onChange={(e) => updateItem(idx, 'label', e.target.value)}
                  placeholder="Ej: Grasera, Luces, Ventilador..."
                  className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  value={item.icon}
                  onChange={(e) => updateItem(idx, 'icon', e.target.value)}
                  placeholder="Ícono (Material Symbols)"
                  className="w-56 bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-primary"
                />
                <button onClick={() => removeItem(idx)} className="text-status-critical hover:opacity-70">
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
            ))}
          </div>
          <button onClick={addItem} className="text-primary font-label-md mb-6 hover:underline">
            + Agregar punto de control
          </button>

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {machines.map((machine) => (
            <div key={machine.id} className="bg-surface border border-outline-variant rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-headline-md font-headline-md text-primary">{machine.name}</h3>
                  {machine.sector && <p className="text-label-sm text-on-surface-variant">{machine.sector}</p>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(machine)} className="text-primary hover:opacity-70">
                    <span className="material-symbols-outlined">edit</span>
                  </button>
                  <button onClick={() => handleDelete(machine.id)} className="text-status-critical hover:opacity-70">
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              </div>
              <p className="text-label-sm text-on-surface-variant">{(machine.items || []).length} puntos de control</p>
              <ul className="mt-2 space-y-1">
                {(machine.items || []).map((i) => (
                  <li key={i.id} className="text-body-md text-on-surface-variant flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-primary">{i.icon}</span>
                    {i.label}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {machines.length === 0 && <p className="text-on-surface-variant">No hay máquinas cargadas todavía.</p>}
        </div>
      )}
    </section>
  )
}
