import 'reflect-metadata'
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm'
import { User } from './User'
import { Flashcard } from './FlashCard'
import { BaseEntity } from './BaseEntity'
import { IUserProgress } from '../interfaces/IUserProgress'

@Entity({ name: 'user_progress' })
export class UserProgress extends BaseEntity implements IUserProgress {
  @PrimaryGeneratedColumn()
  id!: number

  @ManyToOne(() => User, (user) => user.id, { nullable: false, onDelete: 'CASCADE' })
  user!: User

  @ManyToOne(() => Flashcard, (flashcard) => flashcard.id, { nullable: false, onDelete: 'CASCADE' })
  flashcard!: Flashcard

  @Column({ type: 'int', default: 1 })
  study_count!: number // Số lần đã ôn tập flashcard này

  @Column({ type: 'float', default: 1.3 })
  ease_factor!: number // Hệ số dễ dàng (công thức SM-2)

  @Column({ type: 'timestamp', nullable: true })
  next_review?: Date // Lịch ôn tập tiếp theo
}
