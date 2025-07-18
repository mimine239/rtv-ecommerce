import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaUserPlus } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [userNotFound, setUserNotFound] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation simple
    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      setUserNotFound(false);
      return;
    }
    
    try {
      setError('');
      setUserNotFound(false);
      setLoading(true);
      await login(email, password);
      toast.success('Connexion réussie!');
      navigate('/');
    } catch (err) {
      console.error('Erreur de connexion:', err);
      
      // Détecter le type d'erreur spécifique
      const errorMessage = err instanceof Error ? err.message : String(err);
      
      if (errorMessage.includes('auth/user-not-found')) {
        setUserNotFound(true);
        setError('Aucun compte n\'existe avec cet email.');
        toast.error('Utilisateur non trouvé');
      } else if (errorMessage.includes('auth/invalid-credential')) {
        setUserNotFound(false);
        setError('Email ou mot de passe incorrect.');
        toast.error('Identifiants invalides');
      } else if (errorMessage.includes('auth/wrong-password')) {
        setUserNotFound(false);
        setError('Mot de passe incorrect.');
        toast.error('Mot de passe incorrect');
      } else {
        setUserNotFound(false);
        setError('Échec de la connexion. Vérifiez vos identifiants.');
        toast.error('Échec de la connexion');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-custom py-12">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">Connexion</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
            {error}
            {userNotFound && (
              <div className="mt-2">
                <Link 
                  to="/register" 
                  state={{ email }} 
                  className="flex items-center text-primary hover:underline font-medium"
                >
                  <FaUserPlus className="mr-2" /> Créer un compte avec cet email
                </Link>
              </div>
            )}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="text-gray-400" />
              </div>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="votre@email.com"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="text-gray-400" />
              </div>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="••••••••"
              />
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-primary text-white py-2 px-4 rounded-md ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary/80'}`}
            >
              {loading ? 'Connexion en cours...' : 'Se connecter'}
            </button>
          </div>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Vous n'avez pas de compte ?{' '}
            <Link to="/register" className="text-primary hover:underline">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
