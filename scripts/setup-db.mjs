// scripts/setup-db.mjs
// Rode com: npm run db:setup
import { neon } from '@neondatabase/serverless'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const connStr = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL
if (!connStr) {
  console.error('❌ DATABASE_URL não encontrado. Verifique seu .env.local')
  process.exit(1)
}

const sql    = neon(connStr)
const schema = readFileSync(join(__dirname, '../schema.sql'), 'utf-8')

// Divide em statements individuais (neon não aceita múltiplos de uma vez)
const statements = schema
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'))

console.log(`Executando ${statements.length} statements...`)

for (const statement of statements) {
  await sql(statement)
}

console.log('✅ Banco configurado com sucesso!')
