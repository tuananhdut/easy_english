export enum UserRole {
  STUDENT = 'học sinh',
  TEACHER = 'giáo viên',
  ADMIN = 'quản lý'
}

export interface IUser {
  id: number
  email: string
  fullName: string
  image?: string
  role: string
}
