import { Router } from 'express'
import { CollectionController } from '~/controllers/CollectionController'
import { authMiddleware } from '../middlewares/authMiddleware'

const collectionController = new CollectionController()

const router = Router()

// Public routes
router.get('/public', collectionController.getPublicCollections)

// Protected routes
router.use(authMiddleware)
router.get('/user/own', collectionController.getUserOwnCollections)
router.get('/user/shared', collectionController.getUserSharedCollections)
router.get('/:id', collectionController.getCollectionById)
router.get('/:id/shared-users', collectionController.getSharedUsers)
router.post('/', collectionController.createCollection)
router.put('/:id', collectionController.updateCollection)
router.delete('/:id', collectionController.deleteCollection)

export default router
