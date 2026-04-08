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
