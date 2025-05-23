import { Router } from 'express'
import { FlashCardController } from '~/controllers/FlashCardController'
import { authMiddleware } from '../middlewares/authMiddleware'

const flashCardController = new FlashCardController()

const router = Router()

// All routes require authentication
router.use(authMiddleware)
router.post('/', flashCardController.createFlashCard)
router.put('/:id', flashCardController.updateFlashCard)
router.delete('/:id', flashCardController.deleteFlashCard)
router.get('/collection/:collectionId', flashCardController.getFlashCardsByCollection)
router.get('/collection/:collectionId/random', flashCardController.getRandomFlashCards)
router.get('/suggest', flashCardController.getSuggestFlashCards)
//GET /flashcards/suggest?query=chào&source=vi&target=en

export default router
