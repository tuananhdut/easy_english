import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm'
import { User } from './User'
import { BaseEntity } from './BaseEntity'
import { ICollection } from '../interfaces/ICollection'
import { SharedCollection } from './SharedCollection'

export enum CollectionLevel {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard'
}

@Entity({ name: 'collections' })
export class Collection extends BaseEntity implements ICollection {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'varchar', nullable: false })
  name!: string

  @Column({ type: 'text', nullable: true })
  description?: string

  @Column({ type: 'boolean', default: true })
  is_private!: boolean

  @Column({ type: 'varchar', default: 'vi' })
  source_language!: string

  @Column({ type: 'varchar', default: 'en' })
  target_language!: string

  @Column({ type: 'int', default: 0 })
  total_flashcards!: number

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  owner!: User

  @OneToMany(() => SharedCollection, (sharedCollection) => sharedCollection.collection)
  sharedCollections!: SharedCollection[]

  @Column({
    type: 'enum',
    enum: CollectionLevel,
    default: CollectionLevel.EASY
  })
  level!: CollectionLevel
}
