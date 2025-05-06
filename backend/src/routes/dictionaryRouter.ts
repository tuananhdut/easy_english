import { Router } from 'express'
import DictionaryController from '~/controllers/DictionaryController'

const router = Router()
const dictionaryController = new DictionaryController()

router.get('/', dictionaryController.getSerchDictionary)
router.get('/sound', dictionaryController.getSound)

export default router
