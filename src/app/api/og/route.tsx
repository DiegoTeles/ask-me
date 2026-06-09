import { NextRequest } from 'next/server'
import { ImageResponse } from 'next/og'
import sql from '@/lib/db'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const slug   = searchParams.get('slug')
  const format = searchParams.get('format') || 'stories' // 'stories' (9:16) ou 'feed' (1:1)

  if (!slug) {
    return new Response('Slug obrigatório', { status: 400 })
  }

  const [q] = await sql`
    SELECT content, answer FROM questions
    WHERE slug = ${slug} AND is_visible = true
  `

  if (!q) {
    return new Response('Não encontrado', { status: 404 })
  }

  const isStories = format === 'stories'
  const width     = isStories ? 1080 : 1080
  const height    = isStories ? 1920 : 1080

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f0f1a 0%, #1a0a2e 50%, #0d1b2a 100%)',
          padding: '80px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Tag "pergunta anônima" */}
        <div
          style={{
            display: 'flex',
            background: 'rgba(139, 92, 246, 0.2)',
            border: '1px solid rgba(139, 92, 246, 0.5)',
            borderRadius: '100px',
            padding: '10px 28px',
            color: '#c4b5fd',
            fontSize: '28px',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            marginBottom: '60px',
          }}
        >
          PERGUNTA ANÔNIMA
        </div>

        {/* Pergunta */}
        <div
          style={{
            display: 'flex',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '24px',
            padding: '48px',
            marginBottom: '48px',
            width: '100%',
          }}
        >
          <p
            style={{
              color: '#f1f5f9',
              fontSize: isStories ? '52px' : '48px',
              lineHeight: '1.4',
              margin: 0,
              textAlign: 'center',
              width: '100%',
            }}
          >
            {q.content}
          </p>
        </div>

        {/* Resposta */}
        {q.answer && (
          <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            <div style={{ display: 'flex', color: '#8b5cf6', fontSize: '24px', marginBottom: '16px', letterSpacing: '1px' }}>
              MINHA RESPOSTA
            </div>
            <p
              style={{
                color: '#cbd5e1',
                fontSize: isStories ? '42px' : '38px',
                lineHeight: '1.5',
                margin: 0,
              }}
            >
              {q.answer}
            </p>
          </div>
        )}

        {/* Rodapé com URL */}
        <div
          style={{
            position: 'absolute',
            bottom: '60px',
            color: 'rgba(255,255,255,0.3)',
            fontSize: '26px',
          }}
        >
          {process.env.NEXT_PUBLIC_APP_URL}
        </div>
      </div>
    ),
    { width, height }
  )
}
