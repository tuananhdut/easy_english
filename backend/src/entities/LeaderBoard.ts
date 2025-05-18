import 'reflect-metadata'
import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm'
import { User } from './User'
import { BaseEntity } from './BaseEntity'
import { ILeaderBoard } from '../interfaces/ILeaderBoard'

@Entity({ name: 'leaderboard' })
export class Leaderboard extends BaseEntity implements ILeaderBoard {
  @PrimaryColumn({ type: 'int' })
  id!: number

  @OneToOne(() => User, (user) => user.leaderboard, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id' })
  user!: User

  @Column({ type: 'int', default: 0 })
  total_points!: number // Tổng điểm của user trên toàn hệ thống
}
