import 'reflect-metadata'
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm'
import { Collection } from './Collection'
import { BaseEntity } from './BaseEntity'
import { IFlashCard } from '../interfaces/IFlashCard'

@Entity({ name: 'flashcards' })
export class Flashcard extends BaseEntity implements IFlashCard {
  @PrimaryGeneratedColumn()
  id!: number

  @ManyToOne(() => Collection, (collection) => collection.id, { nullable: false, onDelete: 'CASCADE' })
  collection!: Collection

  @Column({ type: 'text', nullable: false })
  front_text!: string

  @Column({ type: 'text', nullable: false })
  back_text!: string

  @Column({ type: 'varchar', nullable: true })
  image_url?: string

  @Column({ type: 'varchar', nullable: true })
  audio_url?: string

  @Column({ type: 'varchar', nullable: true })
  pronunciation?: string

  @Column({ type: 'boolean', default: true })
  is_private!: boolean

  @Column({ type: 'varchar', default: 'vi' })
  source_language!: string

  @Column({ type: 'varchar', default: 'en' })
  target_language!: string
}
