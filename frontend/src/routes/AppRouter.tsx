import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '../app/store'
import LoginPage from '../pages/LoginPage'
import HomePage from '../pages/HomePage'
import { me, logout } from '../features/auth/authSlice'
import { useEffect, useState } from 'react'
import MainLayout from '../components/layout/MainLayout'
import SearchPage from '../pages/SearchPage'
import DictionaryPage from '../pages/DictionaryPage'
import PracticePage from '../pages/PracticePage'
import MainPage from '../pages/MainPage'
import RegisterPage from '../pages/RegisterPage'
import ForgotPasswordPage from '../pages/ForgotPasswordPage'
import GoogleCallback from '../pages/GoogleCallbackPage'
import CreateDictionaryPage from '../pages/CreateCollectionPage'
import CreateFlashcardPage from '../pages/CreateFlashcardPage'
import EditCollectionPage from '../pages/EditCollectionPage'
import StudyPage from '../pages/StudyPage'
import ProfilePage from '../pages/ProfilePage'
import ConfirmSharePage from '../pages/ConfirmSharePage'

const useAuthCheck = () => {
  const dispatch = useDispatch<AppDispatch>()
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated)
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token')
        if (token) {
          if (!isAuthenticated) {
            await dispatch(me())
          }
        } else {
          dispatch(logout())
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        dispatch(logout())
      } finally {
        setAuthChecked(true)
      }
    }

    checkAuth()
  }, [dispatch, isAuthenticated])

  return { isAuthenticated, authChecked }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const PrivateRoute = () => {
  const { isAuthenticated, authChecked } = useAuthCheck()

  if (!authChecked) {
    return <div>Loading...</div> // Thêm loading component
  }

  return isAuthenticated ? <HomePage /> : <Navigate to='/login' replace />
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
    path: '/dashboard',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <MainPage />
      },
      {
        path: 'search',
        element: <SearchPage />
      },
      {
        path: 'dictionary',
        element: <DictionaryPage />
      },
      {
        path: 'practice',
        element: <PracticePage />
      }
    ]
  },
  {
    path: '/',
    element: <HomePage />
  },
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/translate',
    element: <SearchPage />
  },
  {
    path: '/register',
    element: <RegisterPage />
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />
  },
  {
    path: '/auth/google/callback',
    element: <GoogleCallback />
  },
  {
    path: '/create-dictionary',
    element: <CreateDictionaryPage />
  },
  {
    path: '/create-flashcard/:id',
    element: <CreateFlashcardPage />
  },
  {
    path: '/edit-collection/:id',
    element: <EditCollectionPage />
  },
  {
    path: '/study/:id',
    element: <StudyPage />
  },
  {
    path: 'profile',
    element: <ProfilePage />
  },
  {
    path: '/confirm-share',
    element: <ConfirmSharePage />
  }
])

const AppRouter = () => {
  return <RouterProvider router={router} />
}

export default AppRouter
