import { Router } from 'express'
import { SharedCollectionController } from '~/controllers/SharedCollectionController'
import { authMiddleware } from '../middlewares/authMiddleware'

const sharedCollectionController = new SharedCollectionController()

const router = Router()

// All routes require authentication
router.use(authMiddleware)

// Share collection with a user
router.post('/', sharedCollectionController.shareCollection)

// Update sharing permission
router.put('/:id/permission', sharedCollectionController.updatePermission)

// Remove sharing
router.delete('/:id', sharedCollectionController.removeShare)

// Get list of users that a collection is shared with
router.get('/collection/:collectionId/users', sharedCollectionController.getSharedUsers)

export default router
