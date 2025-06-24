import apiClient from '../../utils/apiClient'
import { IApiResponse } from '../type/resposeType'
import { IStartStudySessionRequest, ICheckAnswerResponse, IStudySession } from './studyType'

export const startStudySession = async (data: IStartStudySessionRequest): Promise<IApiResponse<IStudySession>> => {
  const response = await apiClient.post('/study-sessions/start', data)
  return response.data
}

export const getPaginatedScores = async (
  collectionId: number,
  page: number = 1,
  limit: number = 10
): Promise<
  IApiResponse<{
    scores: Array<{ userId: number; fullname: string; score: number; rank: number }>
    total: number
    currentUserRank?: number
  }>
> => {
  const response = await apiClient.get(`/study-sessions/collection/${collectionId}/scores`, {
    params: { page, limit }
  })
  return response.data
}

export const checkAnswer = async (
  collectionId: number,
  answer: string
): Promise<IApiResponse<ICheckAnswerResponse>> => {
  const response = await apiClient.post(`/study-sessions/${collectionId}/check`, { answer })
  return response.data
}

export const nextPhase = async (collectionId: number): Promise<IApiResponse<IStudySession>> => {
  const response = await apiClient.post(`/study-sessions/${collectionId}/next-phase`)
  return response.data
}

export const startReviewSession = async (data: IStartStudySessionRequest): Promise<IApiResponse<IStudySession>> => {
  const response = await apiClient.post('/study-sessions/review/start', data)
  return response.data
}

export const checkReviewAnswer = async (
  collectionId: number,
  answer: string
): Promise<IApiResponse<ICheckAnswerResponse>> => {
  const response = await apiClient.post(`/study-sessions/review/${collectionId}/check`, { answer })
  return response.data
}
/// tect
