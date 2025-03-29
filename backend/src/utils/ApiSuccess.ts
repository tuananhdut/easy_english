import { StatusCodes } from 'http-status-codes'
import { Response } from 'express'

export class ApiSuccess<T = unknown> {
  public statusCode: number
  public message: string
  public data: T

  constructor(data: T, message: string = 'Success', statusCode: number = StatusCodes.ACCEPTED) {
    this.statusCode = statusCode
    this.message = message
    this.data = data
  }

  send(res: Response) {
    return res.status(this.statusCode).json({
      status: 'success',
      message: this.message,
      data: this.data
    })
  }
}
