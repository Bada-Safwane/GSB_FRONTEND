import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiMail, FiLock } from 'react-icons/fi'
import Input from '../common/Input'
import Button from '../common/Button'
import { useAuth } from '../../contexts/AuthContext'

/**
 * SB - Composant formulaire de connexion
 * Gère l'authentification des utilisateurs via email et mot de passe
 */
function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  const { login } = useAuth() // Use the login function from context

  /**
   * SB - Gestion de la soumission du formulaire de connexion
   * Valide les champs et appelle l'API d'authentification
   * @param {Event} e - Événement de soumission du formulaire
   */
  const handleSubmit = async (e) => {
    e.preventDefault()

    // SB - Validation des champs obligatoires
    if (!email || !password) {
      setError('Veuillez remplir tous les champs')
      return
    }

    try {
      setLoading(true)
      setError('')

      console.log('Attempting login with:', { email, password })
      
      // SB - Utilisation de la fonction login du contexte d'authentification
      const token = await login(email, password)
      
      console.log('Login successful, token received:', token)

      // SB - Redirection vers le tableau de bord après connexion réussie
      navigate('/dashboard')
    } catch (err) {
      console.error('Login error details:', err)
      setError(err.message || 'Échec de la connexion. Veuillez vérifier vos identifiants.')
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

      <Button type="submit" fullWidth disabled={loading}>
        {loading ? 'Connexion en cours...' : 'Se connecter'}
      </Button>

      <p className="text-center text-gray-600 text-sm">
        Vous n'avez pas de compte ?{' '}
        <Link to="/signup" className="text-primary-500 hover:text-primary-600 font-medium">
          S'inscrire
        </Link>
      </p>
    </form>
  )
}

export default LoginForm