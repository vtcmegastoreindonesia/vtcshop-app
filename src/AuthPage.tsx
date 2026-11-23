import { useState } from 'react'
import { supabase } from './lib/supabase'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [mode, setMode] = useState<'login' | 'daftar' | 'otp'>('login')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  async function handleDaftar() {
    setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })
    setMsg(error ? 'Gagal daftar: ' + error.message : 'Berhasil daftar! Cek email untuk verifikasi.')
    setLoading(false)
  }

  async function handleLogin() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setMsg('Login gagal: ' + error.message)
    else setMsg('Login berhasil! Selamat datang.')
    setLoading(false)
  }

  async function handleKirimOtp() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({ email })
    setMsg(error ? 'Gagal kirim OTP: ' + error.message : 'OTP terkirim ke ' + email)
    if (!error) setMode('otp')
    setLoading(false)
  }

  async function handleVerifOtp() {
    setLoading(true)
    const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' })
    if (error) setMsg('OTP salah: ' + error.message)
    else setMsg('OTP benar! Login berhasil.')
    setLoading(false)
  }

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', padding: 20, fontFamily: 'sans-serif' }}>
      <h2>VTC MEGA SHOP - {mode === 'login' ? 'Login' : mode === 'daftar' ? 'Daftar' : 'Masukkan OTP'}</h2>
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: 12, marginBottom: 10 }} />
      {mode !== 'otp' && (
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: 12, marginBottom: 10 }} />
      )}
      {mode === 'otp' && (
        <input placeholder="Kode OTP 6 digit" value={otp} onChange={e => setOtp(e.target.value)} style={{ width: '100%', padding: 12, marginBottom: 10 }} />
      )}
      {mode === 'login' && <button onClick={handleLogin} style={{ width: '100%', padding: 12, background: '#FF5722', color: 'white', border: 'none' }}>{loading ? 'Loading...' : 'LOGIN'}</button>}
      {mode === 'daftar' && <button onClick={handleDaftar} style={{ width: '100%', padding: 12, background: '#FF5722', color: 'white', border: 'none' }}>{loading ? 'Loading...' : 'DAFTAR'}</button>}
      {mode === 'otp' && <button onClick={handleVerifOtp} style={{ width: '100%', padding: 12, background: '#FF5722', color: 'white', border: 'none' }}>{loading ? 'Loading...' : 'VERIFIKASI OTP'}</button>}
      <div style={{ marginTop: 15, display: 'flex', gap: 10, justifyContent: 'center' }}>
        <button onClick={() => setMode('login')}>Login</button>
        <button onClick={() => setMode('daftar')}>Daftar</button>
        <button onClick={handleKirimOtp}>Login pake OTP</button>
      </div>
      {msg && <p style={{ marginTop: 15, background: '#FFF3E0', padding: 10 }}>{msg}</p>}
    </div>
  )
}
