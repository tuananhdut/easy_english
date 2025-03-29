import 'reflect-metadata'
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { Collection } from './Collection'
import { User } from './User'

@Entity({ name: 'shared_collections' })
export class SharedCollection {
  @PrimaryGeneratedColumn()
  id!: number

  @ManyToOne(() => Collection, (collection) => collection.id, { nullable: false, onDelete: 'CASCADE' })
  collection!: Collection // Bộ sưu tập được chia sẻ

  @ManyToOne(() => User, (user) => user.id, { nullable: false, onDelete: 'CASCADE' })
  shared_with!: User // Người nhận chia sẻ

  @CreateDateColumn({ type: 'timestamp' })
  shared_at!: Date // Ngày chia sẻ

  @Column({ type: 'int', default: 0 })
  total_points!: number // Tổng điểm của user trong bộ sưu tập này

  @UpdateDateColumn({ type: 'timestamp' })
  last_updated!: Date // Cập nhật lần cuối
}
