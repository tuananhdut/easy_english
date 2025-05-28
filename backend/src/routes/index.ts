import { Router } from 'express'
import auth from './authRouter'
import leaderBoardRouter from './leaderBoardRouter'
import dictionaryRouter from './dictionaryRouter'
import collectionRouter from './collectionRouter'
import sharedCollectionRouter from './sharedCollectionRouter'
import flashCardRouter from './flashCardRouter'
import translateRouter from './translateRouter'
import studySessionRouter from './studySessionRoutes'
import statisticsRoutes from './statisticsRoutes'

const routes = Router()

routes.use('/auth', auth)
routes.use('/leaderboard', leaderBoardRouter)
routes.use('/dictionary', dictionaryRouter)
routes.use('/collections', collectionRouter)
routes.use('/shared-collections', sharedCollectionRouter)
routes.use('/flashcards', flashCardRouter)
routes.use('/translate', translateRouter)
routes.use('/study-sessions', studySessionRouter)
routes.use('/statistics', statisticsRoutes)

export default routes
