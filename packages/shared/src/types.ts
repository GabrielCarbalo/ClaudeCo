export interface ApiResponse<T = unknown> {
  data: T
  error?: string
  timestamp: string
}

export interface HealthResponse {
  status: 'ok' | 'error'
  timestamp: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}
export type LoginRequest = {
  email: string
  password: string
}

export type RegisterRequest = {
  email: string
  password: string
  name?: string
}

export type AuthTokens = {
  accessToken: string
}

export type UserProfile = {
  id: string
  email: string
  name?: string
  createdAt: string
}
