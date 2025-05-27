import apiClient from '../../utils/apiClient'
import { IApiResponse } from '../type/resposeType'
import { IStartStudySessionRequest, IStartStudySessionResponse, ICheckAnswerResponse } from './studyType'

export const startStudySession = async (
  data: IStartStudySessionRequest
): Promise<IApiResponse<IStartStudySessionResponse>> => {
  const response = await apiClient.post('/study-sessions/start', data)
  return response.data
}

export const checkAnswer = async (sessionId: number, answer: string): Promise<IApiResponse<ICheckAnswerResponse>> => {
  const response = await apiClient.post(`/study-sessions/${sessionId}/check`, { answer })
  return response.data
}
/// tect
