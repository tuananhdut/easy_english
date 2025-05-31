import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  BaseEntity,
  JoinColumn,
  UpdateDateColumn
} from 'typeorm'
import { User } from './User'
import { Collection } from './Collection'
import { IStudySession, IFlashcardStudy } from '../interfaces/IStudySession'

export enum Phase {
  INTRO = 'introduction',
  QUIZ = 'quiz',
  TYPING = 'typing',
  COMPLETED = 'completed'
}

@Entity('study_sessions')
export class StudySession extends BaseEntity implements IStudySession {
  @PrimaryGeneratedColumn()
  id!: number

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user!: User

  @ManyToOne(() => Collection)
  @JoinColumn({ name: 'collectionId' })
  collection!: Collection

  get userId(): number {
    return this.user.id
  }

  get collectionId(): number {
    return this.collection.id
  }

  @Column('json', { default: '[]' })
  flashcards!: IFlashcardStudy[]

  @Column('int', { default: 0 })
  currentIndex!: number

  @Column('int', { default: 0 })
  score!: number

  @Column({
    type: 'enum',
    enum: Phase,
    default: Phase.INTRO
  })
  status!: Phase

  @CreateDateColumn()
  startTime!: Date

  @Column({ type: 'timestamp', nullable: true })
  endTime?: Date

  @CreateDateColumn()
  created_at!: Date

  @UpdateDateColumn()
  updated_at!: Date
}
