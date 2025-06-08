import apiClient from '../../utils/apiClient'
import { IApiResponse } from '../type/resposeType'
import { IShareCollectionRequest, IConfirmShareCollectionResponse } from './shareCollectionType'

export const shareCollection = async (data: IShareCollectionRequest): Promise<IApiResponse<null>> => {
  const response = await apiClient.post('/shared-collections', {
    collection_id: data.collectionId,
    shared_with_id: data.shared_with_id,
    permission: data.permission || 'view'
  })
  return response.data
}

export const confirmSharedCollection = async (
  token: string
): Promise<IApiResponse<IConfirmShareCollectionResponse>> => {
  const response = await apiClient.get(`/shared-collections/confirm?token=${token}`)
  return response.data
}

export const deleteShareCollection = async (collectionId: number, userId: number): Promise<IApiResponse<null>> => {
  const response = await apiClient.delete('/shared-collections', {
    data: {
      collectionId,
      userId
    }
  })
  return response.data
}
