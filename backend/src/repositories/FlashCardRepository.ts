import { DeepPartial } from 'typeorm'
import { Flashcard } from '../entities/FlashCard'
import { BaseRepository } from './BaseRepository'
import { IFlashCardRequest, IFlashCardResponse } from '../interfaces/IFlashCard'
import { Collection } from '../entities/Collection'

export class FlashCardRepository extends BaseRepository<Flashcard> {
  constructor() {
    super(Flashcard)
  }

  async findByCollection(collection: Collection): Promise<Flashcard[]> {
    return this.repository.find({
      where: { collection: { id: collection.id } }
    })
  }

  async createFlashCard(data: IFlashCardRequest, collection: Collection): Promise<IFlashCardResponse> {
    const flashcard = this.repository.create({
      ...data,
      collection
    } as DeepPartial<Flashcard>)
    return this.repository.save(flashcard as Flashcard)
  }

  async findRandomFlashcards(collection: Collection, includeId?: number): Promise<Flashcard[]> {
    // First get all flashcard IDs for the collection, excluding the includeId
    const flashcardIds = await this.repository
      .createQueryBuilder('flashcard')
      .select('flashcard.id')
      .where('flashcard.collection = :collectionId', { collectionId: collection.id })
      .andWhere(includeId ? 'flashcard.id != :includeId' : '1=1', { includeId })
      .getMany()

    if (flashcardIds.length === 0) {
      // If no other flashcards exist, just return the includeId flashcard if provided
      if (includeId) {
        return this.repository.findBy({ id: includeId })
      }
      return []
    }

    // Get 3 random flashcards
    const randomFlashcards = await this.repository
      .createQueryBuilder('flashcard')
      .where('flashcard.id IN (:...ids)', {
        ids: flashcardIds
          .map((value) => ({ value, sort: Math.random() }))
          .sort((a, b) => a.sort - b.sort)
          .map(({ value }) => value.id)
          .slice(0, 4)
      })
      .getMany()

    // If includeId is provided, get that flashcard and add it to the result
    if (includeId) {
      const includeFlashcard = await this.repository.findOneBy({ id: includeId })
      if (includeFlashcard) {
        randomFlashcards.push(includeFlashcard)
      }
    }

    // Shuffle the final array
    return randomFlashcards
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value)
  }

  async findSuggestFlashcards(query: string, source: string, target: string): Promise<IFlashCardResponse[]> {
    return this.repository
      .createQueryBuilder('flashcard')
      .where('flashcard.source_language = :source', { source })
      .andWhere('flashcard.target_language = :target', { target })
      .andWhere('flashcard.is_private = :isPrivate', { isPrivate: false })
      .andWhere('flashcard.term LIKE :query', { query: `%${query}%` })
      .limit(10)
      .getMany()
  }

  async findFirstFlashcards(collection: Collection, limit: number): Promise<Flashcard[]> {
    return this.repository
      .createQueryBuilder('flashcard')
      .leftJoinAndSelect('flashcard.userProgress', 'userProgress')
      .where('flashcard.collection = :collectionId', { collectionId: collection.id })
      .andWhere('userProgress.id IS NULL')
      .orderBy('flashcard.created_at', 'ASC')
      .take(limit)
      .getMany()
  }
}
