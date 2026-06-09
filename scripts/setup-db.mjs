// scripts/setup-db.mjs
// Rode com: node scripts/setup-db.mjs
import { neon } from '@neondatabase/serverless'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const sql = neon(process.env.DATABASE_URL)
const schema = readFileSync(join(__dirname, '../schema.sql'), 'utf-8')

console.log('Criando tabelas no banco...')
await sql(schema)
console.log('✅ Banco configurado com sucesso!')
