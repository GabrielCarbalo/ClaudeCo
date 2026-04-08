import type { HealthResponse } from '@claudeco/shared'
import { describe, expect, it } from 'vitest'

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
