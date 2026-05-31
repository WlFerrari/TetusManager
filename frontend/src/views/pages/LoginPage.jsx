import React, { useState } from 'react'
import { AuthService, tokenStorage } from '../../services/api.js'
import logo from '../../assets/logo.png'

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro,  setErro]  = useState('')
  const [load,  setLoad]  = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoad(true)
    setErro('')
    const result = await AuthService.login(email, senha)
    if (result.ok) {
      tokenStorage.set(result.data.token)   // salva o JWT
      onLogin(result.data.user)
    } else {
      setErro(result.msg)
      setLoad(false)
    }
  }

  return (
    <div style={{ minHeight:'100vh', background:'#f1f5f9', display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div style={{ width:'100%', maxWidth:400 }}>
        <div style={{ background:'#fff', borderRadius:20, padding:'36px 32px', boxShadow:'0 8px 32px rgba(0,0,0,.1)' }}>
          <div style={{ textAlign:'center', marginBottom:24 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px' }}>
              <img src={logo} alt="Tetus Marmoraria" style={{ width: 72, height: 72, objectFit: 'contain' }} />
            </div>
            <h1 style={{ fontSize:20, fontWeight:800, color:'#0f172a', lineHeight:1.3 }}>Acessar o<br/>Painel Operacional</h1>
            <p style={{ fontSize:13, color:'#94a3b8', marginTop:4 }}>Utilize suas credenciais corporativas</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom:16 }}>
              <label style={{ display:'block', fontSize:13, fontWeight:500, color:'#374151', marginBottom:5 }}>E-mail Corporativo</label>
              <input type="email" value={email} onChange={e=>{setEmail(e.target.value);setErro('')}} placeholder="seu.email@tetus.com" style={{ borderColor:erro?'#fca5a5':'' }} required/>
            </div>
            <div style={{ marginBottom:8 }}>
              <label style={{ display:'block', fontSize:13, fontWeight:500, color:'#374151', marginBottom:5 }}>Senha</label>
              <input type="password" value={senha} onChange={e=>{setSenha(e.target.value);setErro('')}} placeholder="••••••••" style={{ borderColor:erro?'#fca5a5':'' }} required/>
            </div>
            {erro && <p style={{ fontSize:12, color:'#dc2626', marginBottom:10 }}>{erro}</p>}
            <div style={{ textAlign:'right', marginBottom:18 }}>
              <span style={{ fontSize:12, color:'#2563eb', cursor:'pointer' }}>Esqueceu sua senha?</span>
            </div>
            <button type="submit" disabled={load} style={{ width:'100%', padding:'12px 0', border:'none', borderRadius:11, background:'#2563eb', color:'#fff', fontSize:15, fontWeight:700, cursor:'pointer', opacity:load?.7:1 }}>
              {load ? 'Entrando...' : 'Acessar'}
            </button>
          </form>
          <p style={{ textAlign:'center', fontSize:11, color:'#94a3b8', marginTop:18 }}>Problemas para acessar? Contate o administrador.</p>
        </div>
      </div>
    </div>
  )
}
