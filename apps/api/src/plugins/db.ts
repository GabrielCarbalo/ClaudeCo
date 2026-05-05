import fp from 'fastify-plugin'
import pkg from 'pg'

const { Pool } = pkg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export default fp(async fastify => {
  fastify.decorate('db', pool)
})
