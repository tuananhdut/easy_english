import { SharePermission } from '../collecion/collectionType'

export interface IShareCollectionRequest {
  collectionId: number
  shared_with_id: number
  permission: SharePermission
}

export interface IConfirmShareCollectionResponse {
  id: number
  created_at: string
  updated_at: string
  total_points: number
  permission: SharePermission
  status: 'accepted' | 'pending'
}
