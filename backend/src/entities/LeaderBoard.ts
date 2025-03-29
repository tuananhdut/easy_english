import 'reflect-metadata'
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, UpdateDateColumn } from 'typeorm'
import { User } from './User'

@Entity({ name: 'leaderboard' })
export class Leaderboard {
  @PrimaryGeneratedColumn()
  id!: number

  @ManyToOne(() => User, (user) => user.id, { nullable: false, onDelete: 'CASCADE' })
  user!: User // Người dùng trên bảng xếp hạng

  @Column({ type: 'int', default: 0 })
  total_points!: number // Tổng điểm của user trên toàn hệ thống

  @UpdateDateColumn({ type: 'timestamp' })
  last_updated!: Date // Thời gian cập nhật điểm số lần cuối
}
