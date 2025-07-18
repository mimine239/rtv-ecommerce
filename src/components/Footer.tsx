import { Link } from 'react-router-dom';
import { FaTiktok } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-dark text-white py-8">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo et slogan */}
          <div className="flex flex-col items-center md:items-start">
            <Link to="/" className="flex flex-col items-center md:items-start">
              <div className="text-2xl font-bold">
                <span className="text-primary">R</span>
                <span className="text-secondary">.</span>
                <span className="text-accent">T</span>
                <span className="text-secondary">.</span>
                <span className="text-primary">V</span>
              </div>
              <div className="text-xs text-gray-300 font-medium flex flex-col items-center md:items-start">
                <span>Réussis</span>
                <span>Ta</span>
                <span>Vie</span>
              </div>
            </Link>
            <p className="mt-4 text-gray-300 text-sm text-center md:text-left">
              Plateforme de mise en relation entre vendeurs et acheteurs.
            </p>
          </div>

          {/* Liens rapides */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-lg font-semibold mb-4">Liens rapides</h3>
            <nav className="flex flex-col space-y-2">
              <Link to="/" className="text-gray-300 hover:text-white text-sm">Accueil</Link>
              <Link to="/vendeurs" className="text-gray-300 hover:text-white text-sm">Vendeurs</Link>
              <Link to="/boutique" className="text-gray-300 hover:text-white text-sm">Boutique</Link>
              <Link to="/login" className="text-gray-300 hover:text-white text-sm">Connexion</Link>
              <Link to="/register" className="text-gray-300 hover:text-white text-sm">Inscription</Link>
            </nav>
          </div>

          {/* Contact et réseaux sociaux */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-lg font-semibold mb-4">Suivez-nous</h3>
            <div className="flex items-center space-x-4">
              <a 
                href="https://www.tiktok.com/@devcoran" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white"
                aria-label="TikTok"
              >
                <FaTiktok size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} R.T.V - Réussis Ta Vie. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
