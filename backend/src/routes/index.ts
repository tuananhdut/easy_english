import { Router } from 'express'
import auth from './authRouter'
import leaderBoardRouter from './leaderBoardRouter'
import dictionaryRouter from './dictionaryRouter'

const routes = Router()

routes.use('/auth', auth)
routes.use('/leaderboard', leaderBoardRouter)
routes.use('/dictionary', dictionaryRouter)
export default routes
