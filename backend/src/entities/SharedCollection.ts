import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { Collection } from './Collection'
import { User } from './User'

export enum SharePermission {
  VIEW = 'view',
  EDIT = 'edit'
}

@Entity({ name: 'shared_collections' })
export class SharedCollection {
  @PrimaryGeneratedColumn()
  id!: number

  @ManyToOne(() => Collection, (collection) => collection.id, { nullable: false, onDelete: 'CASCADE' })
  collection!: Collection

  @ManyToOne(() => User, (user) => user.id, { nullable: false, onDelete: 'CASCADE' })
  shared_with!: User

  @CreateDateColumn({ type: 'timestamp' })
  shared_at!: Date

  @UpdateDateColumn({ type: 'timestamp' })
  last_updated!: Date

  @Column({ type: 'int', default: 0 })
  total_points!: number

  @Column({
    type: 'enum',
    enum: SharePermission,
    default: SharePermission.VIEW
  })
  permission!: SharePermission
}
