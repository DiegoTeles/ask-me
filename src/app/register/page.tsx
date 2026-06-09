'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm]     = useState({ handle: '', display_name: '', password: '', confirm: '' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.password !== form.confirm) { setError('As senhas não coincidem.'); return }
    setError('')
    setLoading(true)
    try {
      const res  = await fetch('/api/auth/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ handle: form.handle, display_name: form.display_name, password: form.password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      router.push('/dashboard')
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
        <h1>Criar sua conta</h1>
        <p className="subtitle">Escolha seu handle único para receber perguntas anônimas.</p>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Handle <span className="hint">(@seuhandle)</span></label>
            <div className="input-wrapper">
              <span className="prefix">@</span>
              <input
                value={form.handle}
                onChange={set('handle')}
                placeholder="seuhandle"
                pattern="[a-zA-Z0-9_]{3,20}"
                title="3–20 caracteres: letras, números e _"
                required
                autoFocus
                autoComplete="username"
              />
            </div>
            <span className="field-hint">3–20 caracteres. Letras, números e _</span>
          </div>

          <div className="field">
            <label>Nome de exibição <span className="hint">(opcional)</span></label>
            <input
              value={form.display_name}
              onChange={set('display_name')}
              placeholder="Como você quer ser chamado?"
              maxLength={60}
            />
          </div>

          <div className="field">
            <label>Senha</label>
            <input
              type="password"
              value={form.password}
              onChange={set('password')}
              placeholder="Mínimo 6 caracteres"
              minLength={6}
              required
              autoComplete="new-password"
            />
          </div>

          <div className="field">
            <label>Confirmar senha</label>
            <input
              type="password"
              value={form.confirm}
              onChange={set('confirm')}
              placeholder="Repita a senha"
              required
              autoComplete="new-password"
            />
          </div>

          {error && <p className="error">{error}</p>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Criando...' : 'Criar conta →'}
          </button>
        </form>

        <p className="footer-link">
          Já tem conta? <a href="/login">Entrar</a>
        </p>
      </div>

      <style jsx>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0f0f1a; color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; min-height: 100vh; }

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

        .hint { color: #475569; font-weight: 400; }

        .input-wrapper {
          display: flex;
          align-items: center;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          overflow: hidden;
          transition: border-color 0.2s;
        }

        .input-wrapper:focus-within {
          border-color: rgba(139, 92, 246, 0.6);
        }

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

        .field-hint { font-size: 12px; color: #475569; }

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
