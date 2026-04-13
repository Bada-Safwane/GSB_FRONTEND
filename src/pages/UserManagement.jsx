import React, { useState, useEffect } from 'react'
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiMail, FiUsers, FiChevronDown, FiChevronUp, FiX, FiCheck } from 'react-icons/fi'
import Navbar from '../components/common/Navbar'
import { useAuth } from '../contexts/AuthContext'

const SERVICES = [
  'Comptabilité',
  'Commercial',
  'Direction',
  'Informatique',
  'Juridique',
  'Marketing',
  'Ressources humaines',
  'Logistique',
]

const ROLES = ['visiteur', 'admin', 'superadmin']

function UserManagement() {
  const { token, user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [filterService, setFilterService] = useState('all')
  const [expandedService, setExpandedService] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState('')
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    service: '',
    role: 'visiteur',
  })
  const [formErrors, setFormErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')

  const fetchUsers = async () => {
    try {
      const response = await fetch('https://gsb-backend-nti4.onrender.com/users', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [token])

  const filteredUsers = users.filter(u => {
    const matchesSearch = search === '' ||
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    const matchesService = filterService === 'all' || u.service === filterService
    return matchesSearch && matchesService
  })

  const usersByService = filteredUsers.reduce((acc, u) => {
    const svc = u.service || 'Non assigné'
    if (!acc[svc]) acc[svc] = []
    acc[svc].push(u)
    return acc
  }, {})

  const openCreateModal = () => {
    setEditingUser(null)
    setFormData({ firstName: '', lastName: '', email: '', password: '', service: '', role: 'visiteur' })
    setFormErrors({})
    setShowModal(true)
  }

  const openEditModal = (user) => {
    setEditingUser(user)
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: '',
      service: user.service,
      role: user.role,
    })
    setFormErrors({})
    setShowModal(true)
  }

  const validateForm = () => {
    const errors = {}
    if (!formData.firstName.trim()) errors.firstName = 'Requis'
    if (!formData.lastName.trim()) errors.lastName = 'Requis'
    if (!formData.email.trim()) errors.email = 'Requis'
    if (!editingUser && !formData.password) errors.password = 'Requis'
    if (formData.password && formData.password.length < 6) errors.password = '6 caractères minimum'
    if (!formData.service) errors.service = 'Requis'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setActionLoading('submit')
    try {
      if (editingUser) {
        const updateData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          service: formData.service,
          role: formData.role,
        }
        if (formData.password) {
          updateData.password = formData.password
        }

        const response = await fetch(`https://gsb-backend-nti4.onrender.com/users/${editingUser.email}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updateData),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.message || 'Erreur')
        }
      } else {
        const response = await fetch('https://gsb-backend-nti4.onrender.com/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.message || 'Erreur')
        }
      }

      setShowModal(false)
      fetchUsers()
      setSuccessMessage(editingUser ? 'Utilisateur modifié' : 'Utilisateur créé')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      setFormErrors(prev => ({ ...prev, submit: error.message }))
    } finally {
      setActionLoading('')
    }
  }

  const handleDelete = async (email) => {
    if (!window.confirm(`Supprimer l'utilisateur ${email} ?`)) return
    setActionLoading(email)
    try {
      await fetch(`https://gsb-backend-nti4.onrender.com/users/${email}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      fetchUsers()
      setSuccessMessage('Utilisateur supprimé')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Error deleting user:', error)
    } finally {
      setActionLoading('')
    }
  }

  const handleSendResetEmail = async (email) => {
    setActionLoading(`reset-${email}`)
    try {
      const response = await fetch('https://gsb-backend-nti4.onrender.com/auth/admin-reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setSuccessMessage(`Email de réinitialisation envoyé à ${email}`)
        setTimeout(() => setSuccessMessage(''), 3000)
      }
    } catch (error) {
      console.error('Error sending reset email:', error)
    } finally {
      setActionLoading('')
    }
  }

  const getRoleBadge = (role) => {
    switch (role) {
      case 'superadmin':
        return 'bg-purple-50 text-purple-700 ring-1 ring-purple-600/20'
      case 'admin':
        return 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20'
      default:
        return 'bg-gray-50 text-gray-700 ring-1 ring-gray-600/20'
    }
  }

  if (currentUser?.role !== 'superadmin') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Accès refusé</h2>
          <p className="text-gray-600 mt-2">Cette page est réservée au super administrateur.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion des utilisateurs</h1>
            <p className="text-gray-600">{users.length} utilisateur{users.length > 1 ? 's' : ''} au total</p>
          </div>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium text-sm transition-colors"
          >
            <FiPlus className="w-4 h-4" />
            Nouvel utilisateur
          </button>
        </div>

        {/* Success message */}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm flex items-center gap-2 animate-fade-in">
            <FiCheck className="w-4 h-4" />
            {successMessage}
          </div>
        )}

        {/* Search & Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="p-4 flex flex-col md:flex-row md:items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom ou email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50 text-sm"
              />
            </div>
            <select
              value={filterService}
              onChange={(e) => setFilterService(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50 text-sm"
            >
              <option value="all">Tous les services</option>
              {SERVICES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Users grouped by service */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Chargement...</div>
        ) : Object.keys(usersByService).length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FiUsers className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">Aucun utilisateur trouvé</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(usersByService)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([service, serviceUsers]) => (
                <div key={service} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => setExpandedService(expandedService === service ? null : service)}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FiUsers className="w-5 h-5 text-primary-500" />
                      <h3 className="text-sm font-semibold text-gray-900">{service}</h3>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        {serviceUsers.length}
                      </span>
                    </div>
                    {expandedService === service ? (
                      <FiChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <FiChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </button>

                  {expandedService === service && (
                    <div className="border-t border-gray-100">
                      {/* Table header */}
                      <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-2.5 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="col-span-3">Nom</div>
                        <div className="col-span-3">Email</div>
                        <div className="col-span-2">Service</div>
                        <div className="col-span-2">Rôle</div>
                        <div className="col-span-2 text-right">Actions</div>
                      </div>

                      <div className="divide-y divide-gray-50">
                        {serviceUsers.map(u => (
                          <div key={u._id} className="grid grid-cols-1 md:grid-cols-12 gap-4 px-5 py-3 items-center hover:bg-gray-50 transition-colors">
                            <div className="col-span-3 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{u.firstName} {u.lastName}</p>
                            </div>
                            <div className="col-span-3 min-w-0">
                              <p className="text-sm text-gray-600 truncate">{u.email}</p>
                            </div>
                            <div className="col-span-2 min-w-0">
                              <p className="text-sm text-gray-600 truncate">{u.service}</p>
                            </div>
                            <div className="col-span-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadge(u.role)}`}>
                                {u.role === 'superadmin' ? 'Super Admin' : u.role === 'admin' ? 'Admin' : 'Visiteur'}
                              </span>
                            </div>
                            <div className="col-span-2 flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleSendResetEmail(u.email)}
                                disabled={actionLoading === `reset-${u.email}`}
                                className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors disabled:opacity-50"
                                title="Envoyer un email de reset"
                              >
                                <FiMail className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openEditModal(u)}
                                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                                title="Modifier"
                              >
                                <FiEdit2 className="w-4 h-4" />
                              </button>
                              {u.email !== currentUser.email && (
                                <button
                                  onClick={() => handleDelete(u.email)}
                                  disabled={actionLoading === u.email}
                                  className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors disabled:opacity-50"
                                  title="Supprimer"
                                >
                                  <FiTrash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 animate-fade-in">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <FiX className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {formErrors.submit && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                  {formErrors.submit}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  />
                  {formErrors.lastName && <p className="text-xs text-red-600 mt-1">{formErrors.lastName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  />
                  {formErrors.firstName && <p className="text-xs text-red-600 mt-1">{formErrors.firstName}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  disabled={!!editingUser}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm disabled:bg-gray-100 disabled:text-gray-500"
                />
                {formErrors.email && <p className="text-xs text-red-600 mt-1">{formErrors.email}</p>}
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  />
                  {formErrors.password && <p className="text-xs text-red-600 mt-1">{formErrors.password}</p>}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
                <select
                  value={formData.service}
                  onChange={(e) => setFormData(prev => ({ ...prev, service: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                >
                  <option value="" disabled>Sélectionner un service</option>
                  {SERVICES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {formErrors.service && <p className="text-xs text-red-600 mt-1">{formErrors.service}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                >
                  {ROLES.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === 'submit'}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-500 rounded-lg hover:bg-primary-600 disabled:opacity-50"
                >
                  {actionLoading === 'submit' ? 'Enregistrement...' : (editingUser ? 'Modifier' : 'Créer')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserManagement
