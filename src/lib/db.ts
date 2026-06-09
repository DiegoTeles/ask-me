import { neon } from '@neondatabase/serverless'

// Singleton da conexão — reutilizada entre invocações serverless
const sql = neon(process.env.DATABASE_URL!)

export default sql
