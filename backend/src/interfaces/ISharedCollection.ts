import { Collection } from '../entities/Collection'
import { User } from '../entities/User'
import { SharePermission } from '../entities/SharedCollection'

export interface ISharedCollection {
  id: number
  collection: Collection
  shared_with: User
  total_points: number
  permission: SharePermission
  created_at: Date
  updated_at: Date
}

export interface ISharedCollectionRequest {
  collection_id: number
  shared_with_id: number
  permission: SharePermission
}
