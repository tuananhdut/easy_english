import 'reflect-metadata'
import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn, UpdateDateColumn } from 'typeorm'
import { User } from './User'

@Entity({ name: 'leaderboard' })
export class Leaderboard {
  @PrimaryColumn({ type: 'int' })
  id!: number

  @OneToOne(() => User, (user) => user.leaderboard, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id' })
  user!: User

  @Column({ type: 'int', default: 0 })
  total_points!: number // Tổng điểm của user trên toàn hệ thống

  @UpdateDateColumn({ type: 'timestamp' })
  last_updated!: Date // Thời gian cập nhật điểm số lần cuối
}
