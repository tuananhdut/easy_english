import express, { Application } from 'express'
import dotenv from 'dotenv'
import morgan from 'morgan'
import cors from 'cors'
import RedisClient from './config/RedisClient'
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

  private async databaseSync(): Promise<void> {}

  private async cacheConnect(): Promise<void> {
    try {
      await RedisClient.connect()
      console.log('✅ Redis connected successfully!')
    } catch (error) {
      console.error('❌ Redis connection error:', error)
    }
  }

  private routes(): void {
    this.app.get('/', (req, res) => {
      res.send('Hello World')
    })
  }

  private plugins(): void {
    this.app.use(express.json())
    this.app.use(cors())
    if (process.env.NODE_ENV === 'development') {
      this.app.use(morgan('dev'))
    } else if (process.env.NODE_ENV === 'production') {
      this.app.use(morgan('combined'))
    }
  }

  private catchError(): void {}
}

export default new App().app
