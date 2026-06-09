import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import sql from '@/lib/db'
import ShareButtons from '@/components/ShareButtons'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [q] = await sql`
    SELECT content, answer FROM questions WHERE slug = ${params.slug}
  `
  if (!q) return { title: 'Pergunta não encontrada' }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL

  return {
    title: q.content.slice(0, 60),
    description: q.answer ? q.answer.slice(0, 120) : 'Aguardando resposta...',
    openGraph: {
      images: q.answer
        ? [`${appUrl}/api/og?slug=${params.slug}&format=feed`]
        : [],
    },
  }
}

export default async function QuestionPage({ params }: Props) {
  const [q] = await sql`
    SELECT slug, content, answer, answered_at, created_at
    FROM questions
    WHERE slug = ${params.slug}
  `

  if (!q) notFound()

  const appUrl = process.env.NEXT_PUBLIC_APP_URL

  return (
    <main className="container">
      <a href="/" className="back-link">← Fazer uma pergunta</a>

      <div className="question-card">
        <div className="badge">Pergunta anônima</div>
        <p className="question-text">{q.content}</p>
        <span className="meta">
          {new Date(q.created_at).toLocaleDateString('pt-BR', {
            day: 'numeric', month: 'long', year: 'numeric'
          })}
        </span>
      </div>

      {q.answer ? (
        <>
          <div className="answer-card">
            <div className="answer-label">Resposta</div>
            <p className="answer-text">{q.answer}</p>
          </div>

          <ShareButtons
            slug={q.slug}
            storiesUrl={`${appUrl}/api/og?slug=${q.slug}&format=stories`}
            feedUrl={`${appUrl}/api/og?slug=${q.slug}&format=feed`}
          />
        </>
      ) : (
        <div className="pending-card">
          <div className="spinner" />
          <p>Ainda não respondi essa pergunta.</p>
          <span>Volte em breve!</span>
        </div>
      )}

      <style jsx global>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          background: #0f0f1a;
          color: #f1f5f9;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          min-height: 100vh;
        }
        .container {
          max-width: 560px;
          margin: 0 auto;
          padding: 40px 24px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .back-link {
          color: #64748b;
          font-size: 14px;
          text-decoration: none;
        }
        .back-link:hover { color: #c4b5fd; }
        .badge {
          display: inline-block;
          background: rgba(139, 92, 246, 0.15);
          border: 1px solid rgba(139, 92, 246, 0.4);
          border-radius: 100px;
          padding: 4px 14px;
          font-size: 11px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #c4b5fd;
          margin-bottom: 16px;
        }
        .question-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px;
          padding: 32px;
        }
        .question-text {
          font-size: 22px;
          line-height: 1.5;
          color: #f1f5f9;
          margin-bottom: 12px;
        }
        .meta { font-size: 13px; color: #475569; }
        .answer-label {
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #8b5cf6;
          margin-bottom: 16px;
        }
        .answer-card {
          background: rgba(139, 92, 246, 0.06);
          border: 1px solid rgba(139, 92, 246, 0.2);
          border-radius: 20px;
          padding: 32px;
        }
        .answer-text {
          font-size: 18px;
          line-height: 1.7;
          color: #cbd5e1;
        }
        .pending-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 48px 24px;
          color: #64748b;
          text-align: center;
        }
        .spinner {
          width: 32px; height: 32px;
          border: 2px solid rgba(139, 92, 246, 0.2);
          border-top-color: #8b5cf6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </main>
  )
}
