/**
 * useInventoryPage — Hook compartilhado para páginas de inventário (Chapas/Retalhos)
 *
 * Extraído dos padrões duplicados entre ChapasPage e RetalhosPage:
 * - State management (modal, form, target, erros, lista, loading, etc.)
 * - handleFoto, openView, activeFilters, closeModal
 * - handleAdd, handleEdit, handleDelete patterns
 */

import { useState, useEffect, useCallback } from 'react'

export function useInventoryPage({ initialFilters, blankForm, loadFn, historyFn }) {
  const [filters, setFilters] = useState(initialFilters)
  const [showFilters, setShowFilters] = useState(false)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(blankForm)
  const [target, setTarget] = useState(null)
  const [erros, setErros] = useState({})
  const [lista, setLista] = useState([])
  const [loading, setLoading] = useState(false)
  const [qrCodeItem, setQrCodeItem] = useState(null)
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)

  const carregar = useCallback(async () => {
    setLoading(true)
    const r = await loadFn(filters)
    setLista(r.ok ? r.data : [])
    setLoading(false)
  }, [filters, loadFn])

  useEffect(() => {
    carregar()
  }, [carregar])

  const F = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const FF = (k, v) => setFilters(f => ({ ...f, [k]: v }))
  const closeModal = () => { setModal(null); setErros({}); setTarget(null) }
  const toggleFilters = () => setShowFilters(s => !s)

  function handleFoto(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => F('foto', ev.target.result)
    reader.readAsDataURL(file)
  }

  async function carregarHistorico(itemId) {
    setHistoryLoading(true)
    const r = await historyFn(itemId)
    setHistory(r.ok ? r.data : [])
    setHistoryLoading(false)
  }

  function openView(item) {
    setTarget(item)
    setModal('view')
    setHistory([])
    carregarHistorico(item.id)
  }

  const activeFilters = Object.values(filters).filter(v => {
    if (v === null || v === undefined) return false
    return String(v).trim() !== ''
  }).length

  return {
    filters, setFilters, showFilters, toggleFilters,
    modal, setModal,
    form, setForm, F,
    target, setTarget,
    erros, setErros,
    lista, loading,
    qrCodeItem, setQrCodeItem,
    history, historyLoading,
    FF, closeModal,
    handleFoto, openView, carregar,
    activeFilters,
  }
}
