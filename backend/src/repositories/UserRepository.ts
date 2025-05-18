import { DeepPartial } from 'typeorm'
import { User } from '../entities/User'
import { BaseRepository } from './BaseRepository'
import { IUserRequest } from '../interfaces/IUser'

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super(User)
  }

  async findOneByUsernameOrEmail(username: string, gmail: string | null): Promise<User | null> {
    return this.repository.findOne({
      where: [{ username }, { gmail: gmail ?? undefined }]
    })
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOneBy({ gmail: email })
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
      provider: newData.provider || existingUser.provider
    }
    return this.repository.save(mergedData)
  }
}
