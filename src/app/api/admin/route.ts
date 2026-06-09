import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'

// Middleware de autenticação simples por header
function isAuthorized(request: NextRequest): boolean {
  const secret = request.headers.get('x-admin-secret')
  return secret === process.env.ADMIN_SECRET
}

// GET /api/admin?page=1&source=instagram
export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const page   = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const source = searchParams.get('source') // filtra por rede social
  const limit  = 20
  const offset = (page - 1) * limit

  const questions = source
    ? await sql`
        SELECT id, slug, content, answer, answered_at, utm_source, utm_medium,
               utm_campaign, ref_token, created_at, is_visible
        FROM questions
        WHERE utm_source = ${source}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `
    : await sql`
        SELECT id, slug, content, answer, answered_at, utm_source, utm_medium,
               utm_campaign, ref_token, created_at, is_visible
        FROM questions
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `

  // Totais por rede social para o dashboard
  const stats = await sql`
    SELECT utm_source, COUNT(*) as total
    FROM questions
    GROUP BY utm_source
    ORDER BY total DESC
  `

  return NextResponse.json({ questions, stats, page })
}

// PATCH /api/admin — responder uma pergunta
export async function PATCH(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  const { slug, answer, is_visible } = await request.json()

  if (!slug) {
    return NextResponse.json({ error: 'Slug obrigatório.' }, { status: 400 })
  }

  const [updated] = await sql`
    UPDATE questions
    SET
      answer      = COALESCE(${answer ?? null}, answer),
      answered_at = CASE WHEN ${answer ?? null} IS NOT NULL THEN NOW() ELSE answered_at END,
      is_visible  = COALESCE(${is_visible ?? null}, is_visible)
    WHERE slug = ${slug}
    RETURNING slug, answer, answered_at, is_visible
  `

  if (!updated) {
    return NextResponse.json({ error: 'Pergunta não encontrada.' }, { status: 404 })
  }

  return NextResponse.json(updated)
}
