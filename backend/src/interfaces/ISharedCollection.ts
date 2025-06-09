import { Collection } from '../entities/Collection'
import { User } from '../entities/User'
import { SharePermission, ShareStatus } from '../entities/SharedCollection'

export interface ISharedCollection {
  id: number
  collection: Collection
  shared_with: User
  permission: SharePermission
  created_at: Date
  updated_at: Date
  status: ShareStatus
}

export interface ISharedCollectionRequest {
  collection_id: number
  shared_with_id: number
  permission: SharePermission
}
