import { describe, it, expect } from 'vitest'
import type { HealthResponse } from '@claudeco/shared'

describe('HealthResponse shape', () => {
  it('has required fields', () => {
    const response: HealthResponse = {
      status: 'ok',
      timestamp: new Date().toISOString(),
    }
    expect(response.status).toBe('ok')
    expect(response.timestamp).toBeTypeOf('string')
  })
})
