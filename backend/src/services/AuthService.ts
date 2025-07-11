import { AuthProvider, UserRole } from '~/entities/User'
import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'
import { ApiError } from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import ClientRedis from '~/config/RedisClient'
import { IRegisterRequest, IUserResponse, AuthResponse, UserLoginGoogle } from '~/interfaces/IUser'
import { UserRepository } from '~/repositories/UserRepository'
import axios from 'axios'
import path from 'path'
import dotenv from 'dotenv'
import fs from 'fs'
dotenv.config()

const UPLOAD_URL = process.env.UPLOAD_URL || '/uploads/'
const uploadDir = path.join(process.cwd(), 'uploads')

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

  private async generateToken(user: IUserResponse): Promise<string> {
    const payload = { user: user }
    return jwt.sign(payload, process.env.JWT_SECRET_KEY || 'tuananh123', { expiresIn: this.TOKEN_EXPIRATION })
  }

  async register(input: IRegisterRequest): Promise<AuthResponse> {
    this.validateRegisterInput(input)
    const { username, email, password, fullName, role } = input

    const existingUser = await this.userRepository.findOneByUsernameOrEmail(username, email)
    if (existingUser) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Tên đăng nhập hoặc email đã tồn tại')
    }

    const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS)

    const user = await this.userRepository.createUser({
      username,
      email: email ?? undefined,
      password: hashedPassword,
      fullName,
      role: role || UserRole.STUDENT,
      provider: AuthProvider.LOCAL
    })

    const userResponse: IUserResponse = {
      id: user.id,
      email: user.email || null,
      fullName: user.fullName || null,
      image: user.image || null,
      role: user.role,
      point: user.point
    }

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

    const userResponse: IUserResponse = {
      id: user.id,
      email: user.email || null,
      fullName: user.fullName || null,
      image: user.image || null,
      role: user.role,
      point: user.point
    }
    const token = await this.generateToken(userResponse)

    return { user: userResponse, token }
  }

  async logout(token: string): Promise<void> {
    const clientRedis = ClientRedis.getClient()
    await clientRedis.set(`blacklist:${token}`, 'true', 'EX', 60 * 60) // 1 hour expiration
    return Promise.resolve()
  }

  async findOrCreateGoogleUser({ googleId, email, fullName, image }: UserLoginGoogle): Promise<string> {
    if (!googleId || !email) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Google ID và Gmail là bắt buộc')
    }

    const existingUser = await this.userRepository.findByEmail(email)
    if (existingUser) {
      const updatedUser = await this.userRepository.mergeUserData(existingUser, {
        googleId,
        fullName: existingUser.fullName || fullName,
        image: existingUser.image ? existingUser.image : image,
        provider: AuthProvider.GOOGLE
      })

      const userResponse: IUserResponse = {
        id: updatedUser.id,
        email: updatedUser.email || null,
        fullName: updatedUser.fullName || null,
        image: updatedUser.image || null,
        role: updatedUser.role,
        point: updatedUser.point
      }
      return this.generateToken(userResponse)
    }

    let savedImageUrl: string | null = null
    if (image) {
      try {
        const response = await axios.get(image, { responseType: 'arraybuffer' })
        const contentType = response.headers['content-type']

        if (contentType.startsWith('image/') && response.data.length < 5 * 1024 * 1024) {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
          const ext = contentType.split('/')[1] // Lấy phần mở rộng từ content-type
          const fileName = `avatar-${uniqueSuffix}.${ext}`
          const avatarPath = path.join(uploadDir, fileName)

          try {
            await fs.promises.mkdir(uploadDir, { recursive: true })
            await fs.promises.writeFile(avatarPath, response.data)
            savedImageUrl = `${UPLOAD_URL}${fileName}`
          } catch (error) {
            try {
              await fs.promises.unlink(avatarPath)
            } catch (unlinkError) {
              console.error('Error deleting failed image:', unlinkError)
            }
            throw error
          }
        }
      } catch (error) {
        console.error('Error saving Google profile image:', error)
        savedImageUrl = null
      }
    }

    const newUser = await this.userRepository.createUser({
      googleId,
      email,
      fullName: fullName ?? undefined,
      image: savedImageUrl ?? undefined,
      provider: AuthProvider.GOOGLE
    })

    const userResponse: IUserResponse = {
      id: newUser.id,
      email: newUser.email || null,
      fullName: newUser.fullName || null,
      image: newUser.image || null,
      role: newUser.role,
      point: newUser.point
    }
    return this.generateToken(userResponse)
  }

  async searchUsers(query: string): Promise<IUserResponse[]> {
    if (!query || query.trim().length === 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Email tìm kiếm không được để trống')
    }

    const users = await this.userRepository.searchUsers(query)
    return users.map((user) => ({
      id: user.id,
      email: user.email || null,
      fullName: user.fullName || null,
      image: user.image || null,
      role: user.role,
      point: user.point
    }))
  }
}
