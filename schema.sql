-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  handle        TEXT UNIQUE NOT NULL,            -- @handle único (lowercase)
  display_name  TEXT,                            -- nome de exibição opcional
  bio           TEXT,                            -- bio do perfil
  avatar_color  TEXT DEFAULT '#7c3aed',          -- cor do avatar gerado
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_handle ON users(handle);

-- Tabela principal de perguntas anônimas
CREATE TABLE IF NOT EXISTS questions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         TEXT UNIQUE NOT NULL,             -- ID curto para a URL pública
  content      TEXT NOT NULL,                    -- Texto da pergunta
  answer       TEXT,                             -- Resposta do destinatário
  answered_at  TIMESTAMPTZ,

  recipient_id UUID REFERENCES users(id),        -- quem recebe a pergunta

  -- Rastreamento de origem (sem login)
  utm_source   TEXT,
  utm_medium   TEXT,
  utm_campaign TEXT,
  ref_token    TEXT,
  ip_hash      TEXT,
  user_agent   TEXT,

  is_visible   BOOLEAN DEFAULT false,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_questions_slug         ON questions(slug);
CREATE INDEX IF NOT EXISTS idx_questions_utm_source   ON questions(utm_source);
CREATE INDEX IF NOT EXISTS idx_questions_created_at   ON questions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_questions_ref_token    ON questions(ref_token);
CREATE INDEX IF NOT EXISTS idx_questions_recipient_id ON questions(recipient_id);

-- Migração: adiciona recipient_id em bancos já existentes
ALTER TABLE questions ADD COLUMN IF NOT EXISTS recipient_id UUID REFERENCES users(id);
