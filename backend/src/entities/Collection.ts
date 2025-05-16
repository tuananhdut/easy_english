import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm'
import { User } from './User'

export enum CollectionLevel {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard'
}

@Entity({ name: 'collections' })
export class Collection {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'varchar', nullable: false })
  name!: string

  @Column({ type: 'text', nullable: true })
  description?: string

  @Column({ type: 'boolean', default: true })
  is_private!: boolean

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date

  @Column({ type: 'varchar', default: 'vi' })
  source_language!: string

  @Column({ type: 'varchar', default: 'en' })
  target_language!: string

  @Column({ type: 'int', default: 0 })
  total_flashcards!: number

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  owner!: User

  @Column({
    type: 'enum',
    enum: CollectionLevel,
    default: CollectionLevel.EASY
  })
  level!: CollectionLevel
}
