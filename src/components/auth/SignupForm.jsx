import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiMail, FiLock, FiUser } from 'react-icons/fi'
import Input from '../common/Input'
import Button from '../common/Button'

function SignupForm({ onSuccess }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!name || !email || !password || !confirmPassword) {
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

      const response = await fetch('http://localhost:3000/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role: 'visiteur' // rôle fixé
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Échec de la création du compte')
      }

      if (onSuccess) onSuccess()
    } catch (err) {
      setError(err.message)
      console.error('Erreur lors de l’inscription :', err)
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

      <div className="relative">
        <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          id="name"
          placeholder="Nom complet"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="pl-10"
          required
        />
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
