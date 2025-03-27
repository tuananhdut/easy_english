import 'reflect-metadata'
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

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
export class User {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'varchar', unique: true, nullable: false })
  gmail!: string

  @Column({ type: 'varchar', unique: true, nullable: true })
  username?: string

  @Column({ type: 'varchar', nullable: true })
  password?: string

  @Column({ type: 'varchar', nullable: true })
  image?: string

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
  fullName?: string

  @Column({ type: 'varchar', unique: true, nullable: true })
  googleId?: string
}
