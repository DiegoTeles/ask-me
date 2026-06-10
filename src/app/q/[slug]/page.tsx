import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import sql from '@/lib/db'
import ShareButtons from '@/components/ShareButtons'
import styles from './page.module.css'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const [q] = await sql`
    SELECT content, answer FROM questions WHERE slug = ${slug}
  `
  if (!q) return { title: 'Pergunta não encontrada' }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL

  return {
    title: q.content.slice(0, 60),
    description: q.answer ? q.answer.slice(0, 120) : 'Aguardando resposta...',
    openGraph: {
      images: q.answer
        ? [`${appUrl}/api/og?slug=${slug}&format=feed`]
        : [],
    },
  }
}

export default async function QuestionPage({ params }: Props) {
  const { slug } = await params
  const [q] = await sql`
    SELECT slug, content, answer, answered_at, created_at
    FROM questions
    WHERE slug = ${slug}
  `

  if (!q) notFound()

  const appUrl = process.env.NEXT_PUBLIC_APP_URL

  return (
    <main className={styles.container}>
      <a href="/" className={styles.backLink}>← Fazer uma pergunta</a>

      <div className={styles.questionCard}>
        <div className={styles.badge}>Pergunta anônima</div>
        <p className={styles.questionText}>{q.content}</p>
        <span className={styles.meta}>
          {new Date(q.created_at).toLocaleDateString('pt-BR', {
            day: 'numeric', month: 'long', year: 'numeric'
          })}
        </span>
      </div>

      {q.answer ? (
        <>
          <div className={styles.answerCard}>
            <div className={styles.answerLabel}>Resposta</div>
            <p className={styles.answerText}>{q.answer}</p>
          </div>

          <ShareButtons
            slug={q.slug}
            storiesUrl={`${appUrl}/api/og?slug=${q.slug}&format=stories`}
            feedUrl={`${appUrl}/api/og?slug=${q.slug}&format=feed`}
          />
        </>
      ) : (
        <div className={styles.pendingCard}>
          <div className={styles.spinner} />
          <p>Ainda não respondi essa pergunta.</p>
          <span>Volte em breve!</span>
        </div>
      )}
    </main>
  )
}
