import { Repository } from 'typeorm'
import { User, AuthProvider, UserRole } from '~/entities/User'
import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'
import { AppDataSource } from '../config/data-source' // Giả định bạn đã cấu hình TypeORM DataSource
import { ApiError } from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import ClientRedis from '~/config/RedisClient'
import { Leaderboard } from '~/entities/LeaderBoard'

interface RegisterInput {
  username: string
  gmail: string
  password: string
  fullName?: string
  role?: UserRole
}

export interface UserLoginGoogle {
  googleId: string | null
  gmail: string | null
  fullName: string | null
  image: string | null
}

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

    let leaderboard = undefined

    if (!role || role === UserRole.STUDENT) {
      leaderboard = new Leaderboard()
    }

    // Tạo user mới
    const user = this.userRepository.create({
      username,
      gmail,
      password: hashedPassword,
      fullName,
      role: role || UserRole.STUDENT,
      provider: AuthProvider.LOCAL,
      leaderboard: leaderboard ? leaderboard : undefined
    })

    await this.userRepository.save(user)
    delete user.password
    // Tạo JWT
    const token = this.generateToken(user)

    return { user, token }
  }

  async login(username: string, password: string): Promise<{ user: User; token: string }> {
    const user = await this.userRepository.findOne({ where: { username } })
    if (!user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Tài khoản không tồn tại')
    }

    const isPasswordValid = await bcrypt.compare(password, user.password || '')
    if (!isPasswordValid) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Mật khẩu không đúng')
    }

    delete user.password
    const token = this.generateToken(user)

    return { user, token }
  }

  async logout(token: string): Promise<void> {
    //bỏ token vào blacklist
    const clientRedis = ClientRedis.getClient()
    await clientRedis.set(`blacklist:${token}`, 'true', 'EX', 60 * 60) // 1 hour expiration
    return Promise.resolve()
  }

  async findOrCreateGoogleUser({
    googleId,
    gmail,
    fullName,
    image
  }: UserLoginGoogle): Promise<{ user: User; token: string }> {
    if (!googleId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Google ID is required')
    }
    if (!gmail) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Gmail is required')
    }
    const existingUser = await this.userRepository.findOne({ where: { gmail } })
    if (existingUser) {
      this.userRepository.merge(existingUser, {
        googleId: googleId,
        fullName: existingUser.fullName || fullName,
        image: existingUser.image || image,
        provider: AuthProvider.GOOGLE
      })
      await this.userRepository.save(existingUser)

      delete existingUser.password
      const token = this.generateToken(existingUser)
      return { user: existingUser, token }
    }

    const leaderboard = new Leaderboard()
    const newUser = this.userRepository.create({
      googleId,
      gmail,
      fullName,
      image,
      provider: AuthProvider.GOOGLE,
      leaderboard: leaderboard
    })
    await this.userRepository.save(newUser)
    delete newUser.password
    const token = this.generateToken(newUser)
    return { user: newUser, token }
  }

  private generateToken(user: User): string {
    const payload = { user }
    return jwt.sign(payload, process.env.JWT_SECRET_KEY || 'tuananh123', { expiresIn: '1h' })
  }
}
