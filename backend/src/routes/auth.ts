// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Router, Request, Response, response } from 'express'
import { AuthController } from '~/controllers/AuthController'
import { authMiddleware } from '../middlewares/authMiddleware'
import passport from '../config/passport'

const authController = new AuthController()

const router = Router()

router.post('/register', authController.register)
router.post('/login', authController.login)
router.get('/google-login', passport.authenticate('google', { scope: ['profile', 'email'] }))
router.get('/google/callback', passport.authenticate('google', { session: false }), authController.googleCallback)
router.get('/me', authMiddleware, authController.getProfile)
router.post('/logout', authMiddleware, authController.logout)
// router.patch('/change-password', authMiddleware, authController.changePassword)
// router.put('/profile', authMiddleware, authController.updateProfile)

export default router
