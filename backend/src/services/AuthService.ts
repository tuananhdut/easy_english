import { Repository } from 'typeorm'
import { User, AuthProvider, UserRole } from '~/entities/User'
import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'
import { AppDataSource } from '../config/data-source' // Giả định bạn đã cấu hình TypeORM DataSource
import { ApiError } from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

interface RegisterInput {
  username: string
  gmail: string
  password: string
  fullName?: string
  role?: UserRole
}

// interface LoginInput {
//   gmail: string
//   password: string
// }

// interface GoogleLoginInput {
//   googleId: string
//   gmail: string
//   fullName?: string
//   image?: string
// }

export class AuthService {
  private userRepository: Repository<User>

  constructor() {
    this.userRepository = AppDataSource.getRepository(User)
  }

  async register({ username, gmail, password, fullName, role }: RegisterInput): Promise<{ user: User; token: string }> {
    const existingUser = await this.userRepository.findOne({ where: { username, gmail } })
    if (existingUser) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Tên đăng nhập hoặc email đã tồn tại')
    }

    // Hash mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10)

    // Tạo user mới
    const user = this.userRepository.create({
      username,
      gmail,
      password: hashedPassword,
      fullName,
      role: role || UserRole.STUDENT,
      provider: AuthProvider.LOCAL
    })

    await this.userRepository.save(user)
    delete user.password
    // Tạo JWT
    const token = this.generateToken(user)

    return { user, token }
  }

  async login(username: string, password: string): Promise<{ user: User; token: string }> {
    const user = await this.userRepository.findOne({ where: { username } })
    console.log('User:', user)
    if (!user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Tài khoản không tồn tại')
    }

    const isPasswordValid = await bcrypt.compare(password, user.password || '')
    if (!isPasswordValid) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Mật khẩu không đúng')
    }

    delete user.password
    console.log('User:', user)
    const token = this.generateToken(user)

    return { user, token }
  }

  private generateToken(user: User): string {
    const payload = { user }
    return jwt.sign(payload, process.env.JWT_SECRET_KEY || 'tuananh123', { expiresIn: '1h' })
  }
}
