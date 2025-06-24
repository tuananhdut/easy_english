import { Request, Response, NextFunction } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ApiError } from '~/utils/ApiError'
import ClientRedis from '~/config/RedisClient'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { UserRepository } from '~/repositories/UserRepository'
import { IUserResponse } from '~/interfaces/IUser'
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
      return next(new ApiError(StatusCodes.UNAUTHORIZED, 'Phiên đang nhập đã hết hạn.'))
    }
    const userRepository = new UserRepository()
    const user = await userRepository.findOneById(decoded.user.id)
    if (!user) {
      return next(new ApiError(StatusCodes.UNAUTHORIZED, 'Người dùng không tồn tại.'))
    }

    const userResponse: IUserResponse = {
      id: user.id,
      email: user.email || null,
      fullName: user.fullName || null,
      image: user.image || null,
      role: user.role,
      point: user.point
    }
    req.user = userResponse
    return next()
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(new ApiError(StatusCodes.UNAUTHORIZED, 'Phiên đang nhập đã hết hạn.'))
    }
    return next(new ApiError(StatusCodes.UNAUTHORIZED, 'Phiên đang nhập đã hết hạn.'))
  }
}
