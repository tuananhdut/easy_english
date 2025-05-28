import apiClient from '../../utils/apiClient'
import { IApiResponse } from '../type/resposeType'
import { IStatisticsData, IConsecutiveDaysData } from './statisticsType'

export const statisticsLearning = async (): Promise<IApiResponse<IStatisticsData[]>> => {
  const response = await apiClient.get('/statistics/learning')
  return response.data
}

export const statisticsMonthlyLearning = async (): Promise<IApiResponse<IStatisticsData[]>> => {
  const response = await apiClient.get('/statistics/learning/monthly')
  return response.data
}

export const statisticsConsecutiveDays = async (): Promise<IApiResponse<IConsecutiveDaysData>> => {
  const response = await apiClient.get('/statistics/learning/consecutive-days')
  return response.data
}
