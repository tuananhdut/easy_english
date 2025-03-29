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
      const { username, gmail, password, fullName, role } = req.body

      if (!username || !password) {
        throw new ApiError(400, 'Tên đăng nhập và mật khẩu là bắt buộc')
      }

      const { user, token } = await this.authService.register({
        username,
        gmail,
        password,
        fullName,
        role: role as UserRole
      })
      new ApiSuccess({ user, token }, 'Đăng ký thành công', 201).send(res)
    } catch (err) {
      next(err) // Chuyển lỗi sang middleware xử lý lỗi
    }
  }
}
