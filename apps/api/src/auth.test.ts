import Fastify from 'fastify'
import { beforeAll, describe, expect, it } from 'vitest'

import { authRoutes } from './auth'
import jwtPlugin from './plugins/jwt'

describe('auth routes', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret'
  })

  it('registers a new user', async () => {
    const app = Fastify()

    await app.register(jwtPlugin)
    await app.register(authRoutes, { prefix: '/auth' })

    const response = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        email: 'test@example.com',
        password: '12345678',
      },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({
      message: 'User created',
    })

    await app.close()
  })

  it('logs in an existing user and returns a token', async () => {
    const app = Fastify()

    await app.register(jwtPlugin)
    await app.register(authRoutes, { prefix: '/auth' })

    await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        email: 'login@example.com',
        password: '12345678',
      },
    })

    const response = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        email: 'login@example.com',
        password: '12345678',
      },
    })

    expect(response.statusCode).toBe(200)

    const body = response.json()
    expect(body.token).toBeTypeOf('string')
    expect(body.token.length).toBeGreaterThan(0)

    await app.close()
  })

  it('returns the authenticated user from /me with a valid token', async () => {
    const app = Fastify()

    await app.register(jwtPlugin)
    await app.register(authRoutes, { prefix: '/auth' })

    await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        email: 'me@example.com',
        password: '12345678',
      },
    })

    const loginResponse = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        email: 'me@example.com',
        password: '12345678',
      },
    })

    const { token } = loginResponse.json()

    const response = await app.inject({
      method: 'GET',
      url: '/auth/me',
      headers: {
        authorization: `Bearer ${token}`,
      },
    })

    expect(response.statusCode).toBe(200)

    const body = response.json()
    expect(body.user.email).toBe('me@example.com')

    await app.close()
  })
})
