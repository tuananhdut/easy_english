import { Router } from 'express'
import TranslateController from '~/controllers/TranslateController'

const router = Router()
const translateController = new TranslateController()

router.post('/', translateController.translate)

export default router
