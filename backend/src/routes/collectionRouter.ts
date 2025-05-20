import { Router } from 'express'
import { CollectionController } from '~/controllers/CollectionController'
import { authMiddleware } from '../middlewares/authMiddleware'

const collectionController = new CollectionController()

const router = Router()

// Public routes
router.get('/public', collectionController.getPublicCollections)

// Protected routes
router.get('/user/own', authMiddleware, collectionController.getUserOwnCollections)
router.get('/user/shared', authMiddleware, collectionController.getUserSharedCollections)
router.get('/:id', authMiddleware, collectionController.getCollectionById)
router.post('/', authMiddleware, collectionController.createCollection)
router.put('/:id', authMiddleware, collectionController.updateCollection)
router.delete('/:id', authMiddleware, collectionController.deleteCollection)

export default router
