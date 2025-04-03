import { NextFunction, Request, Response } from 'express'
import { AuthService, UserLoginGoogle } from '../services/AuthService'
import { UserRole } from '../entities/User'
import { ApiSuccess } from '~/utils/ApiSuccess'
import { ApiError } from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

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
      const { user, token } = await this.authService.register({
        username,
        gmail,
        password,
        fullName,
        role: role as UserRole
      })
      new ApiSuccess({ user, token }, 'Đăng ký thành công', 201).send(res)
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

      const { user, token } = await this.authService.login(username, password)
      new ApiSuccess({ user, token }, 'Đăng nhập thành công').send(res)
    } catch (err) {
      next(err)
    }
  }
  public async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user
      if (!user) {
        throw new ApiError(401, 'Unauthorized')
      }
      new ApiSuccess(user, 'Lấy thông tin người dùng thành công').send(res)
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

      // Gọi AuthService để tìm hoặc tạo user
      const { user, token } = await this.authService.findOrCreateGoogleUser({ gmail, fullName, image, googleId })

      // Trả về phản hồi thành công
      new ApiSuccess({ user, token }, 'Đăng nhập bằng Google thành công').send(res)
    } catch (err) {
      next(err)
    }
  }
}
