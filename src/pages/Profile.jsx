import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiUser, FiMail, FiPhone, FiMapPin, FiEdit } from 'react-icons/fi'
import Navbar from '../components/common/Navbar'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import { useAuth } from '../contexts/AuthContext'

function Profile() {
  const { user: authUser, logout } = useAuth()
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [user, setUser] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    company: '',
  })

  useEffect(() => {
    const fetchUser = async () => {
      if (!authUser?.email) return
      try {
        const res = await fetch(`http://localhost:3000/users/${authUser.email}`)
        const data = await res.json()

        const completeUser = {
          ...data,
          phone: data.phone || 'non renseigné',
          address: data.address || 'non renseigné',
          company: data.company || 'non renseigné',
          profilePic: data.profilePic || null,
        }

        setUser(completeUser)
        setFormData({
          name: completeUser.name,
          email: completeUser.email,
          phone: completeUser.phone,
          address: completeUser.address,
          company: completeUser.company,
        })
      } catch (err) {
        console.error('Failed to fetch user:', err)
      }
    }

    fetchUser()
  }, [authUser?.email])

  const handleChange = (e) => {
    const { id, value } = e.target
    setFormData(prev => ({
      ...prev,
      [id]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!authUser?.email) return

    try {
      const res = await fetch(`http://localhost:3000/users/${authUser.email}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        throw new Error('Failed to update profile')
      }

      const updatedUser = await res.json()

      const completeUser = {
        ...updatedUser,
        phone: updatedUser.phone || 'non renseigné',
        address: updatedUser.address || 'non renseigné',
        company: updatedUser.company || 'non renseigné',
        profilePic: updatedUser.profilePic || null,
      }

      setUser(completeUser)
      setFormData({
        name: completeUser.name,
        email: completeUser.email,
        phone: completeUser.phone,
        address: completeUser.address,
        company: completeUser.company,
      })
      setIsEditing(false)
    } catch (err) {
      console.error('Error updating profile:', err)
      alert('An error occurred while updating your profile.')
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
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
                  src={user?.profilePic || '/src/assets/11435235.png'}
                  alt={user?.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          <div className="pt-16 px-8 pb-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                <p className="text-gray-600">{user.email}</p>
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
                  <Button type="submit">Modifier</Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="border-b border-gray-100 pb-4">
                  <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ProfileField icon={FiUser} label="Full Name" value={user.name} />
                    <ProfileField icon={FiMail} label="Email Address" value={user.email} />
                    <ProfileField icon={FiPhone} label="Phone Number" value={user.phone} />
                    <ProfileField icon={FiMapPin} label="Address" value={user.address} />
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-semibold mb-4">Company Information</h2>
                  <ProfileField icon={FiEdit} label="Company Name" value={user.company} />
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

function ProfileField({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <div className="p-2 bg-primary-500 bg-opacity-10 rounded-full">
        <Icon className="w-5 h-5 text-primary-500" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-medium">{value || 'non renseigné'}</p>
      </div>
    </div>
  )
}

export default Profile
