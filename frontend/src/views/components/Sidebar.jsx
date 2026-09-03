import React from 'react'
import {
  BarChart3, ChevronLeft, ChevronRight, Layers, LayoutDashboard,
  LogOut, Package, Scissors, Settings,
} from 'lucide-react'
import { Avatar } from './UI.jsx'
import { PERFIL_LABELS } from '../../models/index.js'
import logo from '../../assets/logo.png'

const ALL_NAV = [
  { id:'dashboard', label:'Dashboard', icon:LayoutDashboard, perm:'verDashboard' },
  { id:'chapas', label:'Estoque – Chapas', icon:Package, perm:'verEstoque' },
  { id:'retalhos', label:'Estoque – Retalhos', icon:Layers, perm:'verEstoque' },
  { id:'corte', label:'Registrar Corte', icon:Scissors, perm:'registrarCorte' },
  { id:'relatorios', label:'Relatórios', icon:BarChart3, perm:'verRelatorios' },
  { id:'configuracoes', label:'Configurações', icon:Settings, perm:'verConfiguracoes' },
]

export default function Sidebar({
  page,
  setPage,
  user,
  onLogout,
  open,
  onClose,
  collapsed=false,
  onToggleCollapsed,
}) {
  const perms = user.permissoes || {}
  const nav = ALL_NAV.filter(item => perms[item.perm] !== false)

  function handleNav(id) {
    setPage(id)
    onClose?.()
  }

  return (
    <>
      <div className={`sidebar-overlay ${open ? 'show' : ''}`} onClick={onClose}/>
      <aside className={`sidebar ${open ? 'open' : ''} ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-brand">
          <img src={logo} alt="Tetus Marmoraria" className="sidebar-logo"/>
          <div className="sidebar-brand-text">
            <p className="sidebar-title">TetusManager</p>
            <p className="sidebar-subtitle">Sistema de Estoque</p>
          </div>
          <button
            type="button"
            onClick={onToggleCollapsed}
            className="desktop-collapse-btn sidebar-icon-button"
            title={collapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'}
            aria-label={collapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'}
          >
            {collapsed ? <ChevronRight size={17}/> : <ChevronLeft size={17}/>}
          </button>
        </div>

        <nav className="sidebar-nav">
          {nav.map(({ id, label, icon:Icon }) => (
            <button
              key={id}
              onClick={() => handleNav(id)}
              title={collapsed ? label : undefined}
              aria-label={label}
              className={`sidebar-nav-item ${page === id ? 'active' : ''}`}
            >
              <Icon size={17}/>
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          {perms.verConfiguracoes !== false && (
            <button
              onClick={() => handleNav('configuracoes')}
              title={collapsed ? `${user.nome} — ${PERFIL_LABELS[user.perfil] || user.perfil}` : undefined}
              className="sidebar-user-button"
            >
              {user.foto
                ? <img src={user.foto} alt="Perfil" className="sidebar-avatar"/>
                : <Avatar name={user.nome} size={30}/>
              }
              <div className="sidebar-user-text">
                <p>{user.nome}</p>
                <span>{PERFIL_LABELS[user.perfil] || user.perfil}</span>
              </div>
            </button>
          )}
          <button
            onClick={onLogout}
            title={collapsed ? 'Sair' : undefined}
            aria-label="Sair"
            className="sidebar-logout-button"
          >
            <LogOut size={16}/>
            <span>Sair</span>
          </button>
        </div>
      </aside>
    </>
  )
}
