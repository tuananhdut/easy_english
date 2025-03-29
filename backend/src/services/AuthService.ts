import { Repository } from 'typeorm'
import { User, AuthProvider, UserRole } from '~/entities/User'
import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'
import { AppDataSource } from '../config/data-source' // Giả định bạn đã cấu hình TypeORM DataSource

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

  // Đăng ký người dùng mới
  async register({ username, gmail, password, fullName, role }: RegisterInput): Promise<{ user: User; token: string }> {
    // Kiểm tra email đã tồn tại chưa
    const existingUser = await this.userRepository.findOne({ where: { username, gmail } })
    if (existingUser) {
      throw new Error('Tên đăng nhập hoặc email đã tồn tại')
    }

    // Hash mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10)

    // Tạo user mới
    const user = this.userRepository.create({
      username,
      gmail,
      password: hashedPassword,
      fullName,
      role: role || UserRole.STUDENT, // Mặc định là STUDENT
      provider: AuthProvider.LOCAL
    })

    await this.userRepository.save(user)

    // Tạo JWT
    const token = this.generateToken(user)

    return { user, token }
  }

  // // Đăng nhập
  // async login({ gmail, password }: LoginInput): Promise<{ user: User; token: string }> {
  //   const user = await this.userRepository.findOne({ where: { gmail } })
  //   if (!user || user.provider !== AuthProvider.LOCAL) {
  //     throw new Error('Invalid email or password')
  //   }

  //   const isPasswordValid = await bcrypt.compare(password, user.password || '')
  //   if (!isPasswordValid) {
  //     throw new Error('Invalid email or password')
  //   }

  //   const token = this.generateToken(user)
  //   return { user, token }
  // }

  // // Đăng nhập bằng Google
  // async googleLogin({ googleId, gmail, fullName, image }: GoogleLoginInput): Promise<{ user: User; token: string }> {
  //   let user = await this.userRepository.findOne({ where: { googleId } })

  //   if (!user) {
  //     // Nếu chưa có user với googleId này, kiểm tra email
  //     user = await this.userRepository.findOne({ where: { gmail } })
  //     if (user) {
  //       // Nếu email đã tồn tại nhưng không có googleId, cập nhật googleId
  //       user.googleId = googleId
  //       user.provider = AuthProvider.GOOGLE
  //       user.fullName = fullName || user.fullName
  //       user.image = image || user.image
  //     } else {
  //       // Tạo user mới với thông tin từ Google
  //       user = this.userRepository.create({
  //         gmail,
  //         googleId,
  //         fullName,
  //         image,
  //         provider: AuthProvider.GOOGLE,
  //         role: UserRole.STUDENT // Mặc định là STUDENT
  //       })
  //     }
  //     await this.userRepository.save(user)
  //   }

  //   const token = this.generateToken(user)
  //   return { user, token }
  // }

  // Hàm tạo JWT
  private generateToken(user: User): string {
    const payload = { id: user.id, gmail: user.gmail, role: user.role }
    return jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '1h' })
  }

  // // Lấy thông tin user theo ID (có thể dùng cho middleware hoặc profile)
  // async getUserById(id: number): Promise<User> {
  //   const user = await this.userRepository.findOne({ where: { id } })
  //   if (!user) {
  //     throw new Error('User not found')
  //   }
  //   return user
  // }
}
