import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '../app/store'
import LoginPage from '../pages/LoginPage'
import Dashboard from '../pages/Dashboard'
import HomePage from '../pages/HomePage'
import { me } from '../features/auth/authSlice'
import { useEffect, useState } from 'react'

const useAuthCheck = () => {
  const dispatch = useDispatch<AppDispatch>()
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated)
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token')
      if (!isAuthenticated && token) {
        await dispatch(me())
      }
      setAuthChecked(true)
    }

    checkAuth()
  }, [dispatch, isAuthenticated])

  return { isAuthenticated, authChecked }
}

const PrivateRoute = () => {
  const { isAuthenticated, authChecked } = useAuthCheck()

  if (!authChecked) {
    return <div>Loading...</div> // Thêm loading component
  }

  return isAuthenticated ? <Dashboard /> : <Navigate to='/login' replace />
}

// const PublicRoute = () => {
//   const { isAuthenticated, authChecked } = useAuthCheck()

//   if (!authChecked) {
//     return <div>Loading...</div>
//   }

//   return !isAuthenticated ? <LoginPage /> : <Navigate to='/dashboard' replace />
// }

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />
  },
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/dashboard',
    element: <Dashboard />
  }
])

const AppRouter = () => {
  return <RouterProvider router={router} />
}

export default AppRouter
