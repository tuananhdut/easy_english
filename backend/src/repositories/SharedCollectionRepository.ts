import { DeepPartial } from 'typeorm'
import { SharedCollection, SharePermission, ShareStatus } from '../entities/SharedCollection'
import { BaseRepository } from './BaseRepository'
import { ISharedCollectionRequest } from '../interfaces/ISharedCollection'
import { User } from '../entities/User'
import { Collection } from '../entities/Collection'

export class SharedCollectionRepository extends BaseRepository<SharedCollection> {
  constructor() {
    super(SharedCollection)
  }

  async findBySharedWith(user: User): Promise<SharedCollection[]> {
    return this.repository.find({
      where: { shared_with: user },
      relations: ['shared_with', 'collection']
    })
  }

  async findByCollection(collection: Collection): Promise<SharedCollection[]> {
    return this.repository.find({
      where: { collection },
      relations: ['shared_with', 'collection']
    })
  }

  async createSharedCollection(
    data: ISharedCollectionRequest,
    collection: Collection,
    sharedWith: User
  ): Promise<SharedCollection> {
    const sharedCollection = this.repository.create({
      ...data,
      collection,
      shared_with: sharedWith,
      shared_at: new Date(),
      last_updated: new Date()
    } as DeepPartial<SharedCollection>)
    return this.repository.save(sharedCollection as SharedCollection)
  }

  async updatePermission(id: number, permission: SharePermission): Promise<SharedCollection | null> {
    await this.repository.update(id, {
      permission
    })
    return this.findOne(id)
  }

  async updateStatus(id: number, status: ShareStatus): Promise<SharedCollection | null> {
    await this.repository.update(id, {
      status
    })
    return this.findOne(id)
  }
}
