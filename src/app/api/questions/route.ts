import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { generateSlug, hashIP, getRealIP } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content, utm_source, utm_medium, utm_campaign, ref_token, recipient_handle } = body

    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'Pergunta inválida.' }, { status: 400 })
    }

    const trimmed = content.trim()
    if (trimmed.length < 3 || trimmed.length > 500) {
      return NextResponse.json(
        { error: 'A pergunta deve ter entre 3 e 500 caracteres.' },
        { status: 400 }
      )
    }

    // Resolve destinatário
    let recipientId: string | null = null
    if (recipient_handle) {
      const [user] = await sql`SELECT id FROM users WHERE handle = ${recipient_handle.toLowerCase()}`
      if (!user) {
        return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 })
      }
      recipientId = user.id
    }

    const ip     = getRealIP(request)
    const ipHash = hashIP(ip)
    const ua     = request.headers.get('user-agent') || null
    const slug   = generateSlug()

    const [question] = await sql`
      INSERT INTO questions
        (slug, content, recipient_id, utm_source, utm_medium, utm_campaign, ref_token, ip_hash, user_agent)
      VALUES
        (${slug}, ${trimmed}, ${recipientId}, ${utm_source ?? null}, ${utm_medium ?? null},
         ${utm_campaign ?? null}, ${ref_token ?? null}, ${ipHash}, ${ua})
      RETURNING id, slug, created_at
    `

    return NextResponse.json({ slug: question.slug }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/questions]', err)
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
