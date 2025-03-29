// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Router, Request, Response, response } from 'express'
import { AuthController } from '~/controllers/AuthController'
import { authMiddleware } from '../middlewares/authMiddleware'

const authController = new AuthController()

const router = Router()
router.get('/login', (req: Request, res: Response) => {
  res.send('Login route hit')
})

router.post('/register', authController.register.bind(authController))
router.post('/login', authController.login.bind(authController))
// router.post('/google-login', authController.googleLogin).bind(authController))
router.get('/me', authMiddleware, authController.getProfile)
// router.post('/logout', authMiddleware, authController.logout)
// router.patch('/change-password', authMiddleware, authController.changePassword)
// router.put('/profile', authMiddleware, authController.updateProfile)

export default router
