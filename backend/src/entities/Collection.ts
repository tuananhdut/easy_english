import 'reflect-metadata'
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm'
import { User } from './User'

@Entity({ name: 'collections' })
export class Collection {
  @PrimaryGeneratedColumn()
  id!: number

  @ManyToOne(() => User, (user) => user.id, { nullable: false, onDelete: 'CASCADE' })
  user!: User

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
}
