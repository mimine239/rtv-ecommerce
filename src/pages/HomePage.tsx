import { Link } from 'react-router-dom';

// Composant pour le slogan RTV
const RTVSlogan = () => {
  return (
    <div className="flex flex-col items-center py-12 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg shadow-inner">
      <div className="text-5xl font-bold mb-4 flex flex-col items-center">
        <div className="flex">
          <span className="text-primary">R</span>
          <span className="text-secondary">éussis</span>
        </div>
        <div className="flex">
          <span className="text-accent">T</span>
          <span className="text-secondary">a</span>
        </div>
        <div className="flex">
          <span className="text-primary">V</span>
          <span className="text-secondary">ie</span>
        </div>
      </div>
      <p className="text-gray-600 text-center max-w-md">
        Trouvez ce que vous cherchez et réalisez vos projets avec notre plateforme de mise en relation.
      </p>
    </div>
  );
};

// Composant pour les catégories populaires
const PopularCategories = () => {
  const categories = [
    { id: 1, name: 'Électronique', icon: '🖥️', link: '/boutique?category=electronique' },
    { id: 2, name: 'Mode', icon: '👕', link: '/boutique?category=mode' },
    { id: 3, name: 'Maison', icon: '🏠', link: '/boutique?category=maison' },
    { id: 4, name: 'Loisirs', icon: '🎮', link: '/boutique?category=loisirs' },
    { id: 5, name: 'Automobile', icon: '🚗', link: '/boutique?category=automobile' },
    { id: 6, name: 'Services', icon: '🔧', link: '/boutique?category=services' },
  ];

  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Catégories populaires</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            to={category.link}
            className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <span className="text-3xl mb-2">{category.icon}</span>
            <span className="text-gray-800 font-medium">{category.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

// Page d'accueil principale
const HomePage = () => {
  return (
    <div className="container-custom py-8">
      {/* La section des bannières publicitaires a été supprimée */}

      {/* Slogan RTV */}
      <section className="mb-12">
        <RTVSlogan />
      </section>

      {/* Catégories populaires */}
      <section className="mb-12">
        <PopularCategories />
      </section>

      {/* Appel à l'action pour les vendeurs */}
      <section className="bg-gradient-to-r from-primary to-accent rounded-lg p-8 text-white text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">Vous êtes vendeur ?</h2>
        <p className="mb-6 max-w-2xl mx-auto">
          Rejoignez notre plateforme et commencez à publier vos produits dès aujourd'hui. 
          Créez votre compte gratuitement et entrez en contact avec des acheteurs potentiels !
        </p>
        <Link to="/register" className="bg-white text-primary font-bold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors">
          Devenir vendeur
        </Link>
      </section>
    </div>
  );
};

export default HomePage;
