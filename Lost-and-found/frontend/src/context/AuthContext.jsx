import React, { createContext, useContext, useEffect, useState } from 'react'
import { authApi } from '../utils/api'
import toast from 'react-hot-toast'

const AuthContext = createContext(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token') || null)

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    if (storedToken) {
      setToken(storedToken)
      // Verify token and get user data
      const verifyToken = async () => {
        try {
          const response = await authApi.getProfile()
          setUser(response.data.user)
        } catch (error) {
          console.error('Token verification failed:', error)
          // Token is invalid, remove it
          localStorage.removeItem('token')
          setToken(null)
        } finally {
          setLoading(false)
        }
      }
      
      verifyToken()
    } else {
      setLoading(false)
    }
  }, [])

  // Retry mechanism for API calls
  const retryApiCall = async (apiCall, maxRetries = 3) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await apiCall()
      } catch (error) {
        if (i === maxRetries - 1) throw error
        
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000))
      }
    }
  }

  const login = async (data) => {
    try {
      const response = await retryApiCall(() => authApi.login(data))
      const { token: newToken, user: userData } = response.data
      
      localStorage.setItem('token', newToken)
      setToken(newToken)
      setUser(userData)
      toast.success('Login successful!')
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed'
      toast.error(message)
      throw error
    }
  }

  const register = async (data) => {
    try {
      const response = await retryApiCall(() => authApi.register(data))
      const { token: newToken, user: userData } = response.data
      
      localStorage.setItem('token', newToken)
      setToken(newToken)
      setUser(userData)
      toast.success('Registration successful!')
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed'
      toast.error(message)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    toast.success('Logged out successfully')
  }

  const updateUser = (userData) => {
    if (user) {
      setUser(prev => prev ? { ...prev, ...userData } : null)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUser,
        token
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}