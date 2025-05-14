import React from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import LoginForm from '../components/auth/LoginForm'

function Login() {
  const navigate = useNavigate()
  
  const handleLoginSuccess = () => {
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 animate-fade-in">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">GSB</h1>
          <h2 className="mt-6 text-2xl font-semibold text-gray-900">
            Bienvenue
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Connectez vous à votre compte pour continuer
          </p>
        </div>
        
        <div className="mt-8 bg-white py-8 px-4 shadow-sm rounded-xl sm:px-10 border border-gray-100">
          <LoginForm onSuccess={handleLoginSuccess} />
        </div>
        
        <div className="text-center">
        </div>
      </div>
    </div>
  )
}

export default Login