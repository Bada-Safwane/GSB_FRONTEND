import { createContext, useContext, useState, useEffect } from 'react'

// Create context
const AuthContext = createContext()

// Hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext)
}

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  // Login function
  const login = (email, password) => {
    // In a real app, this would make an API call to authenticate
    // For demo purposes, we'll simulate a successful login
    const newUser = {
      id: '1',
      email,
      name: email.split('@')[0],
      profilePic: 'https://i.pravatar.cc/150?img=12',
    }
    setUser(newUser)
    localStorage.setItem('user', JSON.stringify(newUser))
    return Promise.resolve(newUser)
  }

  // Signup function
  const signup = (email, password, name) => {
    // In a real app, this would make an API call to register
    // For demo purposes, we'll simulate a successful signup
    const newUser = {
      id: '1',
      email,
      name: name || email.split('@')[0],
      profilePic: 'https://i.pravatar.cc/150?img=12',
    }
    setUser(newUser)
    localStorage.setItem('user', JSON.stringify(newUser))
    return Promise.resolve(newUser)
  }

  // Logout function
  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
    return Promise.resolve()
  }

  const value = {
    user,
    login,
    signup,
    logout,
    loading,
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}