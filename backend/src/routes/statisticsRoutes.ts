import { Router } from 'express'
import { StatisticsController } from '../controllers/statisticsController'
import { authMiddleware } from '../middlewares/authMiddleware'

const router = Router()
const statisticsController = new StatisticsController()

router.get('/learning', authMiddleware, statisticsController.getLearningStatistics)
router.get('/learning/monthly', authMiddleware, statisticsController.getMonthlyLearningStatistics)
router.get('/learning/consecutive-days', authMiddleware, statisticsController.getConsecutiveLearningDays)

export default router
