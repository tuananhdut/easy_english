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
import LoadingSpinner from '../components/common/LoadingSpinner'

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
      } catch (_error) {
        dispatch(logout())
      } finally {
        setAuthChecked(true)
      }
    }

    checkAuth()
  }, [dispatch, isAuthenticated])

  return { isAuthenticated, authChecked }
}

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, authChecked } = useAuthCheck()

  if (!authChecked) {
    return <LoadingSpinner />
  }

  return isAuthenticated ? <>{children}</> : <Navigate to='/login' replace />
}

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, authChecked } = useAuthCheck()

  if (!authChecked) {
    return <LoadingSpinner />
  }

  return !isAuthenticated ? <>{children}</> : <Navigate to='/dashboard' replace />
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />
  },
  {
    path: '/login',
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    )
  },
  {
    path: '/register',
    element: (
      <PublicRoute>
        <RegisterPage />
      </PublicRoute>
    )
  },
  {
    path: '/forgot-password',
    element: (
      <PublicRoute>
        <ForgotPasswordPage />
      </PublicRoute>
    )
  },
  {
    path: '/auth/google/callback',
    element: <GoogleCallback />
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
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
      },
      {
        path: 'profile',
        element: <ProfilePage />
      }
    ]
  },
  {
    path: '/translate',
    element: (
      <ProtectedRoute>
        <SearchPage />
      </ProtectedRoute>
    )
  },
  {
    path: '/create-dictionary',
    element: (
      <ProtectedRoute>
        <CreateDictionaryPage />
      </ProtectedRoute>
    )
  },
  {
    path: '/create-flashcard/:id',
    element: (
      <ProtectedRoute>
        <CreateFlashcardPage />
      </ProtectedRoute>
    )
  },
  {
    path: '/edit-collection/:id',
    element: (
      <ProtectedRoute>
        <EditCollectionPage />
      </ProtectedRoute>
    )
  },
  {
    path: '/study/:id',
    element: (
      <ProtectedRoute>
        <StudyPage />
      </ProtectedRoute>
    )
  },
  {
    path: '/confirm-share',
    element: (
      <ProtectedRoute>
        <ConfirmSharePage />
      </ProtectedRoute>
    )
  }
])

const AppRouter = () => {
  return <RouterProvider router={router} />
}

export default AppRouter
