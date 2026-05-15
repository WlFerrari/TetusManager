import React, { useState, useRef } from 'react'
import { Bell, Menu, Layers, LayoutDashboard, Package, Scissors, Settings, Sun, Moon } from 'lucide-react'

import { ThemeProvider, useTheme } from './contexts/ThemeContext.jsx'
import Sidebar            from './views/components/Sidebar.jsx'
import { Toast, Avatar }  from './views/components/UI.jsx'

import LoginPage          from './views/pages/LoginPage.jsx'
import DashboardPage      from './views/pages/DashboardPage.jsx'
import ChapasPage         from './views/pages/ChapasPage.jsx'
import RetalhosPage       from './views/pages/RetalhosPage.jsx'
import CortePage          from './views/pages/CortePage.jsx'
import ConfiguracoesPage  from './views/pages/ConfiguracoesPage.jsx'

function RelatoriosPage() {
  return (
    <div>
      <h1 style={{ fontSize:20, fontWeight:700, marginBottom:6 }}>Relatórios</h1>
      <p style={{ fontSize:13, marginBottom:20 }}>Análise de aproveitamento de material</p>
      <div style={{ background:'var(--bg-secondary)', borderRadius:12, border:'1px solid var(--border-color)', padding:60, textAlign:'center' }}>
        <p style={{ fontSize:15, fontWeight:500 }}>Módulo em desenvolvimento</p>
        <p style={{ fontSize:13, marginTop:6 }}>Disponível na próxima versão.</p>
      </div>
    </div>
  )
}

// Bottom nav items for mobile
const BOTTOM_NAV = [
  { id:'dashboard',    label:'Início',  Icon:LayoutDashboard },
  { id:'chapas',       label:'Estoque', Icon:Package         },
  { id:'corte',        label:'Corte',   Icon:Scissors        },
  { id:'configuracoes',label:'Config',  Icon:Settings        },
]

function AppContent() {
  const { theme, toggleTheme } = useTheme()
  const [user,       setUser]       = useState(null)
  const [page,       setPage]       = useState('dashboard')
  const [sideOpen,   setSideOpen]   = useState(false)
  const [toast,      setToast]      = useState(null)
  const timer = useRef(null)

  function showToast(msg, type='ok') {
    clearTimeout(timer.current)
    setToast({ msg, type })
    timer.current = setTimeout(() => setToast(null), 3000)
  }

  function handleUserUpdate(updatedUser) { setUser(updatedUser) }

  if (!user) return <LoginPage onLogin={u => { setUser(u); setPage('dashboard') }} />

  const pages = {
    dashboard:     <DashboardPage />,
    chapas:        <ChapasPage    onUpdate={showToast} />,
    retalhos:      <RetalhosPage  onUpdate={showToast} />,
    corte:         <CortePage     onUpdate={showToast} />,
    relatorios:    <RelatoriosPage />,
    configuracoes: <ConfiguracoesPage user={user} onUserUpdate={handleUserUpdate} onToast={showToast} />,
  }

  return (
    <div className="app-layout">
      <Sidebar
        page={page}
        setPage={setPage}
        user={user}
        onLogout={() => setUser(null)}
        open={sideOpen}
        onClose={() => setSideOpen(false)}
      />

      <main className="main-content">
        {/* ── Mobile header ── */}
        <div className="mobile-header">
          <button
            onClick={() => setSideOpen(true)}
            style={{ background:'none', border:'none', cursor:'pointer', display:'flex', padding:4 }}
          >
            <Menu size={22}/>
          </button>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:28, height:28, background:'#2563eb', borderRadius:7, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Layers size={15} style={{ color:'#fff' }}/>
            </div>
            <span style={{ fontWeight:700, fontSize:14 }}>TetusManager</span>
          </div>
          <button
            onClick={() => setPage('configuracoes')}
            style={{ background:'none', border:'none', cursor:'pointer', display:'flex' }}
          >
            {user.foto
              ? <img src={user.foto} style={{ width:32, height:32, borderRadius:'50%', objectFit:'cover' }}/>
              : <Avatar name={user.nome} size={32}/>
            }
          </button>
        </div>

        {/* ── Desktop top bar ── */}
        <div className="top-bar desktop-only">
          <div /> {/* spacer */}
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <span style={{ fontSize:12, color:'var(--text-secondary)' }}>React 18 · Vite · MVC</span>
            <div style={{ position:'relative' }}>
              <button style={{ width:38, height:38, border:'1px solid var(--border-color)', borderRadius:9, background:'var(--bg-secondary)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-secondary)' }}>
                <Bell size={17}/>
              </button>
              <span style={{ position:'absolute', top:8, right:8, width:7, height:7, background:'#2563eb', borderRadius:'50%' }}/>
            </div>
            <button
              onClick={toggleTheme}
              title={`Mudar para modo ${theme === 'light' ? 'escuro' : 'claro'}`}
              style={{ width:38, height:38, border:'1px solid var(--border-color)', borderRadius:9, background:'var(--bg-secondary)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-secondary)', transition:'all 0.3s ease' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
            >
              {theme === 'light' ? <Moon size={17}/> : <Sun size={17}/>}
            </button>
            <button
              onClick={() => setPage('configuracoes')}
              style={{ display:'flex', alignItems:'center', gap:10, background:'var(--bg-secondary)', border:'1px solid var(--border-color)', borderRadius:10, padding:'8px 14px', cursor:'pointer' }}
            >
              {user.foto
                ? <img src={user.foto} style={{ width:30, height:30, borderRadius:'50%', objectFit:'cover' }}/>
                : <Avatar name={user.nome} size={30}/>
              }
              <div style={{ textAlign:'left' }}>
                <p style={{ fontSize:13, fontWeight:600, lineHeight:1.1 }}>{user.nome}</p>
                <p style={{ fontSize:11 }}>{user.perfil}</p>
              </div>
            </button>
          </div>
        </div>

        {/* ── Page ── */}
        <div>
          {pages[page] ?? <p>Sem permissão para acessar esta página.</p>}
        </div>
      </main>

      {/* ── Mobile bottom nav ── */}
      <nav className="mobile-bottom-nav">
        {BOTTOM_NAV.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setPage(id)}
            className={page === id ? 'active' : ''}
          >
            <Icon size={20}/>
            {label}
          </button>
        ))}
      </nav>

      {toast && <Toast message={toast.msg} type={toast.type}/>}
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}
