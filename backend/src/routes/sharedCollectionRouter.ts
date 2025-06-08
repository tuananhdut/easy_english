import { Router } from 'express'
import { SharedCollectionController } from '~/controllers/SharedCollectionController'
import { authMiddleware } from '../middlewares/authMiddleware'

const sharedCollectionController = new SharedCollectionController()

const router = Router()

// Public route for confirming share - no auth required
router.get('/confirm', sharedCollectionController.confirmShare)

// Protected routes
router.use(authMiddleware)
router.post('/', sharedCollectionController.shareCollection)
router.put('/:id/permission', sharedCollectionController.updatePermission)
router.delete('/', sharedCollectionController.removeShare)
router.get('/collection/:collectionId/users', sharedCollectionController.getSharedUsers)

export default router
