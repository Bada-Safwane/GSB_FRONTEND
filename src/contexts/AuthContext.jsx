import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

// SB - Création du contexte d'authentification pour partager l'état utilisateur
const AuthContext = createContext();

/**
 * SB - Hook personnalisé pour accéder au contexte d'authentification
 * @returns {Object} Contexte d'authentification (user, token, login, logout, etc.)
 */
export const useAuth = () => {
  return useContext(AuthContext);
};

/**
 * SB - Composant Provider pour le contexte d'authentification
 * Gère l'état de connexion, le token JWT et les informations utilisateur
 * @param {Object} children - Composants enfants à envelopper
 */
export const AuthProvider = ({ children }) => {
  // SB - Initialisation du token depuis le localStorage
  const [token, setToken] = useState(() => localStorage.getItem('authToken'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * SB - Effet pour charger le token et décoder les infos utilisateur au montage
   */
  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');
    if (savedToken) {
      setToken(savedToken);
      try {
        // SB - Décodage du JWT pour extraire les informations utilisateur
        const decoded = jwtDecode(savedToken);
        setUser(decoded); // set user info from token
      } catch (error) {
        console.error("AuthContext: Invalid token:", error);
        setUser(null);
        setToken(null);
        localStorage.removeItem('authToken');
      }
    }
    setLoading(false);
  }, []);

  /**
   * SB - Fonction de connexion qui appelle l'API backend
   * @param {String} email - Email de l'utilisateur
   * @param {String} password - Mot de passe de l'utilisateur
   * @returns {String} Token JWT si connexion réussie
   */
  const login = async (email, password) => {
    try {
      console.log('AuthContext: Making login request to backend');

      // SB - Appel API pour authentification
      const response = await fetch('https://gsb-backend-nti4.onrender.com/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      console.log('AuthContext: Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('AuthContext: Login failed with error:', errorData);
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      console.log('AuthContext: Login response data:', data);

      if (!data.token) {
        console.error('AuthContext: No token in response');
        throw new Error('No token received');
      }

      console.log('AuthContext: Setting token and saving to localStorage');
      // SB - Sauvegarde du token dans l'état et le localStorage
      setToken(data.token);
      localStorage.setItem('authToken', data.token);

      try {
        // SB - Décodage et stockage des infos utilisateur
        const decoded = jwtDecode(data.token);
        setUser(decoded);
      } catch (error) {
        console.error("AuthContext: Invalid token after login:", error);
        setUser(null);
      }

      console.log('AuthContext: Login successful, returning token');
      return data.token;
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      throw error;
    }
  };

  /**
   * SB - Fonction de déconnexion qui nettoie l'état et le localStorage
   * @returns {Promise} Promesse résolue après déconnexion
   */
  const logout = () => {
    console.log('AuthContext: Logging out');
    // SB - Réinitialisation de l'état d'authentification
    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
    return Promise.resolve();
  };

  const value = {
    token,
    user,
    setToken,
    setUser,
    login,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
