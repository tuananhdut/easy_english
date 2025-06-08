/* eslint-disable @typescript-eslint/no-explicit-any */
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

interface ShareTokenPayload {
  sharedCollectionId: number
  collectionId: number
  sharedWithId: number
}

export const signToken = (payload: ShareTokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' })
}

export const verifyToken = (token: string): ShareTokenPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as ShareTokenPayload
  } catch (error) {
    throw new Error('Invalid token')
  }
}
