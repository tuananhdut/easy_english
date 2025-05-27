import { Router } from 'express'
import { StudySessionController } from '../controllers/StudySessionController'
import { authMiddleware } from '../middlewares/authMiddleware'

const router = Router()
const studySessionController = new StudySessionController()

router.post('/start', authMiddleware, studySessionController.startSession.bind(studySessionController))
router.post('/:sessionId/check', authMiddleware, studySessionController.checkAnswer.bind(studySessionController))
//router.post('/:sessionId/complete', authMiddleware, studySessionController.completeSession.bind(studySessionController))

export default router
