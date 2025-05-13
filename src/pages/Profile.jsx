import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiUser, FiMail, FiPhone, FiMapPin, FiEdit } from 'react-icons/fi'
import Navbar from '../components/common/Navbar'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import { useAuth } from '../contexts/AuthContext'

function Profile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    company: user?.company || '',
  })
  
  const handleChange = (e) => {
    const { id, value } = e.target
    setFormData(prev => ({
      ...prev,
      [id]: value,
    }))
  }
  
  const handleSubmit = (e) => {
    e.preventDefault()
    // In a real app, this would update the user profile through an API
    // For this demo, we'll just show the editing UI
    setIsEditing(false)
  }
  
  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-primary-500 h-32 relative">
            <div className="absolute -bottom-12 left-8">
              <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-white">
                <img 
                  src={user?.profilePic || 'https://i.pravatar.cc/150'} 
                  alt={user?.name} 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
          
          <div className="pt-16 px-8 pb-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
                <p className="text-gray-600">{user?.email}</p>
              </div>
              <Button 
                onClick={() => setIsEditing(!isEditing)}
                variant={isEditing ? 'secondary' : 'primary'}
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
            </div>
            
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Full Name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                
                <Input
                  label="Email Address"
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                
                <Input
                  label="Phone Number"
                  id="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
                
                <Input
                  label="Company"
                  id="company"
                  value={formData.company}
                  onChange={handleChange}
                />
                
                <Input
                  label="Address"
                  id="address"
                  value={formData.address}
                  onChange={handleChange}
                />
                
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="submit">
                    Save Changes
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="border-b border-gray-100 pb-4">
                  <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary-500 bg-opacity-10 rounded-full">
                        <FiUser className="w-5 h-5 text-primary-500" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Full Name</p>
                        <p className="font-medium">{user?.name || 'Not specified'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary-500 bg-opacity-10 rounded-full">
                        <FiMail className="w-5 h-5 text-primary-500" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email Address</p>
                        <p className="font-medium">{user?.email || 'Not specified'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary-500 bg-opacity-10 rounded-full">
                        <FiPhone className="w-5 h-5 text-primary-500" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone Number</p>
                        <p className="font-medium">{user?.phone || 'Not specified'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary-500 bg-opacity-10 rounded-full">
                        <FiMapPin className="w-5 h-5 text-primary-500" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="font-medium">{user?.address || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h2 className="text-lg font-semibold mb-4">Company Information</h2>
                  
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-500 bg-opacity-10 rounded-full">
                      <FiEdit className="w-5 h-5 text-primary-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Company Name</p>
                      <p className="font-medium">{user?.company || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-gray-100 mt-6">
                  <Button
                    onClick={handleLogout}
                    variant="secondary"
                    className="text-error-500 border-error-500 hover:bg-error-500 hover:bg-opacity-10"
                  >
                    Sign Out
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile