'use client'

import { useState } from 'react'

interface Props {
  recipientHandle: string
}

export default function AskForm({ recipientHandle }: Props) {
  const [content, setContent] = useState('')
  const [status, setStatus]   = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [slug, setSlug]       = useState('')
  const [copied, setCopied]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim() || status === 'loading') return
    setStatus('loading')
    try {
      const res  = await fetch('/api/questions', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ content: content.trim(), recipient_handle: recipientHandle }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSlug(data.slug)
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(`${window.location.origin}/q/${slug}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (status === 'success') {
    return (
      <div className="success-card">
        <div className="checkmark">✓</div>
        <h2>Pergunta enviada!</h2>
        <p>Quando @{recipientHandle} responder, você verá aqui:</p>
        <a href={`/q/${slug}`} className="link-pill">
          {typeof window !== 'undefined' ? window.location.origin : ''}/q/{slug}
        </a>
        <button onClick={copyLink} className="btn-secondary">
          {copied ? 'Copiado!' : 'Copiar link'}
        </button>
        <button onClick={() => { setStatus('idle'); setContent('') }} className="btn-ghost">
          Fazer outra pergunta
        </button>

        <style jsx>{`
          .success-card {
            display: flex; flex-direction: column; align-items: center; gap: 14px;
            background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
            border-radius: 20px; padding: 36px 24px; text-align: center;
          }
          .checkmark {
            width: 52px; height: 52px; border-radius: 50%; display: flex;
            align-items: center; justify-content: center; font-size: 22px; color: #4ade80;
            background: rgba(34,197,94,0.12); border: 1px solid rgba(34,197,94,0.3);
          }
          h2 { font-size: 20px; }
          p { color: #94a3b8; font-size: 14px; }
          .link-pill {
            background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
            border-radius: 100px; padding: 8px 18px; font-size: 13px; color: #c4b5fd;
            text-decoration: none; word-break: break-all;
          }
          .btn-secondary {
            background: rgba(139,92,246,0.15); color: #c4b5fd;
            border: 1px solid rgba(139,92,246,0.3); border-radius: 12px;
            padding: 12px 24px; font-size: 15px; cursor: pointer; transition: background 0.2s;
          }
          .btn-secondary:hover { background: rgba(139,92,246,0.25); }
          .btn-ghost { background: transparent; color: #64748b; border: none; font-size: 14px; cursor: pointer; text-decoration: underline; }
        `}</style>
      </div>
    )
  }

  return (
    <div className="form-section">
      <div className="form-header">
        <span className="badge">100% anônimo</span>
        <p>Faça uma pergunta para @{recipientHandle}. Sua identidade nunca é revelada.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder={`Pergunte algo para @${recipientHandle}...`}
          maxLength={500}
          rows={4}
          required
          disabled={status === 'loading'}
        />
        <div className="char-count">{content.length}/500</div>

        {status === 'error' && <p className="error-msg">Algo deu errado. Tente novamente.</p>}

        <button
          type="submit"
          className="btn-primary"
          disabled={status === 'loading' || content.trim().length < 3}
        >
          {status === 'loading' ? 'Enviando...' : 'Enviar anonimamente →'}
        </button>
      </form>

      <style jsx>{`
        .form-section { display: flex; flex-direction: column; gap: 16px; }

        .form-header { text-align: center; display: flex; flex-direction: column; gap: 8px; align-items: center; }

        .badge {
          display: inline-block; background: rgba(139,92,246,0.15);
          border: 1px solid rgba(139,92,246,0.35); border-radius: 100px;
          padding: 4px 14px; font-size: 11px; letter-spacing: 1.5px;
          text-transform: uppercase; color: #c4b5fd;
        }

        .form-header p { color: #64748b; font-size: 14px; }

        form { display: flex; flex-direction: column; gap: 10px; }

        textarea {
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px; padding: 18px; color: #f1f5f9; font-size: 15px;
          line-height: 1.6; resize: vertical; font-family: inherit;
          transition: border-color 0.2s; width: 100%;
        }
        textarea:focus { outline: none; border-color: rgba(139,92,246,0.6); }
        textarea::placeholder { color: #475569; }

        .char-count { text-align: right; font-size: 12px; color: #475569; }
        .error-msg { color: #f87171; font-size: 14px; }

        .btn-primary {
          background: linear-gradient(135deg, #7c3aed, #6d28d9); color: white;
          border: none; border-radius: 12px; padding: 15px 24px; font-size: 16px;
          font-weight: 600; cursor: pointer; transition: opacity 0.2s, transform 0.1s; width: 100%;
        }
        .btn-primary:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
      `}</style>
    </div>
  )
}
