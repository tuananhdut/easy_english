import { Repository, DeepPartial } from 'typeorm'
import { Flashcard } from '../entities/FlashCard'
import { BaseRepository } from './BaseRepository'
import { IFlashCardRequest } from '../interfaces/IFlashCard'
import { Collection } from '../entities/Collection'

export class FlashCardRepository extends BaseRepository<Flashcard> {
  constructor() {
    super(Flashcard)
  }

  async findByCollection(collection: Collection): Promise<Flashcard[]> {
    return this.repository.find({
      where: { collection },
      relations: ['collection']
    })
  }

  async createFlashCard(data: IFlashCardRequest, collection: Collection): Promise<Flashcard> {
    const flashcard = this.repository.create({
      ...data,
      collection
    } as DeepPartial<Flashcard>)
    return this.repository.save(flashcard as Flashcard)
  }

  async findRandomFlashcards(collection: Collection, limit: number): Promise<Flashcard[]> {
    return this.repository
      .createQueryBuilder('flashcard')
      .where('flashcard.collection = :collectionId', { collectionId: collection.id })
      .orderBy('RANDOM()')
      .limit(limit)
      .getMany()
  }
}
