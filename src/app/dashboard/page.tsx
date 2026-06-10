'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface Question {
  id: string
  slug: string
  content: string
  answer: string | null
  answered_at: string | null
  is_visible: boolean
  created_at: string
}

interface User {
  handle: string
  display_name: string | null
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser]           = useState<User | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading]     = useState(true)
  const [answerMap, setAnswerMap] = useState<Record<string, string>>({})
  const [saving, setSaving]       = useState<Record<string, boolean>>({})
  const [copied, setCopied]       = useState(false)

  const loadData = useCallback(async () => {
    const [meRes, qRes] = await Promise.all([
      fetch('/api/auth/me'),
      fetch('/api/dashboard'),
    ])
    const { user: me }      = await meRes.json()
    const { questions: qs } = await qRes.json()

    if (!me) { router.push('/login'); return }
    setUser(me)
    setQuestions(qs || [])
    const map: Record<string, string> = {}
    for (const q of (qs || [])) map[q.slug] = q.answer || ''
    setAnswerMap(map)
    setLoading(false)
  }, [router])

  useEffect(() => { loadData() }, [loadData])

  async function saveAnswer(slug: string) {
    const answer = answerMap[slug]?.trim()
    setSaving(s => ({ ...s, [slug]: true }))
    try {
      const res = await fetch('/api/dashboard', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ slug, answer: answer || null }),
      })
      if (res.ok) {
        const { question } = await res.json()
        setQuestions(qs => qs.map(q => q.slug === slug ? question : q))
      }
    } finally {
      setSaving(s => ({ ...s, [slug]: false }))
    }
  }

  async function toggleVisible(slug: string, current: boolean) {
    const res = await fetch('/api/dashboard', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ slug, is_visible: !current }),
    })
    if (res.ok) {
      const { question } = await res.json()
      setQuestions(qs => qs.map(q => q.slug === slug ? question : q))
    }
  }

  async function deleteQuestion(slug: string) {
    if (!confirm('Deletar esta pergunta?')) return
    const res = await fetch('/api/dashboard', {
      method:  'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ slug }),
    })
    if (res.ok) setQuestions(qs => qs.filter(q => q.slug !== slug))
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  function copyProfileLink() {
    if (!user) return
    navigator.clipboard.writeText(`${window.location.origin}/${user.handle}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <main className="container">
        <div className="spinner-wrap"><div className="spinner" /></div>
        <style jsx>{`.container { min-height: 100vh; display: flex; align-items: center; justify-content: center; } .spinner-wrap { display: flex; align-items: center; justify-content: center; } .spinner { width: 32px; height: 32px; border: 3px solid rgba(139,92,246,0.2); border-top-color: #7c3aed; border-radius: 50%; animation: spin 0.8s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </main>
    )
  }

  const unanswered = questions.filter(q => !q.answer)
  const answered   = questions.filter(q => q.answer)

  return (
    <main className="container">
      {/* Top nav */}
      <nav className="topnav">
        <div className="brand">✦ askme</div>
        <div className="nav-right">
          <button className="btn-outline" onClick={copyProfileLink}>
            {copied ? '✓ Copiado!' : `/${user?.handle}`}
          </button>
          <button className="btn-ghost" onClick={logout}>Sair</button>
        </div>
      </nav>

      {/* Profile summary */}
      <section className="profile-bar">
        <div className="avatar-sm">
          {((user?.display_name || user?.handle || '') .split(' ').slice(0, 2).map(w => w[0]?.toUpperCase()).join(''))}
        </div>
        <div>
          <p className="profile-name">{user?.display_name || `@${user?.handle}`}</p>
          <p className="profile-handle">@{user?.handle}</p>
        </div>
        <a href={`/${user?.handle}`} target="_blank" rel="noopener" className="view-profile">
          Ver perfil →
        </a>
      </section>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat"><span className="stat-num">{questions.length}</span><span className="stat-label">total</span></div>
        <div className="stat"><span className="stat-num">{unanswered.length}</span><span className="stat-label">sem resposta</span></div>
        <div className="stat"><span className="stat-num">{answered.length}</span><span className="stat-label">respondidas</span></div>
      </div>

      {/* Unanswered questions */}
      {unanswered.length > 0 && (
        <section className="section">
          <h2 className="section-title">Sem resposta <span className="count-badge">{unanswered.length}</span></h2>
          <div className="q-list">
            {unanswered.map(q => (
              <div key={q.slug} className="q-card">
                <p className="q-content">{q.content}</p>
                <p className="q-time">{new Date(q.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                <textarea
                  className="answer-input"
                  placeholder="Escreva sua resposta..."
                  rows={3}
                  value={answerMap[q.slug] || ''}
                  onChange={e => setAnswerMap(m => ({ ...m, [q.slug]: e.target.value }))}
                />
                <div className="q-actions">
                  <button
                    className="btn-answer"
                    onClick={() => saveAnswer(q.slug)}
                    disabled={saving[q.slug] || !answerMap[q.slug]?.trim()}
                  >
                    {saving[q.slug] ? 'Salvando...' : 'Responder'}
                  </button>
                  <button className="btn-delete" onClick={() => deleteQuestion(q.slug)}>Deletar</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Answered questions */}
      {answered.length > 0 && (
        <section className="section">
          <h2 className="section-title">Respondidas <span className="count-badge">{answered.length}</span></h2>
          <div className="q-list">
            {answered.map(q => (
              <div key={q.slug} className={`q-card answered ${q.is_visible ? 'visible' : ''}`}>
                <p className="q-content">{q.content}</p>
                {answerMap[q.slug] !== undefined && (
                  <textarea
                    className="answer-input"
                    rows={3}
                    value={answerMap[q.slug]}
                    onChange={e => setAnswerMap(m => ({ ...m, [q.slug]: e.target.value }))}
                  />
                )}
                {answerMap[q.slug] === undefined && (
                  <p className="q-answer">{q.answer}</p>
                )}
                <div className="q-actions">
                  {answerMap[q.slug] !== undefined && answerMap[q.slug] !== q.answer ? (
                    <button className="btn-answer" onClick={() => saveAnswer(q.slug)} disabled={saving[q.slug]}>
                      {saving[q.slug] ? 'Salvando...' : 'Salvar edição'}
                    </button>
                  ) : (
                    <button className="btn-outline-sm" onClick={() => setAnswerMap(m => ({ ...m, [q.slug]: q.answer || '' }))}>
                      Editar
                    </button>
                  )}
                  <button
                    className={`btn-visibility ${q.is_visible ? 'active' : ''}`}
                    onClick={() => toggleVisible(q.slug, q.is_visible)}
                  >
                    {q.is_visible ? '👁 Público' : '👁 Privado'}
                  </button>
                  <a href={`/q/${q.slug}`} className="btn-link" target="_blank" rel="noopener">Ver →</a>
                  <button className="btn-delete" onClick={() => deleteQuestion(q.slug)}>×</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {questions.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>Nenhuma pergunta ainda</h3>
          <p>Compartilhe seu perfil para começar a receber perguntas anônimas.</p>
          <button className="btn-primary" onClick={copyProfileLink}>
            {copied ? '✓ Copiado!' : 'Copiar link do perfil'}
          </button>
        </div>
      )}

      <style jsx>{`
        .container { max-width: 680px; margin: 0 auto; padding: 0 20px 80px; display: flex; flex-direction: column; gap: 28px; }

        .topnav {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 0 0; border-bottom: 1px solid rgba(255,255,255,0.07); padding-bottom: 20px;
          position: sticky; top: 0; background: #0f0f1a; z-index: 10;
        }
        .brand { font-size: 18px; font-weight: 700; color: #a78bfa; letter-spacing: -0.5px; }
        .nav-right { display: flex; gap: 10px; align-items: center; }

        .profile-bar {
          display: flex; align-items: center; gap: 14px;
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px; padding: 16px 20px;
        }
        .avatar-sm {
          width: 44px; height: 44px; border-radius: 50%; background: #7c3aed;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; font-weight: 700; flex-shrink: 0;
        }
        .profile-name { font-size: 15px; font-weight: 600; }
        .profile-handle { font-size: 13px; color: #64748b; }
        .view-profile { margin-left: auto; font-size: 13px; color: #a78bfa; text-decoration: none; white-space: nowrap; }
        .view-profile:hover { text-decoration: underline; }

        .stats-row { display: flex; gap: 12px; }
        .stat {
          flex: 1; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px; padding: 16px; display: flex; flex-direction: column; align-items: center; gap: 4px;
        }
        .stat-num { font-size: 22px; font-weight: 700; color: #a78bfa; }
        .stat-label { font-size: 12px; color: #64748b; }

        .section { display: flex; flex-direction: column; gap: 14px; }
        .section-title { font-size: 14px; font-weight: 600; color: #64748b; display: flex; align-items: center; gap: 8px; }
        .count-badge {
          background: rgba(139,92,246,0.15); border: 1px solid rgba(139,92,246,0.3);
          border-radius: 100px; padding: 1px 8px; font-size: 12px; color: #a78bfa;
        }

        .q-list { display: flex; flex-direction: column; gap: 10px; }
        .q-card {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 18px; padding: 20px; display: flex; flex-direction: column; gap: 12px;
        }
        .q-card.answered { border-color: rgba(255,255,255,0.05); }
        .q-card.visible { border-color: rgba(139,92,246,0.2); }

        .q-content { font-size: 15px; color: #e2e8f0; line-height: 1.5; }
        .q-answer { font-size: 15px; color: #94a3b8; line-height: 1.5; background: rgba(255,255,255,0.03); border-radius: 10px; padding: 12px; }
        .q-time { font-size: 12px; color: #475569; }

        .answer-input {
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px; padding: 14px; color: #f1f5f9; font-size: 14px;
          font-family: inherit; resize: vertical; width: 100%; line-height: 1.5; transition: border-color 0.2s;
        }
        .answer-input:focus { outline: none; border-color: rgba(139,92,246,0.5); }

        .q-actions { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }

        .btn-answer {
          background: linear-gradient(135deg, #7c3aed, #6d28d9); color: white;
          border: none; border-radius: 10px; padding: 8px 18px; font-size: 14px;
          font-weight: 600; cursor: pointer; transition: opacity 0.2s;
        }
        .btn-answer:disabled { opacity: 0.4; cursor: not-allowed; }
        .btn-answer:hover:not(:disabled) { opacity: 0.85; }

        .btn-outline {
          background: transparent; color: #a78bfa; border: 1px solid rgba(139,92,246,0.4);
          border-radius: 10px; padding: 8px 16px; font-size: 13px; cursor: pointer; transition: background 0.2s;
        }
        .btn-outline:hover { background: rgba(139,92,246,0.1); }

        .btn-outline-sm {
          background: transparent; color: #94a3b8; border: 1px solid rgba(255,255,255,0.12);
          border-radius: 8px; padding: 6px 14px; font-size: 13px; cursor: pointer;
        }

        .btn-visibility {
          background: transparent; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px;
          padding: 6px 12px; font-size: 13px; color: #64748b; cursor: pointer; transition: all 0.2s;
        }
        .btn-visibility.active { border-color: rgba(139,92,246,0.4); color: #a78bfa; background: rgba(139,92,246,0.08); }

        .btn-link {
          color: #a78bfa; text-decoration: none; font-size: 13px; padding: 6px 8px;
        }
        .btn-link:hover { text-decoration: underline; }

        .btn-delete {
          background: transparent; color: #ef4444; border: none; padding: 6px 10px;
          font-size: 16px; cursor: pointer; border-radius: 8px; margin-left: auto;
          transition: background 0.2s;
        }
        .btn-delete:hover { background: rgba(239,68,68,0.1); }

        .btn-ghost { background: transparent; color: #64748b; border: none; font-size: 14px; cursor: pointer; }
        .btn-ghost:hover { color: #94a3b8; }

        .btn-primary {
          background: linear-gradient(135deg, #7c3aed, #6d28d9); color: white;
          border: none; border-radius: 12px; padding: 14px 28px; font-size: 15px;
          font-weight: 600; cursor: pointer; transition: opacity 0.2s; margin-top: 4px;
        }
        .btn-primary:hover { opacity: 0.9; }

        .empty-state {
          display: flex; flex-direction: column; align-items: center; gap: 12px;
          padding: 60px 24px; text-align: center;
        }
        .empty-icon { font-size: 48px; }
        .empty-state h3 { font-size: 20px; font-weight: 700; }
        .empty-state p { color: #64748b; font-size: 14px; max-width: 280px; line-height: 1.6; }
      `}</style>
    </main>
  )
}
