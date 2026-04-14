import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiUser, FiMail, FiBriefcase, FiShield, FiArrowLeft, FiLock } from 'react-icons/fi'
import Navbar from '../components/common/Navbar'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import { useAuth } from '../contexts/AuthContext'

function Profile() {
  const { user: authUser, token, logout } = useAuth()
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [user, setUser] = useState(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    service: '',
  })

  useEffect(() => {
    const fetchUser = async () => {
      if (!authUser?.email) return
      try {
        const res = await fetch(`https://gsb-backend-nti4.onrender.com/users/${authUser.email}`)
        const data = await res.json()

        const completeUser = {
          ...data,
          profilePic: data.profilePic || null,
        }

        setUser(completeUser)
        setFormData({
          firstName: completeUser.firstName || '',
          lastName: completeUser.lastName || '',
          email: completeUser.email || '',
          service: completeUser.service || '',
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
      const res = await fetch(`https://gsb-backend-nti4.onrender.com/users/${authUser.email}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        throw new Error('Failed to update profile')
      }

      const completeUser = await res.json()


      setUser(completeUser)
      setFormData({
        firstName: completeUser.firstName || '',
        lastName: completeUser.lastName || '',
        email: completeUser.email || '',
        service: completeUser.service || '',
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

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas')
      return
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordError('Le nouveau mot de passe doit contenir au moins 6 caractères')
      return
    }

    setPasswordLoading(true)
    try {
      const res = await fetch('https://gsb-backend-nti4.onrender.com/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Erreur')
      setPasswordSuccess('Mot de passe modifié avec succès')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setTimeout(() => {
        setShowPasswordForm(false)
        setPasswordSuccess('')
      }, 2000)
    } catch (err) {
      setPasswordError(err.message)
    } finally {
      setPasswordLoading(false)
    }
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <FiArrowLeft className="w-5 h-5" />
          <span>Retour à l'accueil</span>
        </button>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-primary-500 h-32 relative">
            <div className="absolute -bottom-12 left-8">
              <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-white">
                <img
                  src={user?.profilePic || '/avatar.jpg'}
                  alt={`${user?.firstName} ${user?.lastName}`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          <div className="pt-16 px-8 pb-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{user.firstName} {user.lastName}</h1>
                <p className="text-gray-600">{user.email}</p>
              </div>
              <Button
                onClick={() => setIsEditing(!isEditing)}
                variant={isEditing ? 'secondary' : 'primary'}
              >
                {isEditing ? 'Annuler' : 'Modifier le profil'}
              </Button>
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Nom"
                    id="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                  <Input
                    label="Prénom"
                    id="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <Input
                  label="Email"
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
                  <select
                    id="service"
                    value={formData.service}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  >
                    <option value="">Sélectionner un service</option>
                    {['Comptabilité', 'Commercial', 'Direction', 'Informatique', 'Juridique', 'Marketing', 'Ressources Humaines', 'Logistique'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="submit">Enregistrer</Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="border-b border-gray-100 pb-4">
                  <h2 className="text-lg font-semibold mb-4">Informations Personnelles</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ProfileField icon={FiUser} label="Nom complet" value={`${user.firstName} ${user.lastName}`} />
                    <ProfileField icon={FiMail} label="Adresse Email" value={user.email} />
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-semibold mb-4">Informations Entreprise</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ProfileField icon={FiBriefcase} label="Service" value={user.service} />
                    <ProfileField icon={FiShield} label="Rôle" value={user.role === 'superadmin' ? 'Super Administrateur' : user.role === 'admin' ? 'Administrateur' : 'Visiteur'} />
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100 mt-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() => { setShowPasswordForm(!showPasswordForm); setPasswordError(''); setPasswordSuccess(''); }}
                      variant="secondary"
                    >
                      <FiLock className="w-4 h-4 mr-2 inline" />
                      {showPasswordForm ? 'Annuler' : 'Changer le mot de passe'}
                    </Button>
                    <Button
                      onClick={handleLogout}
                      variant="secondary"
                      className="text-error-500 border-error-500 hover:bg-error-500 hover:bg-opacity-10"
                    >
                      Se déconnecter
                    </Button>
                  </div>

                  {showPasswordForm && (
                    <form onSubmit={handlePasswordChange} className="space-y-3 max-w-md">
                      {passwordError && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">{passwordError}</div>
                      )}
                      {passwordSuccess && (
                        <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">{passwordSuccess}</div>
                      )}
                      <Input
                        label="Mot de passe actuel"
                        type="password"
                        id="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        required
                      />
                      <Input
                        label="Nouveau mot de passe"
                        type="password"
                        id="newPassword"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        required
                      />
                      <Input
                        label="Confirmer le nouveau mot de passe"
                        type="password"
                        id="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        required
                      />
                      <Button type="submit" disabled={passwordLoading}>
                        {passwordLoading ? 'Modification...' : 'Valider'}
                      </Button>
                    </form>
                  )}
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
