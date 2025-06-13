import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import SignupForm from '../components/auth/SignupForm'

function Signup() {
  const navigate = useNavigate()
  
  const handleSignupSuccess = () => {
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 animate-fade-in">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">InvoiceApp</h1>
          <h2 className="mt-6 text-2xl font-semibold text-gray-900">
            Créer un compte
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Rejoignez nos milliez d'utilisateurs dans la gestion de notes de frais
          </p>
        </div>
        
        <div className="mt-8 bg-white py-8 px-4 shadow-sm rounded-xl sm:px-10 border border-gray-100">
          <SignupForm onSuccess={handleSignupSuccess} />
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-500">
            By creating an account, you agree to our{' '}
            <Link to="#" className="font-medium text-primary-500 hover:text-primary-600">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="#" className="font-medium text-primary-500 hover:text-primary-600">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Signup