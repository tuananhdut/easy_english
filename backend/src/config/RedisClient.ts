/* eslint-disable prettier/prettier */
import Redis from "ioredis";
import dotenv from "dotenv";

// Load biến môi trường từ .env
dotenv.config();


class RedisClient {
  private client: Redis

  constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: Number(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASS || undefined,
      db: Number(process.env.REDIS_DB) || 0,
      retryStrategy: (times) => Math.min(times * 50, 2000),
    })

    this.client.on('connect', () => console.log('✅ Redis connected!'))
    this.client.on('error', (err) => console.error('❌ Redis error:', err))
  }

  public async connect(): Promise<void> {
    await this.client.ping()
  }

  public getClient(): Redis {
    return this.client
  }
}

export default new RedisClient()