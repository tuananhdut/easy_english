import { NextFunction, Request, Response } from 'express'
import { AuthService } from '../services/AuthService'
import { UserRole } from '../entities/User'
import { ApiSuccess } from '~/utils/ApiSuccess'
import { ApiError } from '~/utils/ApiError'
export class AuthController {
  private authService: AuthService

  constructor() {
    this.authService = new AuthService()
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
}
