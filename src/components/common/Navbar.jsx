import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiMenu, FiLogOut } from 'react-icons/fi'
import { useAuth } from '../../contexts/AuthContext'
import ProfileAvatar from './ProfileAvatar'

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  
  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-semibold text-primary-500">InvoiceApp</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {user && (
              <>
                <Link to="/profile">
                  <ProfileAvatar 
                    src={user.profilePic} 
                    alt={user.name} 
                    className="transition-transform duration-200 hover:scale-105"
                  />
                </Link>
                <button 
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                >
                  <FiLogOut className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar