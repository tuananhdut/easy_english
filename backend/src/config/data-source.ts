import 'reflect-metadata'
import { DataSource } from 'typeorm'
import dotenv from 'dotenv'

dotenv.config()

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'easyenglish',
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  entities: [process.env.NODE_ENV === 'production' ? __dirname + '/../entities/*.js' : __dirname + '/../entities/*.ts'],
  migrations: [
    process.env.NODE_ENV === 'production' ? __dirname + '/../migrations/*.js' : __dirname + '/../migrations/*.ts'
  ],
  subscribers: []
})
