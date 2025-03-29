import { Request, Response, NextFunction } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ApiError } from '~/utils/ApiError'
import ClientRedis from '~/config/RedisClient'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

const clientRedis = ClientRedis.getClient()

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader?.split(' ')[1]

    if (!token) {
      return next(new ApiError(StatusCodes.UNAUTHORIZED, 'Token is required.'))
    }

    const isRevoked = await clientRedis.get(`blacklist:${token}`)
    if (isRevoked) {
      return next(new ApiError(StatusCodes.UNAUTHORIZED, 'Token has been revoked.'))
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY || 'tuananh123') as jwt.JwtPayload
    if (!decoded || !decoded.user) {
      return next(new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid token'))
    }
    req.user = decoded.user
    return next()
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(new ApiError(StatusCodes.UNAUTHORIZED, 'Token has expired. Please log in again.'))
    }
    return next(new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid token'))
  }
}
