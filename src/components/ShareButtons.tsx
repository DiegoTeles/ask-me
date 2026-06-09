'use client'

import { useState } from 'react'

interface Props {
  slug: string
  storiesUrl: string
  feedUrl: string
}

export default function ShareButtons({ slug, storiesUrl, feedUrl }: Props) {
  const [downloading, setDownloading] = useState<string | null>(null)

  async function downloadImage(url: string, filename: string) {
    setDownloading(filename)
    try {
      const res = await fetch(url)
      const blob = await res.blob()
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = filename
      a.click()
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div className="share-section">
      <h3>Compartilhar</h3>
      <p>Baixe a imagem e poste nos seus Stories ou Feed</p>

      <div className="share-grid">
        <button
          className="share-btn"
          onClick={() => downloadImage(storiesUrl, `resposta-stories-${slug}.png`)}
          disabled={!!downloading}
        >
          <span className="share-icon">📱</span>
          <span className="share-label">Stories</span>
          <span className="share-dim">1080 × 1920</span>
          {downloading === `resposta-stories-${slug}.png` && <span className="downloading">Baixando...</span>}
        </button>

        <button
          className="share-btn"
          onClick={() => downloadImage(feedUrl, `resposta-feed-${slug}.png`)}
          disabled={!!downloading}
        >
          <span className="share-icon">🖼️</span>
          <span className="share-label">Feed / Post</span>
          <span className="share-dim">1080 × 1080</span>
          {downloading === `resposta-feed-${slug}.png` && <span className="downloading">Baixando...</span>}
        </button>
      </div>

      <style jsx>{`
        .share-section {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 28px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        h3 { font-size: 16px; font-weight: 600; }
        p { font-size: 14px; color: #64748b; }
        .share-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .share-btn {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 14px;
          padding: 20px 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          color: #f1f5f9;
          transition: background 0.2s;
        }
        .share-btn:hover:not(:disabled) {
          background: rgba(139, 92, 246, 0.15);
          border-color: rgba(139, 92, 246, 0.3);
        }
        .share-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .share-icon { font-size: 28px; }
        .share-label { font-size: 15px; font-weight: 600; }
        .share-dim { font-size: 11px; color: #475569; }
        .downloading { font-size: 11px; color: #8b5cf6; }
      `}</style>
    </div>
  )
}
