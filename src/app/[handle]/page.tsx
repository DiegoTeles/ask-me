import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import sql from '@/lib/db'
import AskForm from './AskForm'
import styles from './page.module.css'

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
    <main className={styles.container}>
      {/* Profile header */}
      <section className={styles.profileHeader}>
        <div className={styles.avatar} style={{ background: user.avatar_color || '#7c3aed' }}>
          {initials}
        </div>
        <div className={styles.profileInfo}>
          <h1 className={styles.title}>{user.display_name || `@${user.handle}`}</h1>
          <span className={styles.handle}>@{user.handle}</span>
          {user.bio && <p className={styles.bio}>{user.bio}</p>}
        </div>
      </section>

      {/* Anonymous question form */}
      <AskForm recipientHandle={user.handle} />

      {/* Public answered questions */}
      {questions.length > 0 && (
        <section>
          <h2 className={styles.feedTitle}>Perguntas respondidas</h2>
          <div className={styles.qaList}>
            {questions.map((q: { slug: string; content: string; answer: string; answered_at: string }) => (
              <a href={`/q/${q.slug}`} key={q.slug} className={styles.qaCard}>
                <p className={styles.qaQuestion}>{q.content}</p>
                <p className={styles.qaAnswer}>{q.answer}</p>
                <span className={styles.qaMeta}>
                  {new Date(q.answered_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                </span>
              </a>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
