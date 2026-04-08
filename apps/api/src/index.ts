import type { HealthResponse } from '@claudeco/shared'
import cors from '@fastify/cors'
import Fastify from 'fastify'

const app = Fastify({ logger: true })

await app.register(cors, {
  origin: ['http://localhost:3000'],
})

app.get<{ Reply: HealthResponse }>('/api/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() }
})

const PORT = Number(process.env.PORT) || 3001

try {
  await app.listen({ port: PORT, host: '0.0.0.0' })
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
