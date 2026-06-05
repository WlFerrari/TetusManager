import React from 'react'
import { LayoutDashboard, Package, Layers, Scissors, BarChart3, Settings, LogOut, X } from 'lucide-react'
import { Avatar } from './UI.jsx'
import { useTheme } from '../../contexts/ThemeContext.jsx'
import logo from '../../assets/logo.png'

const ALL_NAV = [
  { id:'dashboard',     label:'Dashboard',          icon:LayoutDashboard, perm:'verDashboard'     },
  { id:'chapas',        label:'Estoque – Chapas',   icon:Package,         perm:'verEstoque'       },
  { id:'retalhos',      label:'Estoque – Retalhos', icon:Layers,          perm:'verEstoque'       },
  { id:'corte',         label:'Registrar Corte',    icon:Scissors,        perm:'registrarCorte'   },
  { id:'relatorios',    label:'Relatórios',         icon:BarChart3,       perm:'verRelatorios'    },
  { id:'configuracoes', label:'Configurações',      icon:Settings,        perm:'verConfiguracoes' },
]

export default function Sidebar({ page, setPage, user, onLogout, open, onClose }) {
  const perms = user.permissoes || {}
  const nav = ALL_NAV.filter(item => perms[item.perm] !== false)
  const { theme } = useTheme()

  function handleNav(id) {
    setPage(id)
    onClose?.()
  }

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`sidebar-overlay ${open ? 'show' : ''}`}
        onClick={onClose}
      />

      <aside className={`sidebar ${open ? 'open' : ''}`}>
        {/* Logo + close button */}
        <div style={{ padding:'16px 14px', borderBottom:'1px solid var(--border-color)', display:'flex', alignItems:'center', gap:10 }}>
          <img src={logo} alt="Tetus Marmoraria" style={{ width:38, height:38, objectFit:'contain', flexShrink:0 }} />
          <div style={{ flex:1 }}>
            <p style={{ color:'#fff', fontWeight:700, fontSize:13, lineHeight:1.2 }}>TetusManager</p>
            <p style={{ color:'var(--text-secondary)', fontSize:10 }}>Sistema de Estoque</p>
          </div>
          {/* Close button — mobile only */}
          <button
            onClick={onClose}
            style={{ background:'none', border:'none', color:'var(--text-secondary)', cursor:'pointer', display:'flex', padding:4 }}
            className="mobile-close-btn"
          >
            <X size={18}/>
          </button>
        </div>

        {/* Nav items */}
        <nav style={{ flex:1, padding:'10px 8px', overflowY:'auto' }}>
          {nav.map(({ id, label, icon:Icon }) => (
            <button key={id} onClick={() => handleNav(id)} style={{
              width:'100%', display:'flex', alignItems:'center', gap:11,
              padding:'10px 12px', borderRadius:9, border:'none', cursor:'pointer',
              fontSize:13, fontWeight:page===id ? 600 : 400,
              background:page===id ? '#2563eb' : 'transparent',
              color:page===id ? '#fff' : 'var(--text-secondary)',
              marginBottom:2, textAlign:'left', transition:'all .15s',
            }}>
              <Icon size={16}/>{label}
            </button>
          ))}
        </nav>

        {/* User + logout */}
        <div style={{ padding:'10px 8px', borderTop:'1px solid var(--border-color)' }}>
          <button
            onClick={() => handleNav('configuracoes')}
            style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'9px 10px', borderRadius:9, border:'none', cursor:'pointer', background:'transparent', marginBottom:4 }}
          >
            {user.foto
              ? <img src={user.foto} style={{ width:30, height:30, borderRadius:'50%', objectFit:'cover', flexShrink:0 }}/>
              : <Avatar name={user.nome} size={30}/>
            }
            <div style={{ minWidth:0, textAlign:'left' }}>
              <p style={{ color:'#e2e8f0', fontSize:12, fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.nome}</p>
              <p style={{ color:'var(--text-secondary)', fontSize:11 }}>{user.perfil}</p>
            </div>
          </button>
          <button onClick={onLogout} style={{ width:'100%', display:'flex', alignItems:'center', gap:8, padding:'9px 12px', borderRadius:9, border:'none', cursor:'pointer', fontSize:13, background:'transparent', color:'var(--text-secondary)' }}>
            <LogOut size={15}/> Sair
          </button>
        </div>
      </aside>
    </>
  )
}
