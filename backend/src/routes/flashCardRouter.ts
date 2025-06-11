import { Router } from 'express'
import { FlashCardController } from '~/controllers/FlashCardController'
import { authMiddleware } from '../middlewares/authMiddleware'
import { upload } from '../middlewares/multerMiddleware'

const flashCardController = new FlashCardController()

const router = Router()

// All routes require authentication
router.use(authMiddleware)
router.post(
  '/',
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'audio', maxCount: 1 }
  ]),
  flashCardController.createFlashCard
)
router.put(
  '/:id',
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'audio', maxCount: 1 }
  ]),
  flashCardController.updateFlashCard
)
router.delete('/:id', flashCardController.deleteFlashCard)
router.get('/collection/:collectionId', flashCardController.getFlashCardsByCollection)
router.get('/collection/:collectionId/random/:excludeId', flashCardController.getRandomFlashCards)
router.get('/suggest', flashCardController.getSuggestFlashCards)

export default router
