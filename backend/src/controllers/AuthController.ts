import { NextFunction, Request, Response } from 'express'
import { AuthService } from '../services/AuthService'
import { UserRole } from '../entities/User'
import { ApiSuccess } from '~/utils/ApiSuccess'
import { ApiError } from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { UserLoginGoogle, IRegisterRequest, ILoginRequest } from '~/interfaces/IUser'
import dotenv from 'dotenv'
dotenv.config()

export class AuthController {
  private authService: AuthService

  constructor() {
    this.authService = new AuthService()
    this.googleCallback = this.googleCallback.bind(this)
    this.register = this.register.bind(this)
    this.login = this.login.bind(this)
    this.getProfile = this.getProfile.bind(this)
    this.logout = this.logout.bind(this)
    this.searchUsers = this.searchUsers.bind(this)
  }

  private validateRegisterRequest(req: Request): IRegisterRequest {
    const { username, password, fullName, role, email } = req.body

    if (!username || !password) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Tên đăng nhập và mật khẩu là bắt buộc')
    }

    return {
      username,
      password,
      email: email?.trim() === '' ? null : email,
      fullName,
      role: role as UserRole
    }
  }

  private validateLoginRequest(req: Request): ILoginRequest {
    const { username, password } = req.body

    if (!username || !password) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Tên đăng nhập và mật khẩu là bắt buộc')
    }

    return { username, password }
  }

  private extractTokenFromHeader(req: Request): string {
    const authHeader = req.headers.authorization
    const token = authHeader?.split(' ')[1]

    if (!token) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Token is required')
    }

    return token
  }

  public async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const registerData = this.validateRegisterRequest(req)
      const data = await this.authService.register(registerData)
      new ApiSuccess(data, 'Đăng ký thành công', StatusCodes.CREATED).send(res)
    } catch (err) {
      next(err)
    }
  }

  public async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, password } = this.validateLoginRequest(req)
      const data = await this.authService.login(username, password)
      new ApiSuccess(data, 'Đăng nhập thành công').send(res)
    } catch (err) {
      next(err)
    }
  }

  public async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user
      if (!user) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized')
      }
      new ApiSuccess({ user }, 'Lấy thông tin người dùng thành công').send(res)
    } catch (err) {
      next(err)
    }
  }

  public async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = this.extractTokenFromHeader(req)
      await this.authService.logout(token)
      new ApiSuccess(null, 'Đăng xuất thành công').send(res)
    } catch (err) {
      next(err)
    }
  }

  public async googleCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userData = req.user
      if (!userData) {
        return next(new ApiError(StatusCodes.UNAUTHORIZED, 'Đăng nhập Google thất bại'))
      }

      const { googleId, email, fullName, image } = userData as UserLoginGoogle
      const token = await this.authService.findOrCreateGoogleUser({ email, fullName, image, googleId })

      res.redirect(`${process.env.CLIENT_URL}/auth/google/callback?token=${token}`)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      res.redirect(`${process.env.CLIENT_URL}/login`)
    }
  }

  public async searchUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { query } = req.query
      if (!query || typeof query !== 'string') {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Email tìm kiếm không hợp lệ')
      }

      const users = await this.authService.searchUsers(query)
      new ApiSuccess({ users }, 'Tìm kiếm người dùng theo email thành công').send(res)
    } catch (err) {
      next(err)
    }
  }
}
