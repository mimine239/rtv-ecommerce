import { Link } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { FaTiktok, FaUserCircle, FaBars, FaTimes, FaChevronDown, FaStore, FaSignOutAlt, FaUserEdit, FaEnvelope } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import NotificationBell from './notifications/NotificationBell';

const Header = () => {
  const { currentUser, userProfile, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Fermer le menu utilisateur lorsqu'on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Gérer la déconnexion
  const handleLogout = async () => {
    try {
      await logout();
      setIsUserMenuOpen(false);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container-custom py-4">
        <div className="flex items-center justify-between">
          {/* Logo et slogan */}
          <div className="flex items-center">
            <Link to="/" className="flex flex-col items-center">
              <div className="text-3xl font-bold text-primary">
                <span className="text-primary">R</span>
                <span className="text-secondary">.</span>
                <span className="text-accent">T</span>
                <span className="text-secondary">.</span>
                <span className="text-primary">V</span>
              </div>
              <div className="text-xs text-gray-600 font-medium flex flex-col items-center">
                <span>Réussis</span>
                <span>Ta</span>
                <span>Vie</span>
              </div>
            </Link>
          </div>

          {/* Navigation desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-primary font-medium">Accueil</Link>
            <Link to="/vendeurs" className="text-gray-700 hover:text-primary font-medium">Vendeurs</Link>
            <Link to="/boutique" className="text-gray-700 hover:text-primary font-medium">Boutique</Link>
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center space-x-6">
            <a 
              href="https://www.tiktok.com/@devcoran" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-primary"
              aria-label="TikTok"
            >
              <FaTiktok size={20} />
            </a>
            
            {/* Cloche de notification pour les messages non lus */}
            {currentUser && (
              <NotificationBell />
            )}
            
            {/* Menu utilisateur */}
            <div className="relative" ref={userMenuRef}>
              {currentUser ? (
                <>
                  <button 
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center text-gray-700 hover:text-primary"
                  >
                    <span className="mr-1 font-medium text-sm">
                      {userProfile?.displayName || currentUser.email?.split('@')[0]}
                    </span>
                    <FaChevronDown size={12} />
                  </button>
                  
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                      <Link 
                        to="/profile" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <FaUserEdit className="mr-2" /> Profil
                      </Link>
                      <Link 
                        to="/messages" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <FaEnvelope className="mr-2" /> Messages
                      </Link>
                      
                      {/* Options pour vendeurs */}
                      {userProfile?.role === 'vendor' || userProfile?.role === 'admin' ? (
                        <>
                          <Link 
                            to="/vendor/products" 
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <FaStore className="mr-2" /> Mes produits
                          </Link>
                          {/* Lien vers les bannières supprimé */}
                        </>
                      ) : null}
                      
                      <button 
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <FaSignOutAlt className="mr-2" /> Déconnexion
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <Link to="/login" className="text-gray-700 hover:text-primary flex items-center">
                  <FaUserCircle size={22} className="mr-1" />
                  <span className="font-medium text-sm">Connexion</span>
                </Link>
              )}
            </div>
          </div>

          {/* Menu burger pour mobile */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700"
              aria-label="Menu"
            >
              {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>

        {/* Menu mobile */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t mt-4">
            <nav className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className="text-gray-700 hover:text-primary font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Accueil
              </Link>
              <Link 
                to="/vendeurs" 
                className="text-gray-700 hover:text-primary font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Vendeurs
              </Link>
              <Link 
                to="/boutique" 
                className="text-gray-700 hover:text-primary font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Boutique
              </Link>
              
              {/* Options utilisateur mobile */}
              <div className="pt-2 border-t border-gray-100">
                {currentUser ? (
                  <>
                    <div className="font-medium text-gray-800 mb-2">
                      {userProfile?.displayName || currentUser.email?.split('@')[0]}
                    </div>
                    
                    <Link 
                      to="/profile" 
                      className="flex items-center text-gray-700 hover:text-primary py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <FaUserEdit className="mr-2" /> Profil
                    </Link>
                    
                    <Link 
                      to="/messages" 
                      className="flex items-center text-gray-700 hover:text-primary py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <FaEnvelope className="mr-2" /> Messages
                      {/* Indicateur de messages non lus dans le menu mobile */}
                      <NotificationBell className="ml-2" onClick={() => setIsMenuOpen(false)} />
                    </Link>
                    
                    {/* Options pour vendeurs */}
                    {userProfile?.role === 'vendor' || userProfile?.role === 'admin' ? (
                      <>
                        <Link 
                          to="/vendor/products" 
                          className="flex items-center text-gray-700 hover:text-primary py-2"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <FaStore className="mr-2" /> Mes produits
                        </Link>
                      </>
                    ) : null}
                    
                    <button 
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center text-gray-700 hover:text-primary py-2 w-full text-left"
                    >
                      <FaSignOutAlt className="mr-2" /> Déconnexion
                    </button>
                  </>
                ) : (
                  <Link 
                    to="/login" 
                    className="flex items-center text-gray-700 hover:text-primary py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FaUserCircle className="mr-2" size={20} /> Connexion
                  </Link>
                )}
                
                <a 
                  href="https://www.tiktok.com/@devcoran" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-gray-700 hover:text-primary py-2 mt-2"
                  aria-label="TikTok"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FaTiktok className="mr-2" size={20} /> TikTok
                </a>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
