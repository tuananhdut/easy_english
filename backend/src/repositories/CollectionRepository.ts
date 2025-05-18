import { Repository, DeepPartial } from 'typeorm'
import { Collection } from '../entities/Collection'
import { BaseRepository } from './BaseRepository'
import { ICollectionRequest } from '../interfaces/ICollection'
import { User } from '../entities/User'

export class CollectionRepository extends BaseRepository<Collection> {
  constructor() {
    super(Collection)
  }

  async findByOwner(owner: User): Promise<Collection[]> {
    return this.repository.find({
      where: { owner },
      relations: ['owner']
    })
  }

  async findPublicCollections(): Promise<Collection[]> {
    return this.repository.find({
      where: { is_private: false },
      relations: ['owner']
    })
  }

  async createCollection(data: ICollectionRequest, owner: User): Promise<Collection> {
    const collection = this.repository.create({
      ...data,
      owner
    } as DeepPartial<Collection>)
    return this.repository.save(collection as Collection)
  }

  async updateTotalFlashcards(id: number, count: number): Promise<Collection | null> {
    await this.repository.update(id, { total_flashcards: count })
    return this.findOne(id)
  }
}
