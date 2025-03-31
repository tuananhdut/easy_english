import { Router } from 'express'
import LeaderBoardController from '~/controllers/LeaderBoardController'
import { authMiddleware } from '~/middlewares/authMiddleware'
const leaderBoardController = new LeaderBoardController()

const router = Router()

router.get('/', authMiddleware, leaderBoardController.getLeaderboard)

export default router
