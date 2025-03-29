import 'reflect-metadata'
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm'
import { Collection } from './Collection'

@Entity({ name: 'flashcards' })
export class Flashcard {
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

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date
}
