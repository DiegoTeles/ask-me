import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import sql from '@/lib/db'
import AskForm from './AskForm'

interface Props {
  params: Promise<{ handle: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params
  const [user] = await sql`SELECT handle, display_name FROM users WHERE handle = ${handle.toLowerCase()}`
  if (!user) return { title: 'Usuário não encontrado' }
  const name = user.display_name || `@${user.handle}`
  return {
    title: `${name} — Me pergunte qualquer coisa`,
    description: `Faça uma pergunta anônima para ${name}.`,
  }
}

export default async function ProfilePage({ params }: Props) {
  const { handle } = await params
  const [user] = await sql`
    SELECT id, handle, display_name, bio, avatar_color
    FROM users WHERE handle = ${handle.toLowerCase()}
  `
  if (!user) notFound()

  const questions = await sql`
    SELECT slug, content, answer, answered_at
    FROM questions
    WHERE recipient_id = ${user.id} AND is_visible = true AND answer IS NOT NULL
    ORDER BY answered_at DESC
    LIMIT 30
  `

  const initials = (user.display_name || user.handle)
    .split(' ')
    .slice(0, 2)
    .map((w: string) => w[0]?.toUpperCase())
    .join('')

  return (
    <main className="container">
      {/* Profile header */}
      <section className="profile-header">
        <div className="avatar" style={{ background: user.avatar_color || '#7c3aed' }}>
          {initials}
        </div>
        <div className="profile-info">
          <h1>{user.display_name || `@${user.handle}`}</h1>
          <span className="handle">@{user.handle}</span>
          {user.bio && <p className="bio">{user.bio}</p>}
        </div>
      </section>

      {/* Anonymous question form */}
      <AskForm recipientHandle={user.handle} />

      {/* Public answered questions */}
      {questions.length > 0 && (
        <section className="qa-feed">
          <h2 className="feed-title">Perguntas respondidas</h2>
          <div className="qa-list">
            {questions.map((q: { slug: string; content: string; answer: string; answered_at: string }) => (
              <a href={`/q/${q.slug}`} key={q.slug} className="qa-card">
                <p className="qa-question">{q.content}</p>
                <p className="qa-answer">{q.answer}</p>
                <span className="qa-meta">
                  {new Date(q.answered_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                </span>
              </a>
            ))}
          </div>
        </section>
      )}

      <style jsx global>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          background: #0f0f1a;
          color: #f1f5f9;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          min-height: 100vh;
        }
      `}</style>

      <style jsx>{`
        .container {
          max-width: 560px;
          margin: 0 auto;
          padding: 40px 20px 80px;
          display: flex;
          flex-direction: column;
          gap: 36px;
        }

        .profile-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          text-align: center;
        }

        .avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          font-weight: 700;
          color: white;
          letter-spacing: -1px;
          flex-shrink: 0;
        }

        .profile-info { display: flex; flex-direction: column; gap: 4px; }

        h1 {
          font-size: 24px;
          font-weight: 700;
          background: linear-gradient(135deg, #f1f5f9, #c4b5fd);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .handle { font-size: 14px; color: #64748b; }

        .bio { font-size: 15px; color: #94a3b8; line-height: 1.5; margin-top: 4px; }

        .feed-title {
          font-size: 14px;
          font-weight: 600;
          color: #64748b;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          margin-bottom: -20px;
        }

        .qa-list { display: flex; flex-direction: column; gap: 12px; }

        .qa-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 18px;
          padding: 20px;
          display: block;
          text-decoration: none;
          color: inherit;
          transition: border-color 0.2s, background 0.2s;
          position: relative;
        }

        .qa-card:hover {
          border-color: rgba(139, 92, 246, 0.3);
          background: rgba(139, 92, 246, 0.04);
        }

        .qa-question {
          font-size: 15px;
          color: #94a3b8;
          line-height: 1.5;
          margin-bottom: 10px;
        }

        .qa-answer {
          font-size: 16px;
          color: #f1f5f9;
          line-height: 1.6;
          font-weight: 500;
        }

        .qa-meta {
          display: block;
          font-size: 12px;
          color: #475569;
          margin-top: 10px;
        }
      `}</style>
    </main>
  )
}
