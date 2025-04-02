import React, { useEffect } from 'react'
import { useAppDispatch } from './app/hooks'
import { fetchCurrentUser } from './features/auth/authThunks'

const App: React.FC = () => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(fetchCurrentUser())
  }, [dispatch])

  return {
    /* Your app content */
  }
}
