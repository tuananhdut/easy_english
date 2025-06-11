import {
  Entity,
  Column,
  ManyToOne,
  CreateDateColumn,
  BaseEntity,
  JoinColumn,
  UpdateDateColumn,
  PrimaryColumn
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

@Entity('study_sessions', { orderBy: { userId: 'ASC', collectionId: 'ASC' } })
export class StudySession extends BaseEntity implements IStudySession {
  @PrimaryColumn('int')
  userId!: number

  @PrimaryColumn('int')
  collectionId!: number

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user!: User

  @ManyToOne(() => Collection)
  @JoinColumn({ name: 'collectionId' })
  collection!: Collection

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
