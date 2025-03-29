export class ApiError extends Error {
  public statusCode: number

  constructor(statusCode: number, message: string) {
    super(message)

    // Gán tên riêng cho error
    this.name = 'ApiError'

    // Gán HTTP status code
    this.statusCode = statusCode

    // Ghi lại Stack trace (hữu ích khi debug)
    Error.captureStackTrace(this, this.constructor)
  }
}
