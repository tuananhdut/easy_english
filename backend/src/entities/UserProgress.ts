import 'reflect-metadata'
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, UpdateDateColumn } from 'typeorm'
import { User } from './User'
import { Flashcard } from './FlashCard'

@Entity({ name: 'user_progress' })
export class UserProgress {
  @PrimaryGeneratedColumn()
  id!: number

  @ManyToOne(() => User, (user) => user.id, { nullable: false, onDelete: 'CASCADE' })
  user!: User

  @ManyToOne(() => Flashcard, (flashcard) => flashcard.id, { nullable: false, onDelete: 'CASCADE' })
  flashcard!: Flashcard

  @Column({ type: 'int', default: 0 })
  study_count!: number // Số lần đã ôn tập flashcard này

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  last_reviewed?: Date // Lần ôn tập gần nhất

  @Column({ type: 'float', default: 2.5 })
  ease_factor!: number // Hệ số dễ dàng (công thức SM-2)

  @Column({ type: 'timestamp', nullable: true })
  next_review?: Date // Lịch ôn tập tiếp theo
}
