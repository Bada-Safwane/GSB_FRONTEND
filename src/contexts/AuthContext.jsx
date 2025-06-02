import { createContext, useContext, useState, useEffect } from 'react'

// Create context
const AuthContext = createContext()

// Hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext)
}

// Provider component
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('authToken'))
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(false)
  }, [])

  // Real login function calling backend
  const login = async (email, password) => {
    try {
      console.log('AuthContext: Making login request to backend')
      
      const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      console.log('AuthContext: Response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('AuthContext: Login failed with error:', errorData)
        throw new Error(errorData.message || 'Login failed')
      }

      const data = await response.json()
      console.log('AuthContext: Login response data:', data)

      if (!data.token) {
        console.error('AuthContext: No token in response')
        throw new Error('No token received')
      }

      console.log('AuthContext: Setting token and saving to localStorage')
      setToken(data.token)
      localStorage.setItem('authToken', data.token)

      // If user data is included, set it
      if (data.user) {
        setUser(data.user)
      } else {
        // If no user data in response, create a basic user object
        // You might want to make a separate API call to get user details
        // or decode the JWT token to get user info
        setUser({ email: email, authenticated: true })
      }

      console.log('AuthContext: Login successful, returning token')
      return data.token
    } catch (error) {
      console.error('AuthContext: Login error:', error)
      throw error
    }
  }

  const logout = () => {
    console.log('AuthContext: Logging out')
    setToken(null)
    setUser(null)
    localStorage.removeItem('authToken')
    return Promise.resolve()
  }

  const value = {
    token,
    user,
    setToken,
    setUser,
    login,
    logout,
    loading,
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}