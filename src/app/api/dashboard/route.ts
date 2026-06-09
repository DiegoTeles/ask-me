import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const page   = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const offset = (page - 1) * 20

  const questions = await sql`
    SELECT id, slug, content, answer, answered_at, is_visible, created_at
    FROM questions
    WHERE recipient_id = ${session.sub}
    ORDER BY
      CASE WHEN answer IS NULL THEN 0 ELSE 1 END,
      created_at DESC
    LIMIT 20 OFFSET ${offset}
  `

  const [{ count }] = await sql`
    SELECT COUNT(*)::int AS count FROM questions WHERE recipient_id = ${session.sub}
  `

  return NextResponse.json({ questions, page, total: count })
}

export async function PATCH(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })

  const { slug, answer, is_visible } = await request.json()

  const [existing] = await sql`
    SELECT id, answer, is_visible FROM questions
    WHERE slug = ${slug} AND recipient_id = ${session.sub}
  `
  if (!existing) return NextResponse.json({ error: 'Pergunta não encontrada.' }, { status: 404 })

  const newAnswer    = answer     !== undefined ? (answer?.trim() || null)    : existing.answer
  const newVisible   = is_visible !== undefined ? is_visible                  : existing.is_visible
  const newAnsweredAt = newAnswer ? new Date().toISOString() : null

  const [updated] = await sql`
    UPDATE questions
    SET
      answer      = ${newAnswer},
      answered_at = ${newAnswer ? newAnsweredAt : null},
      is_visible  = ${newVisible}
    WHERE slug = ${slug}
    RETURNING id, slug, content, answer, answered_at, is_visible, created_at
  `

  return NextResponse.json({ question: updated })
}

export async function DELETE(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })

  const { slug } = await request.json()

  await sql`
    DELETE FROM questions WHERE slug = ${slug} AND recipient_id = ${session.sub}
  `

  return NextResponse.json({ ok: true })
}
