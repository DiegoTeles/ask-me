export default function HomePage() {
  return (
    <main className="container">
      <div className="hero">
        <div className="logo-mark">✦</div>
        <h1>askme</h1>
        <p className="tagline">Receba perguntas anônimas. Responda com honestidade.</p>
        <p className="sub">Crie seu perfil, compartilhe o link e deixe as pessoas perguntarem o que quiserem — sem revelar a identidade de ninguém.</p>

        <div className="cta-group">
          <a href="/register" className="btn-primary">Criar meu perfil →</a>
          <a href="/login" className="btn-outline">Já tenho conta</a>
        </div>
      </div>

      <section className="features">
        <div className="feature">
          <span className="feat-icon">🔒</span>
          <h3>100% anônimo</h3>
          <p>Quem pergunta nunca é identificado. Só você vê as perguntas.</p>
        </div>
        <div className="feature">
          <span className="feat-icon">⚡</span>
          <h3>Resposta rápida</h3>
          <p>Responda direto pelo painel. Suas respostas aparecem no perfil público.</p>
        </div>
        <div className="feature">
          <span className="feat-icon">🔗</span>
          <h3>Compartilhe fácil</h3>
          <p>Um link único. Coloque na bio do Instagram, TikTok ou onde quiser.</p>
        </div>
      </section>

      <style jsx global>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          background: #0f0f1a;
          color: #f1f5f9;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          min-height: 100vh;
        }
        a { color: inherit; }
      `}</style>

      <style jsx>{`
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 80px 24px;
          display: flex;
          flex-direction: column;
          gap: 64px;
        }

        .hero {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 16px;
        }

        .logo-mark {
          font-size: 40px;
          color: #a78bfa;
          margin-bottom: 4px;
        }

        h1 {
          font-size: clamp(40px, 10vw, 64px);
          font-weight: 800;
          letter-spacing: -2px;
          background: linear-gradient(135deg, #f1f5f9 30%, #c4b5fd);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1;
        }

        .tagline {
          font-size: clamp(18px, 4vw, 22px);
          color: #e2e8f0;
          font-weight: 500;
          line-height: 1.4;
        }

        .sub {
          font-size: 15px;
          color: #64748b;
          max-width: 420px;
          line-height: 1.7;
        }

        .cta-group {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          justify-content: center;
          margin-top: 8px;
        }

        .btn-primary {
          background: linear-gradient(135deg, #7c3aed, #6d28d9);
          color: white;
          text-decoration: none;
          border-radius: 12px;
          padding: 15px 28px;
          font-size: 16px;
          font-weight: 600;
          transition: opacity 0.2s, transform 0.1s;
          display: inline-block;
        }
        .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }

        .btn-outline {
          background: transparent;
          color: #a78bfa;
          border: 1px solid rgba(139, 92, 246, 0.4);
          text-decoration: none;
          border-radius: 12px;
          padding: 15px 28px;
          font-size: 16px;
          font-weight: 600;
          transition: background 0.2s;
          display: inline-block;
        }
        .btn-outline:hover { background: rgba(139,92,246,0.1); }

        .features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 16px;
        }

        .feature {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 18px;
          padding: 24px 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .feat-icon { font-size: 28px; }

        .feature h3 { font-size: 15px; font-weight: 600; }

        .feature p { font-size: 13px; color: #64748b; line-height: 1.6; }
      `}</style>
    </main>
  )
}
