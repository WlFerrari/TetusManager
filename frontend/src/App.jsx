import React, { useRef, useState } from 'react'
import { Layers, LayoutDashboard, Menu, Moon, Package, Scissors, Settings, Sun } from 'lucide-react'

import { ThemeProvider, useTheme } from './contexts/ThemeContext.jsx'
import Sidebar from './views/components/Sidebar.jsx'
import { Avatar, Toast } from './views/components/UI.jsx'
import { PERFIL_LABELS } from './models/index.js'

import LoginPage from './views/pages/LoginPage.jsx'
import DashboardPage from './views/pages/DashboardPage.jsx'
import ChapasPage from './views/pages/ChapasPage.jsx'
import RetalhosPage from './views/pages/RetalhosPage.jsx'
import CortePage from './views/pages/CortePage.jsx'
import RelatoriosPage from './views/pages/RelatoriosPage.jsx'
import ConfiguracoesPage from './views/pages/ConfiguracoesPage.jsx'

const BOTTOM_NAV = [
  { id:'dashboard', label:'Início', Icon:LayoutDashboard, perm:'verDashboard' },
  { id:'chapas', label:'Estoque', Icon:Package, perm:'verEstoque' },
  { id:'corte', label:'Corte', Icon:Scissors, perm:'registrarCorte' },
  { id:'configuracoes', label:'Config', Icon:Settings, perm:'verConfiguracoes' },
]

const PAGE_PRIORITY = [
  ['dashboard','verDashboard'],
  ['chapas','verEstoque'],
  ['corte','registrarCorte'],
  ['relatorios','verRelatorios'],
  ['configuracoes','verConfiguracoes'],
]

function firstAllowedPage(user) {
  const perms = user?.permissoes || {}
  return PAGE_PRIORITY.find(([, perm]) => perms[perm] !== false)?.[0] || 'configuracoes'
}

function AppContent() {
  const { theme, toggleTheme } = useTheme()
  const [user, setUser] = useState(null)
  const [page, setPage] = useState('dashboard')
  const [sideOpen, setSideOpen] = useState(false)
  const [sideCollapsed, setSideCollapsed] = useState(() => localStorage.getItem('tetus-sidebar-collapsed') === '1')
  const [toast, setToast] = useState(null)
  const timer = useRef(null)

  function showToast(msg, type='ok') {
    clearTimeout(timer.current)
    setToast({ msg, type })
    timer.current = setTimeout(() => setToast(null), 3000)
  }

  function handleLogin(loggedUser) {
    setUser(loggedUser)
    setPage(firstAllowedPage(loggedUser))
  }

  function handleUserUpdate(updatedUser) { setUser(updatedUser) }

  function toggleSidebar() {
    setSideCollapsed(value => {
      const next = !value
      localStorage.setItem('tetus-sidebar-collapsed', next ? '1' : '0')
      return next
    })
  }

  if (!user) return <LoginPage onLogin={handleLogin} />

  const perms = user.permissoes || {}
  const pages = {
    dashboard: perms.verDashboard !== false ? <DashboardPage user={user} /> : null,
    chapas: perms.verEstoque !== false ? <ChapasPage onUpdate={showToast} user={user} /> : null,
    retalhos: perms.verEstoque !== false ? <RetalhosPage onUpdate={showToast} user={user} /> : null,
    corte: perms.registrarCorte !== false ? <CortePage onUpdate={showToast} /> : null,
    relatorios: perms.verRelatorios !== false ? <RelatoriosPage onUpdate={showToast} /> : null,
    configuracoes: perms.verConfiguracoes !== false
      ? <ConfiguracoesPage user={user} onUserUpdate={handleUserUpdate} onToast={showToast} />
      : null,
  }
  const mobileNav = BOTTOM_NAV.filter(item => perms[item.perm] !== false)

  return (
    <div className={`app-layout ${sideCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar
        page={page}
        setPage={setPage}
        user={user}
        onLogout={() => setUser(null)}
        open={sideOpen}
        onClose={() => setSideOpen(false)}
        collapsed={sideCollapsed}
        onToggleCollapsed={toggleSidebar}
      />

      <main className="main-content">
        <div className="mobile-header">
          <button onClick={() => setSideOpen(true)} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', padding:4 }} aria-label="Abrir menu"><Menu size={22}/></button>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:28, height:28, background:'#2563eb', borderRadius:7, display:'flex', alignItems:'center', justifyContent:'center' }}><Layers size={15} style={{ color:'#fff' }}/></div>
            <span style={{ fontWeight:700, fontSize:14 }}>TetusManager</span>
          </div>
          <button onClick={() => perms.verConfiguracoes !== false && setPage('configuracoes')} style={{ background:'none', border:'none', cursor:'pointer', display:'flex' }} aria-label="Abrir configurações">
            {user.foto ? <img src={user.foto} alt="Perfil" style={{ width:32, height:32, borderRadius:'50%', objectFit:'cover' }}/> : <Avatar name={user.nome} size={32}/>} 
          </button>
        </div>

        <div className="top-bar desktop-only">
          <div />
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <button onClick={toggleTheme} title={`Mudar para modo ${theme === 'light' ? 'escuro' : 'claro'}`} style={{ width:38, height:38, border:'1px solid var(--border-color)', borderRadius:9, background:'var(--bg-secondary)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-secondary)' }}>
              {theme === 'light' ? <Moon size={17}/> : <Sun size={17}/>}
            </button>
            <button onClick={() => perms.verConfiguracoes !== false && setPage('configuracoes')} style={{ display:'flex', alignItems:'center', gap:10, background:'var(--bg-secondary)', border:'1px solid var(--border-color)', borderRadius:10, padding:'8px 14px', cursor:'pointer' }}>
              {user.foto ? <img src={user.foto} alt="Perfil" style={{ width:30, height:30, borderRadius:'50%', objectFit:'cover' }}/> : <Avatar name={user.nome} size={30}/>} 
              <div style={{ textAlign:'left' }}>
                <p style={{ fontSize:13, fontWeight:600, lineHeight:1.1 }}>{user.nome}</p>
                <p style={{ fontSize:11 }}>{PERFIL_LABELS[user.perfil] || user.perfil}</p>
              </div>
            </button>
          </div>
        </div>

        <div>{pages[page] ?? <p>Sem permissão para acessar esta página.</p>}</div>
      </main>

      <nav className="mobile-bottom-nav">
        {mobileNav.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => setPage(id)} className={page === id ? 'active' : ''}><Icon size={20}/>{label}</button>
        ))}
      </nav>

      {toast && <Toast message={toast.msg} type={toast.type}/>} 
    </div>
  )
}

export default function App() {
  return <ThemeProvider><AppContent /></ThemeProvider>
}
