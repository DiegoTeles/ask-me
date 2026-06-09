import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import sql from '@/lib/db'
import { signToken, sessionCookieOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { handle, password } = await request.json()

    if (!handle || !password) {
      return NextResponse.json(
        { error: 'Handle e senha são obrigatórios.' },
        { status: 400 }
      )
    }

    const [user] = await sql`
      SELECT id, handle, display_name, password_hash
      FROM users
      WHERE lower(handle) = lower(${handle})
    `

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return NextResponse.json({ error: 'Handle ou senha incorretos.' }, { status: 401 })
    }

    const token = await signToken({ sub: user.id, handle: user.handle, display_name: user.display_name })
    const res = NextResponse.json({ handle: user.handle })
    res.cookies.set(sessionCookieOptions(token))
    return res
  } catch (err) {
    console.error('[POST /api/auth/login]', err)
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
