import { DeepPartial } from 'typeorm'
import { User } from '../entities/User'
import { BaseRepository } from './BaseRepository'
import { IUserRequest } from '../interfaces/IUser'

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super(User)
  }

  async findOneById(id: number): Promise<User | null> {
    return this.repository.findOneBy({ id })
  }

  async findOneByUsernameOrEmail(username: string, email: string | null): Promise<User | null> {
    return this.repository.findOne({
      where: [{ username }, { email: email ?? undefined }]
    })
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOneBy({ email })
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.repository.findOneBy({ username })
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.repository.findOneBy({ googleId })
  }

  async createUser(data: IUserRequest): Promise<User> {
    const user = this.repository.create(data as DeepPartial<User>)
    return this.repository.save(user as User)
  }

  async mergeUserData(existingUser: User, newData: Partial<User>): Promise<User> {
    const mergedData = {
      ...existingUser,
      ...newData,
      fullName: newData.fullName || existingUser.fullName,
      image: newData.image || existingUser.image,
      googleId: newData.googleId || existingUser.googleId,
      provider: newData.provider || existingUser.provider,
      point: newData.point || existingUser.point
    }
    return this.repository.save(mergedData)
  }

  async updatePoints(userId: number, points: number): Promise<User | null> {
    const user = await this.findOneById(userId)
    if (!user) return null

    user.point = points
    return this.repository.save(user)
  }

  async searchUsers(query: string): Promise<User[]> {
    return this.repository
      .createQueryBuilder('user')
      .where('LOWER(user.email) LIKE LOWER(:query)', { query: `%${query}%` })
      .take(5)
      .getMany()
  }
}
