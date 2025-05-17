export enum UserRole {
  STUDENT = 'học sinh',
  TEACHER = 'giáo viên',
  ADMIN = 'quản lý'
}

export interface IUser {
  id: string
  email: string | null
  name: string | null
  avatar?: string | null
  role: UserRole
}
