import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm'
import { Collection } from './Collection'
import { User } from './User'
import { BaseEntity } from './BaseEntity'
import { ISharedCollection } from '../interfaces/ISharedCollection'

export enum SharePermission {
  VIEW = 'view',
  EDIT = 'edit'
}

export enum ShareStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted'
}

@Entity({ name: 'shared_collections' })
export class SharedCollection extends BaseEntity implements ISharedCollection {
  @PrimaryGeneratedColumn()
  id!: number

  @ManyToOne(() => Collection, (collection) => collection.id, { nullable: false, onDelete: 'CASCADE' })
  collection!: Collection

  @ManyToOne(() => User, (user) => user.id, { nullable: false, onDelete: 'CASCADE' })
  shared_with!: User

  @Column({ type: 'int', default: 0 })
  total_points!: number

  @Column({
    type: 'enum',
    enum: SharePermission,
    default: SharePermission.VIEW
  })
  permission!: SharePermission

  @Column({
    type: 'enum',
    enum: ShareStatus,
    default: ShareStatus.PENDING
  })
  status!: ShareStatus
}
