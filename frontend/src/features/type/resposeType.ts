export interface IApiResponse<T> {
  status: 'success' | 'error'
  message: string
  data: T
}

export interface IApiError {
  statusCode: number
  message: string
  stack?: string
}
