import 'reflect-metadata'
import { DataSource } from 'typeorm'
import dotenv from 'dotenv'

// Load biến môi trường từ file .env
dotenv.config()

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'easyenglish',
  synchronize: true, //process.env.NODE_ENV === 'development', //TypeORM sẽ tự động cập nhật schema của database theo entity.
  logging: false, //process.env.NODE_ENV === 'development',
  entities: [__dirname + '/../entities/*.ts'],
  migrations: [__dirname + '/../migrations/*.ts'],
  subscribers: []
})
