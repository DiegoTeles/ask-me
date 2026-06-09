import { createHash } from 'crypto'
import { customAlphabet } from 'nanoid'

// Slug curto e URL-friendly (ex: "k7x2mP")
const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 8)

export function generateSlug() {
  return nanoid()
}

// Hash do IP para armazenar sem expor dado pessoal (LGPD-friendly)
export function hashIP(ip: string): string {
  return createHash('sha256').update(ip + process.env.ADMIN_SECRET).digest('hex').slice(0, 16)
}

// Extrai parâmetros UTM de uma URL/searchParams
export function extractUTM(searchParams: URLSearchParams) {
  return {
    utm_source:   searchParams.get('utm_source')   || null,
    utm_medium:   searchParams.get('utm_medium')   || null,
    utm_campaign: searchParams.get('utm_campaign') || null,
    ref_token:    searchParams.get('ref')           || null,
  }
}

// Monta URL de compartilhamento com UTMs para cada rede social
export function buildShareLinks(slug: string, baseUrl: string) {
  const base = `${baseUrl}/q/${slug}`

  return {
    instagram: `${base}?utm_source=instagram&utm_medium=stories&ref=${nanoid()}`,
    tiktok:    `${base}?utm_source=tiktok&utm_medium=bio&ref=${nanoid()}`,
    twitter:   `${base}?utm_source=twitter&utm_medium=post&ref=${nanoid()}`,
    whatsapp:  `${base}?utm_source=whatsapp&utm_medium=direct&ref=${nanoid()}`,
    generic:   `${base}?utm_source=direct&ref=${nanoid()}`,
  }
}

// Retorna o IP real do visitante (compatível com Vercel)
export function getRealIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  return forwarded ? forwarded.split(',')[0].trim() : '0.0.0.0'
}
