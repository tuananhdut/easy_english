import { User } from '../entities/User'

export interface ILeaderBoard {
  id: number
  user: User
  total_points: number
  created_at: Date
  updated_at: Date
}

export interface ILeaderBoardRequest {
  user_id: number
  total_points: number
  last_updated: Date
}
