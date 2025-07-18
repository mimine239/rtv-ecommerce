import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="container-custom py-16 flex flex-col items-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-6">Page non trouvée</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <Link 
          to="/" 
          className="bg-primary text-white py-2 px-6 rounded-md hover:bg-primary/80 inline-block"
        >
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
