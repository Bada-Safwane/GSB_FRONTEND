import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiMail, FiLock, FiUser, FiBriefcase } from 'react-icons/fi'
import Input from '../common/Input'
import Button from '../common/Button'

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

/**
 * SB - Composant formulaire d'inscription
 * Permet la création d'un nouveau compte utilisateur
 * @param {Function} onSuccess - Callback appelé après inscription réussie
 */
function SignupForm({ onSuccess }) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [service, setService] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!firstName || !lastName || !service || !email || !password || !confirmPassword) {
      setError('Veuillez remplir tous les champs')
      return
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    try {
      setError('')
      setLoading(true)

      const response = await fetch('https://gsb-backend-nti4.onrender.com/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstName,
          lastName,
          service,
          email,
          password,
          role: 'visiteur'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Échec de la création du compte')
      }

      if (onSuccess) onSuccess()
    } catch (err) {
      setError(err.message)
      console.error('Erreur lors de l\'inscription :', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-error-500 bg-opacity-10 border border-error-500 text-error-500 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="relative">
          <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            id="lastName"
            placeholder="Nom"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="pl-10"
            required
          />
        </div>
        <div className="relative">
          <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            id="firstName"
            placeholder="Prénom"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="pl-10"
            required
          />
        </div>
      </div>

      <div className="relative">
        <FiBriefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
        <select
          id="service"
          value={service}
          onChange={(e) => setService(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white text-sm"
          required
        >
          <option value="" disabled>Sélectionner un service</option>
          {SERVICES.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="relative">
        <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          type="email"
          id="email"
          placeholder="Adresse email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="pl-10"
          required
        />
      </div>

      <div className="relative">
        <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          type="password"
          id="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="pl-10"
          required
        />
      </div>

      <div className="relative">
        <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          type="password"
          id="confirmPassword"
          placeholder="Confirmer le mot de passe"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="pl-10"
          required
        />
      </div>

      <Button
        type="submit"
        fullWidth
        disabled={loading}
      >
        {loading ? 'Création du compte...' : 'Créer un compte'}
      </Button>

      <p className="text-center text-gray-600 text-sm">
        Vous avez déjà un compte ?{' '}
        <Link to="/login" className="text-primary-500 hover:text-primary-600 font-medium">
          Se connecter
        </Link>
      </p>
    </form>
  )
}

export default SignupForm
