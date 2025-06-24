import { Router } from 'express'
import { StudySessionController } from '../controllers/StudySessionController'
import { authMiddleware } from '../middlewares/authMiddleware'

const router = Router()
const studySessionController = new StudySessionController()

router.post('/start', authMiddleware, studySessionController.startSession.bind(studySessionController))
router.post('/:collectionId/check', authMiddleware, studySessionController.checkAnswer.bind(studySessionController))
router.get(
  '/collection/:collectionId/scores',
  authMiddleware,
  studySessionController.getPaginatedScores.bind(studySessionController)
)
router.post('/review/start', authMiddleware, studySessionController.startReviewSession.bind(studySessionController))
router.post(
  '/review/:collectionId/check',
  authMiddleware,
  studySessionController.checkReviewAnswer.bind(studySessionController)
)
//router.post('/:sessionId/complete', authMiddleware, studySessionController.completeSession.bind(studySessionController))

export default router
