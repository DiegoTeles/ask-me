import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? process.env.ADMIN_SECRET ?? 'change-me-in-production'
)

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/dashboard')) {
    const token = request.cookies.get('askme_session')?.value
    if (!token) {
      const url = new URL('/login', request.url)
      url.searchParams.set('next', '/dashboard')
      return NextResponse.redirect(url)
    }
    try {
      await jwtVerify(token, SECRET)
    } catch {
      const url = new URL('/login', request.url)
      url.searchParams.set('next', '/dashboard')
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
