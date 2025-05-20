import { Router } from 'express'
import { FlashCardController } from '~/controllers/FlashCardController'
import { authMiddleware } from '../middlewares/authMiddleware'

const flashCardController = new FlashCardController()

const router = Router()

// All routes require authentication
router.use(authMiddleware)

// Create a new flashcard
router.post('/', flashCardController.createFlashCard)

// Update a flashcard
router.put('/:id', flashCardController.updateFlashCard)

// Delete a flashcard
router.delete('/:id', flashCardController.deleteFlashCard)

// Get all flashcards in a collection
router.get('/collection/:collectionId', flashCardController.getFlashCardsByCollection)

// Get random flashcards from a collection
router.get('/collection/:collectionId/random', flashCardController.getRandomFlashCards)

export default router
