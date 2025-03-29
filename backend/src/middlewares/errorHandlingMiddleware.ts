import { Request, Response, NextFunction } from 'express'
import { StatusCodes, getReasonPhrase } from 'http-status-codes'
import { ApiError } from '../utils/ApiError'
import dotenv from 'dotenv'
dotenv.config()

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandlingMiddleware = (err: ApiError, req: Request, res: Response, next: NextFunction): void => {
  const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR

  const responseError: {
    statusCode: number
    message: string
    stack?: string
  } = {
    statusCode,
    message: err.message || getReasonPhrase(statusCode),
    stack: err.stack
  }

  // Nếu không phải môi trường dev thì không trả stack trace
  if (process.env.NODE_ENV !== 'development') {
    delete responseError.stack
  }

  console.error(responseError)

  res.status(statusCode).json(responseError)
}
