'use client'

import { useState, useEffect } from 'react'

interface Question {
  id: string
  slug: string
  content: string
  answer: string | null
  answered_at: string | null
  utm_source: string | null
  utm_medium: string | null
  created_at: string
  is_visible: boolean
}

interface Stat {
  utm_source: string | null
  total: string
}

const SOURCE_EMOJI: Record<string, string> = {
  instagram: '📸',
  tiktok:    '🎵',
  twitter:   '🐦',
  whatsapp:  '💬',
  direct:    '🔗',
}

export default function AdminPage() {
  const [secret, setSecret]       = useState('')
  const [authed, setAuthed]       = useState(false)
  const [questions, setQuestions] = useState<Question[]>([])
  const [stats, setStats]         = useState<Stat[]>([])
  const [filter, setFilter]       = useState('')
  const [answering, setAnswering] = useState<string | null>(null)
  const [draftAnswer, setDraft]   = useState('')
  const [page, setPage]           = useState(1)
  const [loading, setLoading]     = useState(false)

  async function fetchData(p = 1, src = '') {
    setLoading(true)
    const params = new URLSearchParams({ page: String(p) })
    if (src) params.set('source', src)

    const res = await fetch(`/api/admin?${params}`, {
      headers: { 'x-admin-secret': secret },
    })

    if (res.status === 401) { setAuthed(false); return }

    const data = await res.json()
    setQuestions(data.questions)
    setStats(data.stats)
    setPage(p)
    setLoading(false)
  }

  function login() {
    if (!secret.trim()) return
    setAuthed(true)
    fetchData(1)
  }

  async function submitAnswer(slug: string) {
    if (!draftAnswer.trim()) return

    await fetch('/api/admin', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
      body: JSON.stringify({ slug, answer: draftAnswer, is_visible: true }),
    })

    setAnswering(null)
    setDraft('')
    fetchData(page, filter)
  }

  async function toggleVisibility(slug: string, current: boolean) {
    await fetch('/api/admin', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
      body: JSON.stringify({ slug, is_visible: !current }),
    })
    fetchData(page, filter)
  }

  if (!authed) {
    return (
      <div className="login">
        <div className="login-card">
          <h1>Painel Admin</h1>
          <input
            type="password"
            placeholder="Senha admin"
            value={secret}
            onChange={e => setSecret(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && login()}
          />
          <button onClick={login}>Entrar →</button>
        </div>

        <style jsx global>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: #0f0f1a; color: #f1f5f9; font-family: system-ui, sans-serif; min-height: 100vh; }
          .login { display: flex; align-items: center; justify-content: center; min-height: 100vh; }
          .login-card { display: flex; flex-direction: column; gap: 16px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 40px; min-width: 320px; }
          h1 { font-size: 24px; }
          input { background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.12); border-radius: 10px; padding: 12px 16px; color: #f1f5f9; font-size: 15px; }
          input:focus { outline: none; border-color: rgba(139, 92, 246, 0.6); }
          button { background: #7c3aed; color: white; border: none; border-radius: 10px; padding: 14px; font-size: 15px; font-weight: 600; cursor: pointer; }
        `}</style>
      </div>
    )
  }

  return (
    <div className="admin">
      {/* Stats */}
      <header className="admin-header">
        <h1>Perguntas recebidas</h1>
        <div className="stats">
          {stats.map(s => (
            <button
              key={s.utm_source ?? 'null'}
              className={`stat-pill ${filter === (s.utm_source ?? '') ? 'active' : ''}`}
              onClick={() => {
                const next = s.utm_source ?? ''
                setFilter(next)
                fetchData(1, next)
              }}
            >
              {SOURCE_EMOJI[s.utm_source ?? ''] ?? '❓'}{' '}
              {s.utm_source ?? 'sem origem'}{' '}
              <strong>{s.total}</strong>
            </button>
          ))}
          {filter && (
            <button className="stat-pill clear" onClick={() => { setFilter(''); fetchData(1, '') }}>
              ✕ Limpar filtro
            </button>
          )}
        </div>
      </header>

      {/* Lista de perguntas */}
      <div className="questions-list">
        {loading && <div className="empty">Carregando...</div>}

        {!loading && questions.length === 0 && (
          <div className="empty">Nenhuma pergunta ainda.</div>
        )}

        {questions.map(q => (
          <div key={q.id} className={`q-card ${q.answer ? 'answered' : ''}`}>
            <div className="q-meta">
              <span className="source-tag">
                {SOURCE_EMOJI[q.utm_source ?? ''] ?? '❓'} {q.utm_source ?? 'direto'}/{q.utm_medium ?? '—'}
              </span>
              <span className="date">
                {new Date(q.created_at).toLocaleDateString('pt-BR')}
              </span>
              <span
                className={`visibility-tag ${q.is_visible ? 'visible' : 'hidden'}`}
                onClick={() => toggleVisibility(q.slug, q.is_visible)}
                title="Clique para alternar visibilidade"
              >
                {q.is_visible ? '👁 Visível' : '🚫 Oculta'}
              </span>
            </div>

            <p className="q-content">{q.content}</p>

            {q.answer && (
              <p className="q-answer">✓ {q.answer}</p>
            )}

            {answering === q.id ? (
              <div className="answer-form">
                <textarea
                  value={draftAnswer}
                  onChange={e => setDraft(e.target.value)}
                  placeholder="Escreva sua resposta..."
                  rows={4}
                  autoFocus
                />
                <div className="answer-actions">
                  <button className="btn-save" onClick={() => submitAnswer(q.slug)}>Salvar e publicar</button>
                  <button className="btn-cancel" onClick={() => setAnswering(null)}>Cancelar</button>
                </div>
              </div>
            ) : (
              <button
                className="btn-answer"
                onClick={() => { setAnswering(q.id); setDraft(q.answer ?? '') }}
              >
                {q.answer ? '✏️ Editar resposta' : '💬 Responder'}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Paginação */}
      <div className="pagination">
        {page > 1 && (
          <button onClick={() => fetchData(page - 1, filter)}>← Anterior</button>
        )}
        <span>Página {page}</span>
        {questions.length === 20 && (
          <button onClick={() => fetchData(page + 1, filter)}>Próxima →</button>
        )}
      </div>

      <style jsx global>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0f0f1a; color: #f1f5f9; font-family: system-ui, sans-serif; min-height: 100vh; }
        .admin { max-width: 800px; margin: 0 auto; padding: 32px 24px; }
        .admin-header { margin-bottom: 32px; }
        .admin-header h1 { font-size: 28px; margin-bottom: 16px; }
        .stats { display: flex; flex-wrap: wrap; gap: 8px; }
        .stat-pill { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 100px; padding: 6px 14px; font-size: 13px; color: #94a3b8; cursor: pointer; transition: all 0.15s; }
        .stat-pill.active { background: rgba(139,92,246,0.2); border-color: rgba(139,92,246,0.5); color: #c4b5fd; }
        .stat-pill.clear { color: #ef4444; border-color: rgba(239,68,68,0.3); }
        .questions-list { display: flex; flex-direction: column; gap: 16px; }
        .q-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 24px; display: flex; flex-direction: column; gap: 12px; }
        .q-card.answered { border-color: rgba(139,92,246,0.2); }
        .q-meta { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
        .source-tag { font-size: 12px; background: rgba(255,255,255,0.07); border-radius: 6px; padding: 3px 10px; color: #94a3b8; }
        .date { font-size: 12px; color: #475569; }
        .visibility-tag { font-size: 12px; padding: 3px 10px; border-radius: 6px; cursor: pointer; }
        .visibility-tag.visible { background: rgba(34,197,94,0.1); color: #4ade80; }
        .visibility-tag.hidden { background: rgba(239,68,68,0.1); color: #f87171; }
        .q-content { font-size: 16px; line-height: 1.5; }
        .q-answer { font-size: 14px; color: #8b5cf6; background: rgba(139,92,246,0.08); border-radius: 10px; padding: 12px 16px; line-height: 1.5; }
        .answer-form { display: flex; flex-direction: column; gap: 10px; }
        .answer-form textarea { background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.12); border-radius: 10px; padding: 14px; color: #f1f5f9; font-size: 15px; resize: vertical; font-family: inherit; }
        .answer-form textarea:focus { outline: none; border-color: rgba(139,92,246,0.5); }
        .answer-actions { display: flex; gap: 10px; }
        .btn-save { background: #7c3aed; color: white; border: none; border-radius: 8px; padding: 10px 20px; font-size: 14px; font-weight: 600; cursor: pointer; }
        .btn-cancel { background: transparent; color: #64748b; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 10px 20px; font-size: 14px; cursor: pointer; }
        .btn-answer { background: transparent; color: #8b5cf6; border: 1px solid rgba(139,92,246,0.3); border-radius: 8px; padding: 8px 16px; font-size: 13px; cursor: pointer; align-self: flex-start; }
        .btn-answer:hover { background: rgba(139,92,246,0.1); }
        .pagination { display: flex; gap: 16px; align-items: center; justify-content: center; padding: 32px 0; color: #64748b; font-size: 14px; }
        .pagination button { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 8px 16px; color: #94a3b8; cursor: pointer; }
        .empty { text-align: center; color: #475569; padding: 48px; }
      `}</style>
    </div>
  )
}
