'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function LoginForm() {
  const router      = useRouter()
  const searchParams = useSearchParams()
  const nextPath    = searchParams.get('next') || '/dashboard'

  const [form, setForm]     = useState({ handle: '', password: '' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res  = await fetch('/api/auth/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      router.push(nextPath)
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="container">
      <div className="card">
        <div className="logo">✦</div>
        <h1>Entrar</h1>
        <p className="subtitle">Acesse sua conta para responder perguntas.</p>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Handle</label>
            <div className="input-wrapper">
              <span className="prefix">@</span>
              <input
                value={form.handle}
                onChange={set('handle')}
                placeholder="seuhandle"
                required
                autoFocus
                autoComplete="username"
              />
            </div>
          </div>

          <div className="field">
            <label>Senha</label>
            <input
              type="password"
              value={form.password}
              onChange={set('password')}
              placeholder="Sua senha"
              required
              autoComplete="current-password"
            />
          </div>

          {error && <p className="error">{error}</p>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar →'}
          </button>
        </form>

        <p className="footer-link">
          Ainda não tem conta? <a href="/register">Criar agora</a>
        </p>
      </div>

      <style jsx>{`
        .container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }

        .card {
          width: 100%;
          max-width: 440px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          padding: 48px 40px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .logo {
          font-size: 32px;
          color: #a78bfa;
          text-align: center;
        }

        h1 {
          font-size: 26px;
          font-weight: 700;
          text-align: center;
          background: linear-gradient(135deg, #f1f5f9, #c4b5fd);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .subtitle {
          text-align: center;
          color: #64748b;
          font-size: 14px;
          margin-top: -12px;
        }

        form { display: flex; flex-direction: column; gap: 16px; }

        .field { display: flex; flex-direction: column; gap: 6px; }

        label { font-size: 13px; color: #94a3b8; font-weight: 500; }

        .input-wrapper {
          display: flex;
          align-items: center;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          overflow: hidden;
          transition: border-color 0.2s;
        }

        .input-wrapper:focus-within { border-color: rgba(139, 92, 246, 0.6); }

        .prefix {
          padding: 0 0 0 16px;
          color: #64748b;
          font-size: 16px;
          font-weight: 600;
          user-select: none;
        }

        .input-wrapper input {
          background: transparent;
          border: none;
          padding: 14px 16px 14px 6px;
          flex: 1;
        }

        input {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 14px 16px;
          color: #f1f5f9;
          font-size: 15px;
          font-family: inherit;
          width: 100%;
          transition: border-color 0.2s;
        }

        input:focus { outline: none; border-color: rgba(139, 92, 246, 0.6); }
        input::placeholder { color: #475569; }

        .error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 10px;
          padding: 10px 14px;
          color: #fca5a5;
          font-size: 14px;
        }

        .btn-primary {
          background: linear-gradient(135deg, #7c3aed, #6d28d9);
          color: white;
          border: none;
          border-radius: 12px;
          padding: 16px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.1s;
          margin-top: 4px;
        }

        .btn-primary:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }

        .footer-link {
          text-align: center;
          font-size: 14px;
          color: #475569;
        }

        .footer-link a { color: #a78bfa; text-decoration: none; }
        .footer-link a:hover { text-decoration: underline; }
      `}</style>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
