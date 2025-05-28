import { User } from '~/entities/User'
import { UserProgressRepository } from '../repositories/UserProgressRepository'
import { IUser } from '~/interfaces/IUser'

export class StatisticsService {
  private userProgressRepository: UserProgressRepository

  constructor() {
    this.userProgressRepository = new UserProgressRepository()
  }

  async getLearningStatistics(user: IUser) {
    // Lấy ngày hiện tại và 7 ngày trước
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 6) // 6 ngày trước để có 7 ngày

    // Lấy tất cả progress của user
    const userProgress = await this.userProgressRepository.findByUser(user as User)

    // Tạo mảng kết quả với đầy đủ 7 ngày
    const result = []
    const currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0]

      // Đếm số progress được tạo trong ngày
      const dayProgress = userProgress.filter((progress) => progress.created_at.toISOString().split('T')[0] === dateStr)

      result.push({
        date: dateStr,
        count: dayProgress.length
      })

      currentDate.setDate(currentDate.getDate() + 1)
    }

    return result
  }

  async getMonthlyLearningStatistics(user: IUser) {
    // Lấy ngày hiện tại và 11 tháng trước
    const endDate = new Date()
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - 11) // 11 tháng trước để có 12 tháng

    // Lấy tất cả progress của user
    const userProgress = await this.userProgressRepository.findByUser(user as User)

    // Tạo mảng kết quả với đầy đủ 12 tháng
    const result = []
    const currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      const monthStr = currentDate.toISOString().slice(0, 7) // Format: YYYY-MM

      // Đếm số progress được tạo trong tháng
      const monthProgress = userProgress.filter(
        (progress) => progress.created_at.toISOString().slice(0, 7) === monthStr
      )

      result.push({
        date: monthStr,
        count: monthProgress.length
      })

      currentDate.setMonth(currentDate.getMonth() + 1)
    }

    return result
  }

  async getConsecutiveLearningDays(user: IUser) {
    // Lấy tất cả progress của user
    const userProgress = await this.userProgressRepository.findByUser(user as User)

    if (userProgress.length === 0) {
      return 0
    }

    // Lấy ngày hôm qua và format về YYYY-MM-DD
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    yesterday.setHours(0, 0, 0, 0)

    // Tạo Set chứa các ngày có hoạt động học tập (chỉ dựa vào created_at)
    const activityDates = new Set<string>()
    userProgress.forEach((progress) => {
      const createdDate = new Date(progress.created_at)
      createdDate.setHours(0, 0, 0, 0)
      activityDates.add(createdDate.toISOString().split('T')[0])
    })

    // Tính số ngày liên tiếp từ hôm qua trở về trước
    let consecutiveDays = 0
    const currentDate = new Date(yesterday)

    while (true) {
      const dateStr = currentDate.toISOString().split('T')[0]
      if (!activityDates.has(dateStr)) {
        break
      }
      consecutiveDays++
      currentDate.setDate(currentDate.getDate() - 1)
    }

    return consecutiveDays
  }
}
