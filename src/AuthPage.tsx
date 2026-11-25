import { useState } from 'react'
import { supabase } from './lib/supabase'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [mode, setMode] = useState<'login' | 'daftar' | 'otp'>('login')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const cleanEmail = email.trim().toLowerCase()
  const cleanOtp = otp.trim()

  async function handleDaftar() {
    if (!cleanEmail || !password) { setMsg('Isi email & password dulu!'); return }
    if (password.length < 6) { setMsg('Password minimal 6 karakter!'); return }
    setLoading(true); setMsg('')
    const { error } = await supabase.auth.signUp({ email: cleanEmail, password })
    setMsg(error ? 'Gagal daftar: ' + error.message : 'Berhasil daftar! Sekarang pencet LOGIN, jangan OTP dulu.')
    setLoading(false)
  }

  async function handleLogin() {
    if (!cleanEmail || !password) { setMsg('Isi email & password dulu!'); return }
    setLoading(true); setMsg('')
    const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password })
    if (error) {
      // Penyebab paling sering: email belum verifikasi / password salah
      if (error.message.includes('Email not confirmed')) setMsg('Email belum verifikasi! Cek inbox / spam lu, klik link verifikasi dulu.')
      else if (error.message.includes('Invalid login')) setMsg('Login gagal: Email / Password salah. Coba DAFTAR dulu kalo belum pernah daftar.')
      else setMsg('Login gagal: ' + error.message)
    } else setMsg('Login berhasil! Selamat datang.')
    setLoading(false)
  }

  async function handleKirimOtp() {
    if (!cleanEmail) { setMsg('Isi email dulu!'); return }
    setLoading(true); setMsg('')
    // shouldCreateUser: false = kalo email belum terdaftar, jangan bikin user baru, kasih error jelas
    const { error } = await supabase.auth.signInWithOtp({ 
      email: cleanEmail,
      options: { shouldCreateUser: true }
    })
    if (error) {
      setMsg('Gagal kirim OTP: ' + error.message + ' | Coba pake LOGIN password dulu, atau tunggu 1 menit (kena limit).')
    } else {
      setMsg('OTP terkirim ke ' + cleanEmail + ' | Cek INBOX + SPAM. Kalo gak ada, tunggu 1 menit.')
      setMode('otp')
    }
    setLoading(false)
  }

  async function handleVerifOtp() {
    if (cleanOtp.length !== 6) { setMsg('OTP harus 6 digit! Cek lagi, jangan ada spasi.'); return }
    setLoading(true); setMsg('')
    const { error } = await supabase.auth.verifyOtp({ email: cleanEmail, token: cleanOtp, type: 'email' })
    if (error) setMsg('OTP salah / kadaluarsa: ' + error.message + ' | Pencet Kirim Ulang OTP.')
    else setMsg('OTP benar! Login berhasil.')
    setLoading(false)
  }

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', padding: 20, fontFamily: 'sans-serif' }}>
      <h2>VTC MEGA SHOP - {mode === 'login' ? 'Login' : mode === 'daftar' ? 'Daftar' : 'Masukkan OTP'}</h2>
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: 12, marginBottom: 10, boxSizing: 'border-box' }} />
      {mode !== 'otp' && (
        <input type="password" placeholder="Password (min 6)" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: 12, marginBottom: 10, boxSizing: 'border-box' }} />
      )}
      {mode === 'otp' && (
        <>
          <input placeholder="Kode OTP 6 digit" value={otp} onChange={e => setOtp(e.target.value)} style={{ width: '100%', padding: 12, marginBottom: 10, boxSizing: 'border-box' }} />
          <p style={{ fontSize: 13 }}>Kode dikirim ke: <b>{cleanEmail}</b></p>
        </>
      )}
      {mode === 'login' && <button onClick={handleLogin} disabled={loading} style={{ width: '100%', padding: 12, background: '#FF5722', color: 'white', border: 'none' }}>{loading ? 'Loading...' : 'LOGIN'}</button>}
      {mode === 'daftar' && <button onClick={handleDaftar} disabled={loading} style={{ width: '100%', padding: 12, background: '#FF5722', color: 'white', border: 'none' }}>{loading ? 'Loading...' : 'DAFTAR'}</button>}
      {mode === 'otp' && <button onClick={handleVerifOtp} disabled={loading} style={{ width: '100%', padding: 12, background: '#FF5722', color: 'white', border: 'none' }}>{loading ? 'Loading...' : 'VERIFIKASI OTP'}</button>}
      <div style={{ marginTop: 15, display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button onClick={() => { setMode('login'); setMsg('') }}>Login</button>
        <button onClick={() => { setMode('daftar'); setMsg('') }}>Daftar</button>
        <button onClick={handleKirimOtp}>Login pake OTP</button>
        {mode === 'otp' && <button onClick={handleKirimOtp}>Kirim Ulang OTP</button>}
      </div>
      {msg && <p style={{ marginTop: 15, background: '#FFF3E0', padding: 10, whiteSpace: 'pre-wrap' }}>{msg}</p>}
      <p style={{ fontSize: 12, color: '#888', marginTop: 15 }}>Tips: Kalo OTP gak masuk, cek SPAM. Kalo masih gak masuk, pake LOGIN password aja, itu paling aman.</p>
    </div>
  )
}
