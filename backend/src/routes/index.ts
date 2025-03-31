import { Router } from 'express'
import auth from './auth'
import leaderBoardRouter from './leaderBoardRouter'

const routes = Router()

routes.use('/auth', auth)
routes.use('/leaderboard', leaderBoardRouter)

export default routes
