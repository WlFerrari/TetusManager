/**
 * Componentes de UI reutilizáveis (View Layer)
 * Recebem apenas props — sem lógica de negócio.
 */

import React from 'react'
import { X, Trash2 } from 'lucide-react'

// ── Status Badge ──────────────────────────────────────────────────────
const STATUS_COLORS = {
  'Disponível': { bg: '#d1fae5', color: '#065f46' },
  'Em uso':     { bg: '#fef3c7', color: '#92400e' },
  'Reservado':  { bg: '#dbeafe', color: '#1e40af' },
  'Consumido':  { bg: '#f3f4f6', color: '#374151' },
  'Esgotado':   { bg: '#fee2e2', color: '#991b1b' },
  'Ativo':      { bg: '#d1fae5', color: '#065f46' },
  'Inativo':    { bg: '#fee2e2', color: '#991b1b' },
}

export function Badge({ status }) {
  const s = STATUS_COLORS[status] || { bg: '#f3f4f6', color: '#374151' }
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 9px',
      borderRadius: 99,
      fontSize: 11,
      fontWeight: 500,
      background: s.bg,
      color: s.color,
    }}>
      {status}
    </span>
  )
}

// ── CRUD operation label ──────────────────────────────────────────────
const CRUD_COLORS = {
  C: { bg: '#dbeafe', color: '#1e40af', label: 'CREATE' },
  R: { bg: '#d1fae5', color: '#065f46', label: 'READ'   },
  U: { bg: '#fef3c7', color: '#92400e', label: 'UPDATE' },
  D: { bg: '#fee2e2', color: '#991b1b', label: 'DELETE' },
}
export function CrudLabel({ op }) {
  const s = CRUD_COLORS[op]
  return (
    <span style={{
      background: s.bg,
      color: s.color,
      fontSize: 9,
      fontWeight: 700,
      padding: '1px 5px',
      borderRadius: 4,
      letterSpacing: '.5px',
      marginLeft: 4,
    }}>
      {op}:{s.label}
    </span>
  )
}

// ── Modal ─────────────────────────────────────────────────────────────
export function Modal({ title, onClose, children }) {
  return (
    <div className="overlay">
      <div className="modal-box">
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '15px 20px', borderBottom: '1px solid #f3f4f6',
        }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: '#1f2937' }}>{title}</span>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#9ca3af', display: 'flex', padding: 4,
          }}>
            <X size={16} />
          </button>
        </div>
        <div style={{ padding: '18px 20px' }}>{children}</div>
      </div>
    </div>
  )
}

// ── Confirmação de exclusão ───────────────────────────────────────────
export function ConfirmDelete({ message, onConfirm, onCancel }) {
  return (
    <div className="overlay">
      <div style={{
        background: '#fff', borderRadius: 16, padding: 28,
        maxWidth: 360, width: '92%', textAlign: 'center',
        boxShadow: '0 8px 32px rgba(0,0,0,.14)',
      }}>
        <div style={{
          width: 48, height: 48, background: '#fee2e2', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 14px', color: '#dc2626',
        }}>
          <Trash2 size={20} />
        </div>
        <p style={{ fontWeight: 700, color: '#1f2937', fontSize: 15, marginBottom: 8 }}>
          Confirmar exclusão
        </p>
        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 22 }}>{message}</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button onClick={onCancel} style={{
            padding: '9px 20px', border: '1px solid #e5e7eb', borderRadius: 8,
            background: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer', color: '#374151',
          }}>
            Cancelar
          </button>
          <button onClick={onConfirm} style={{
            padding: '9px 20px', border: 'none', borderRadius: 8,
            background: '#dc2626', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>
            Excluir
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Form Field ────────────────────────────────────────────────────────
export function FormField({ label, children }) {
  return (
    <div className="form-field">
      <label>{label}</label>
      {children}
    </div>
  )
}

// ── Toast notification ────────────────────────────────────────────────
export function Toast({ message, type }) {
  return (
    <div className="toast" style={{ background: type === 'ok' ? '#16a34a' : '#dc2626' }}>
      {message}
    </div>
  )
}

// ── Button variants ───────────────────────────────────────────────────
export const BtnPrimary = ({ onClick, disabled, children, style = {} }) => (
  <button onClick={onClick} disabled={disabled} style={{
    display: 'flex', alignItems: 'center', gap: 6,
    background: '#2563eb', color: '#fff', border: 'none',
    borderRadius: 8, padding: '10px 16px', fontSize: 14,
    fontWeight: 600, cursor: 'pointer',
    opacity: disabled ? .4 : 1,
    ...style,
  }}>
    {children}
  </button>
)

export const BtnSecondary = ({ onClick, children, style = {} }) => (
  <button onClick={onClick} style={{
    background: '#fff', color: '#374151',
    border: '1px solid #e5e7eb', borderRadius: 8,
    padding: '10px 16px', fontSize: 14, fontWeight: 500, cursor: 'pointer',
    ...style,
  }}>
    {children}
  </button>
)

export const BtnIcon = ({ onClick, title, children, danger = false }) => (
  <button onClick={onClick} title={title} style={{
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '5px 8px', border: '1px solid #e5e7eb', borderRadius: 6,
    background: '#fff', cursor: 'pointer',
    color: danger ? '#dc2626' : '#6b7280',
  }}>
    {children}
  </button>
)

// ── Avatar (iniciais) ─────────────────────────────────────────────────
export function Avatar({ name, size = 28 }) {
  const initials = (name || '').split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: '#dbeafe', color: '#1d4ed8',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.35, fontWeight: 700, flexShrink: 0,
    }}>
      {initials}
    </div>
  )
}

// ── Section header ────────────────────────────────────────────────────
export function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="section-header">
      <div>
        <h2 className="section-title">{title}</h2>
        {subtitle && <p className="section-subtitle">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

// ── Search input ──────────────────────────────────────────────────────
export function SearchInput({ value, onChange, placeholder }) {
  return (
    <div style={{ position: 'relative', marginBottom: 14 }}>
      <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="#9ca3af" strokeWidth={2}
        style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)' }}>
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder || 'Buscar...'}
        style={{ paddingLeft: 32, fontSize: 13 }}
      />
    </div>
  )
}
