import crypto from 'node:crypto'
import bcrypt from 'bcryptjs'
import type { FastifyInstance, FastifyRequest } from 'fastify'

type User = {
  id: string
  email: string
  password: string
}

type AuthBody = {
  email: string
  password: string
}

type AuthenticatedRequest = FastifyRequest & {
  user: {
    id: string
    email: string
    iat?: number
  }
}

const users: User[] = []

export async function authRoutes(app: FastifyInstance) {
  app.post<{ Body: AuthBody }>('/register', async (req, reply) => {
    const { email, password } = req.body

    const existingUser = users.find(u => u.email === email)
    if (existingUser) {
      return reply.status(400).send({ error: 'User already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = {
      id: crypto.randomUUID(),
      email,
      password: hashedPassword,
    }

    users.push(user)

    return { message: 'User created' }
  })

  app.post<{ Body: AuthBody }>('/login', async (req, reply) => {
    const { email, password } = req.body

    const user = users.find(u => u.email === email)
    if (!user) {
      return reply.status(400).send({ error: 'Invalid credentials' })
    }

    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      return reply.status(400).send({ error: 'Invalid credentials' })
    }

    const token = app.jwt.sign({
      id: user.id,
      email: user.email,
    })

    return { token }
  })

  app.get(
    '/me',
    {
      preHandler: [app.authenticate],
    },
    async req => {
      const authReq = req as AuthenticatedRequest
      return { user: authReq.user }
    }
  )
}
