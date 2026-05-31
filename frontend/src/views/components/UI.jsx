/**
 * Componentes de UI reutilizáveis (View Layer)
 * Recebem apenas props — sem lógica de negócio.
 */

import React from 'react'
import { X, Trash2 } from 'lucide-react'

// ── Status Badge ──────────────────────────────────────────────────────
const STATUS_COLORS = {
  'disponivel': { bg: '#d1fae5', color: '#065f46' },
  'em uso':     { bg: '#fef3c7', color: '#92400e' },
  'reservado':  { bg: '#dbeafe', color: '#1e40af' },
  'consumido':  { bg: '#f3f4f6', color: '#374151' },
  'descartado': { bg: '#fee2e2', color: '#991b1b' },
  'esgotado':   { bg: '#fee2e2', color: '#991b1b' },
  'ativo':      { bg: '#d1fae5', color: '#065f46' },
  'inativo':    { bg: '#fee2e2', color: '#991b1b' },
}

const normalizeStatus = (value) => (value || '')
  .normalize('NFD')
  .replace(/\p{Diacritic}/gu, '')
  .toLowerCase()

export function Badge({ status }) {
  const key = normalizeStatus(status)
  const s = STATUS_COLORS[key] || { bg: '#f3f4f6', color: '#374151' }
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


// ── Modal ─────────────────────────────────────────────────────────────
export function Modal({ title, onClose, children }) {
  return (
    <div className="overlay">
      <div className="modal-box">
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '15px 20px', borderBottom: '1px solid var(--border-color)',
        }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>{title}</span>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-secondary)', display: 'flex', padding: 4,
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
        background: 'var(--bg-secondary)', borderRadius: 16, padding: 28,
        maxWidth: 360, width: '92%', textAlign: 'center',
        boxShadow: '0 8px 32px rgba(0,0,0,.14)',
        border: '1px solid var(--border-color)',
      }}>
        <div style={{
          width: 48, height: 48, background: '#fee2e2', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 14px', color: '#dc2626',
        }}>
          <Trash2 size={20} />
        </div>
        <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 15, marginBottom: 8 }}>
          Confirmar exclusão
        </p>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 22 }}>{message}</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button onClick={onCancel} style={{
            padding: '9px 20px', border: '1px solid var(--border-color)', borderRadius: 8,
            background: 'var(--bg-secondary)', fontSize: 13, fontWeight: 500, cursor: 'pointer', color: 'var(--text-primary)',
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
    background: 'var(--bg-secondary)', color: 'var(--text-primary)',
    border: '1px solid var(--border-color)', borderRadius: 8,
    padding: '10px 16px', fontSize: 14, fontWeight: 500, cursor: 'pointer',
    ...style,
  }}>
    {children}
  </button>
)

export const BtnIcon = ({ onClick, title, children, danger = false }) => (
  <button onClick={onClick} title={title} style={{
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '5px 8px', border: '1px solid var(--border-color)', borderRadius: 6,
    background: 'var(--bg-secondary)', cursor: 'pointer',
    color: danger ? '#dc2626' : 'var(--text-secondary)',
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
      <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="var(--text-secondary)" strokeWidth={2}
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
