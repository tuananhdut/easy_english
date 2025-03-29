import express, { Application, Request, Response, NextFunction } from 'express'
import dotenv from 'dotenv'
import morgan from 'morgan'
import cors from 'cors'
import RedisClient from './config/RedisClient'
import { AppDataSource } from './config/data-source'
import routes from './routes/index'
import { ApiError } from './utils/ApiError'
import { errorHandlingMiddleware } from './middlewares/errorHandlingMiddleware'
import { StatusCodes } from 'http-status-codes'
dotenv.config()

class App {
  public app: Application

  constructor() {
    this.app = express()
    this.plugins()
    this.databaseSync()
    this.cacheConnect()
    this.routes()
    this.catchError()
  }

  private async databaseSync(): Promise<void> {
    AppDataSource.initialize()
      .then(() => console.log('Database connected!'))
      .catch((err) => console.error('Error connecting to DB', err))
  }

  private async cacheConnect(): Promise<void> {
    try {
      await RedisClient.connect()
      console.log('✅ Redis connected successfully!')
    } catch (error) {
      console.error('❌ Redis connection error:', error)
    }
  }

  private routes(): void {
    this.app.use('/api', routes)
  }

  private plugins(): void {
    this.app.use(express.json())
    this.app.use(express.urlencoded({ extended: true }))
    this.app.use(cors())
    if (process.env.NODE_ENV === 'development') {
      this.app.use(morgan('dev'))
    } else if (process.env.NODE_ENV === 'production') {
      this.app.use(morgan('combined'))
    }
  }

  private catchError(): void {
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      next(new ApiError(StatusCodes.NOT_FOUND, 'Api not found'))
    })
    this.app.use(errorHandlingMiddleware)
  }
}

export default new App().app
