# AskMe — Perguntas Anônimas

Plataforma de perguntas anônimas com rastreamento de origem (UTM) e geração de
imagens para Stories e Feed.

## Stack

- **Next.js 15** (App Router)
- **Neon Postgres** (via Vercel Marketplace)
- **Satori** — geração de imagem server-side
- **Vercel** — deploy e hosting

---

## Setup em 5 passos

### 1. Clone e instale

```bash
git clone <seu-repo>
cd askme
npm install
```

### 2. Configure o banco (Neon via Vercel)

1. Acesse [vercel.com/dashboard](https://vercel.com/dashboard)
2. Vá em **Storage** → **Create Database**
3. Escolha **Neon Postgres** (gratuito)
4. Copie a `DATABASE_URL` gerada

### 3. Configure as variáveis de ambiente

```bash
cp .env.local.example .env.local
# Edite .env.local com seus valores
```

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | Connection string do Neon |
| `ADMIN_SECRET` | Senha para acessar /admin |
| `NEXT_PUBLIC_APP_URL` | URL pública (ex: https://askme.vercel.app) |

### 4. Crie as tabelas

```bash
node scripts/setup-db.mjs
```

### 5. Rode localmente

```bash
npm run dev
# http://localhost:3000
```

---

## Deploy na Vercel

```bash
# Instale a CLI
npm i -g vercel

# Deploy
vercel --prod
```

Não esqueça de adicionar as env vars no painel da Vercel:
**Settings → Environment Variables**

---

## Como usar

### Fluxo do visitante

1. Visitante acessa `seusite.com` e envia uma pergunta anônima
2. Recebe um link único `seusite.com/q/[slug]`
3. Quando você responder, a página mostra a resposta
4. Ele pode baixar a imagem de Stories (9:16) ou Feed (1:1)

### Painel admin

Acesse `/admin` e entre com a senha `ADMIN_SECRET`.

No painel você vê:
- **De onde vieram** as perguntas (Instagram, TikTok, Twitter, etc.)
- Filtros por origem
- Botão para responder cada pergunta
- Controle de visibilidade pública

### Links rastreados para cada rede

Quando for compartilhar o link do seu perfil, use as URLs com UTM:

```
Instagram Stories:  seusite.com/?utm_source=instagram&utm_medium=stories
TikTok Bio:         seusite.com/?utm_source=tiktok&utm_medium=bio
Twitter/X:          seusite.com/?utm_source=twitter&utm_medium=post
WhatsApp:           seusite.com/?utm_source=whatsapp&utm_medium=direct
```

---

## Estrutura do projeto

```
src/
├── app/
│   ├── page.tsx              # Formulário principal
│   ├── layout.tsx
│   ├── admin/page.tsx        # Painel de gerenciamento
│   ├── q/[slug]/page.tsx     # Página pública da pergunta
│   └── api/
│       ├── questions/route.ts # POST - nova pergunta
│       ├── admin/route.ts     # GET/PATCH - painel
│       └── og/route.tsx       # GET - gera imagem PNG
├── components/
│   └── ShareButtons.tsx      # Botões de download de imagem
└── lib/
    ├── db.ts                 # Conexão com o Neon
    └── utils.ts              # UTM, slug, hash de IP
```

---

## Considerações de privacidade (LGPD)

- O IP do visitante é **hasheado** antes de ser salvo (não é possível reverter)
- Nenhum cookie de identificação é criado
- A plataforma não revela a identidade do perguntador ao dono
- Adicione uma página `/privacidade` com sua política antes de publicar
