import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import sql from '@/lib/db'
import { signToken, sessionCookieOptions } from '@/lib/auth'

const HANDLE_RE = /^[a-zA-Z0-9_]{3,20}$/

// Rotas estáticas que não podem ser usadas como handle (ficariam inacessíveis)
const RESERVED_HANDLES = new Set([
  'admin', 'api', 'login', 'register', 'dashboard', 'q',
  'favicon.ico', 'robots.txt', 'sitemap.xml', '_next',
])

export async function POST(request: NextRequest) {
  try {
    const { handle, password, display_name } = await request.json()

    if (!handle || !HANDLE_RE.test(handle)) {
      return NextResponse.json(
        { error: 'Handle deve ter 3–20 caracteres (letras, números e _).' },
        { status: 400 }
      )
    }

    if (RESERVED_HANDLES.has(handle.toLowerCase())) {
      return NextResponse.json({ error: 'Este handle não está disponível.' }, { status: 409 })
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: 'Senha deve ter pelo menos 6 caracteres.' },
        { status: 400 }
      )
    }

    const [existing] = await sql`
      SELECT id FROM users WHERE lower(handle) = lower(${handle})
    `
    if (existing) {
      return NextResponse.json({ error: 'Este handle já está em uso.' }, { status: 409 })
    }

    const password_hash = await bcrypt.hash(password, 10)
    const [user] = await sql`
      INSERT INTO users (handle, display_name, password_hash)
      VALUES (${handle.toLowerCase()}, ${display_name?.trim() || null}, ${password_hash})
      RETURNING id, handle, display_name
    `

    const token = await signToken({ sub: user.id, handle: user.handle, display_name: user.display_name })
    const res = NextResponse.json({ handle: user.handle }, { status: 201 })
    res.cookies.set(sessionCookieOptions(token))
    return res
  } catch (err) {
    console.error('[POST /api/auth/register]', err)
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
