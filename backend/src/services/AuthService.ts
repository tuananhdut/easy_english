import { User, AuthProvider, UserRole } from '~/entities/User'
import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'
import { ApiError } from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import ClientRedis from '~/config/RedisClient'
import { Leaderboard } from '~/entities/LeaderBoard'
import { IRegisterRequest, IUserResponse, AuthResponse, UserLoginGoogle } from '~/interfaces/IUser'
import { UserRepository } from '~/repositories/UserRepository'

export class AuthService {
  private userRepository: UserRepository
  private readonly SALT_ROUNDS = 10
  private readonly TOKEN_EXPIRATION = '1h'

  constructor() {
    this.userRepository = new UserRepository()
  }

  private validateRegisterInput({ username, password }: IRegisterRequest): void {
    if (!username || username.length < 3) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Username phải có ít nhất 3 ký tự')
    }
    if (!password || password.length < 6) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Password phải có ít nhất 6 ký tự')
    }
  }

  private createUserResponse(user: User): IUserResponse {
    return {
      id: user.id,
      email: user.gmail || null,
      name: user.fullName || null,
      avatar: user.image || null,
      role: user.role
    }
  }

  private async generateToken(user: IUserResponse | User): Promise<string> {
    const payload = { user: this.createUserResponse(user as User) }
    return jwt.sign(payload, process.env.JWT_SECRET_KEY || 'tuananh123', { expiresIn: this.TOKEN_EXPIRATION })
  }

  async register(input: IRegisterRequest): Promise<AuthResponse> {
    this.validateRegisterInput(input)
    const { username, gmail, password, fullName, role } = input

    const existingUser = await this.userRepository.findOneByUsernameOrEmail(username, gmail)
    if (existingUser) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Tên đăng nhập hoặc email đã tồn tại')
    }

    const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS)
    let leaderboard = undefined

    if (!role || role === UserRole.STUDENT) {
      leaderboard = new Leaderboard()
    }

    const user = await this.userRepository.createUser({
      username,
      gmail: gmail ?? undefined,
      password: hashedPassword,
      fullName,
      role: role || UserRole.STUDENT,
      provider: AuthProvider.LOCAL,
      leaderboard: leaderboard ? leaderboard : undefined
    })

    const userResponse = this.createUserResponse(user)
    const token = await this.generateToken(userResponse)

    return { user: userResponse, token }
  }

  async login(username: string, password: string): Promise<AuthResponse> {
    if (!username || !password) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Username và password là bắt buộc')
    }

    const user = await this.userRepository.findByUsername(username)
    if (!user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Tài khoản không tồn tại')
    }

    const isPasswordValid = await bcrypt.compare(password, user.password || '')
    if (!isPasswordValid) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Mật khẩu không đúng')
    }

    const userResponse = this.createUserResponse(user)
    const token = await this.generateToken(userResponse)

    return { user: userResponse, token }
  }

  async logout(token: string): Promise<void> {
    const clientRedis = ClientRedis.getClient()
    await clientRedis.set(`blacklist:${token}`, 'true', 'EX', 60 * 60) // 1 hour expiration
    return Promise.resolve()
  }

  async findOrCreateGoogleUser({ googleId, gmail, fullName, image }: UserLoginGoogle): Promise<string> {
    if (!googleId || !gmail) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Google ID và Gmail là bắt buộc')
    }

    const existingUser = await this.userRepository.findByEmail(gmail)
    if (existingUser) {
      const updatedUser = await this.userRepository.mergeUserData(existingUser, {
        googleId,
        fullName: existingUser.fullName || fullName,
        image: existingUser.image || image,
        provider: AuthProvider.GOOGLE
      })
      return this.generateToken(updatedUser)
    }

    const leaderboard = new Leaderboard()
    const newUser = await this.userRepository.createUser({
      googleId,
      gmail,
      fullName: fullName ?? undefined,
      image: image ?? undefined,
      provider: AuthProvider.GOOGLE,
      leaderboard
    })
    return this.generateToken(newUser)
  }
}
