import 'reflect-metadata'
import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, BeforeUpdate } from 'typeorm'
import { BaseEntity } from './BaseEntity'
import { IUser } from '../interfaces/IUser'

export enum UserRole {
  STUDENT = 'học sinh',
  TEACHER = 'giáo viên',
  ADMIN = 'quản lý'
}

export enum AuthProvider {
  LOCAL = 'local',
  GOOGLE = 'google'
}

@Entity({ name: 'users' })
export class User extends BaseEntity implements IUser {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'varchar', unique: true, nullable: true })
  email!: string | null

  @Column({ type: 'varchar', unique: true, nullable: true })
  username?: string | null

  @Column({ type: 'varchar', nullable: true })
  password?: string | null

  @Column({ type: 'varchar', nullable: true })
  image?: string | null

  @Column({
    type: 'enum',
    enum: AuthProvider,
    default: AuthProvider.LOCAL,
    nullable: false
  })
  provider!: AuthProvider

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.STUDENT,
    nullable: false
  })
  role!: UserRole

  @Column({ type: 'varchar', nullable: true })
  fullName?: string | null

  @Column({ type: 'varchar', unique: true, nullable: true })
  googleId?: string

  @Column({ type: 'int', default: 0 })
  point!: number

  @BeforeInsert()
  @BeforeUpdate()
  normalizeFields() {
    if (this.email?.trim() === '') {
      this.email = null
    }
    if (this.username?.trim() === '') {
      this.username = null
    }

    // Đảm bảo ít nhất một trong hai trường có giá trị
    if (!this.email && !this.username) {
      throw new Error('Cần ít nhất một trong hai: username hoặc gmail.')
    }
  }
}
