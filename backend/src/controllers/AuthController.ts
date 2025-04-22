import { NextFunction, Request, Response } from 'express'
import { AuthService, UserLoginGoogle } from '../services/AuthService'
import { UserRole } from '../entities/User'
import { ApiSuccess } from '~/utils/ApiSuccess'
import { ApiError } from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { IUserResponse } from '~/types/auth.types'
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
  }

  public async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, password, fullName, role } = req.body
      let { gmail } = req.body

      if (!username || !password) {
        throw new ApiError(400, 'Tên đăng nhập và mật khẩu là bắt buộc')
      }

      gmail = gmail?.trim() === '' ? null : gmail
      const data = await this.authService.register({
        username,
        gmail,
        password,
        fullName,
        role: role as UserRole
      })
      new ApiSuccess(data, 'Đăng ký thành công', 201).send(res)
    } catch (err) {
      next(err)
    }
  }

  public async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, password } = req.body

      if (!username || !password) {
        throw new ApiError(400, 'Tên đăng nhập và mật khẩu là bắt buộc')
      }

      const data = await this.authService.login(username, password)
      new ApiSuccess(data, 'Đăng nhập thành công').send(res)
    } catch (err) {
      next(err)
    }
  }
  public async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user as IUserResponse
      if (!user) {
        throw new ApiError(401, 'Unauthorized')
      }
      new ApiSuccess({ user: user }, 'Lấy thông tin người dùng thành công').send(res)
    } catch (err) {
      next(err)
    }
  }

  public async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization
      const token = authHeader?.split(' ')[1]

      if (!token) {
        return next(new ApiError(StatusCodes.UNAUTHORIZED, 'Token is required.'))
      }

      await this.authService.logout(token)
      new ApiSuccess(null, 'Đăng xuất thành công').send(res)
    } catch (err) {
      next(err)
    }
  }

  public async googleCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Lấy dữ liệu từ req.user do Passport cung cấp
      const userData = req.user

      // Kiểm tra nếu không có userData (xác thực thất bại)
      if (!userData) {
        return next(new ApiError(StatusCodes.UNAUTHORIZED, 'Đăng nhập Google thất bại'))
      }

      // Destructuring trực tiếp từ req.user vì dữ liệu đã phẳng
      const { googleId, gmail, fullName, image } = userData as UserLoginGoogle

      const token = await this.authService.findOrCreateGoogleUser({ gmail, fullName, image, googleId })

      res.redirect(`${process.env.CLIENT_URL}/auth/google/callback?token=${token}`)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      res.redirect(`${process.env.CLIENT_URL}/login`)
    }
  }
}
