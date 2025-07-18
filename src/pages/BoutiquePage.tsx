import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa';
import { productService } from '../services/productService';

// Import du type Product depuis les types de l'application
import type { Product } from '../types/index';

// Composant de recherche
const SearchBar = ({ onSearch }: { onSearch: (query: string) => void }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full">
      <div className="relative flex-grow">
        <input
          type="text"
          placeholder="Rechercher des produits..."
          className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      </div>
      <button
        type="submit"
        className="bg-primary text-white px-6 py-3 rounded-r-md hover:bg-primary/80"
      >
        Rechercher
      </button>
    </form>
  );
};

// Composant de filtre
const FilterSidebar = ({
  categories,
  selectedCategory,
  onSelectCategory,
  onClose,
}: {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  onClose: () => void;
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">Filtres</h3>
        <button onClick={onClose} className="md:hidden text-gray-500">
          <FaTimes />
        </button>
      </div>
      
      <div className="mb-6">
        <h4 className="font-medium mb-2">Catégories</h4>
        <div className="space-y-2">
          <div className="flex items-center">
            <input
              type="radio"
              id="all"
              name="category"
              checked={selectedCategory === ''}
              onChange={() => onSelectCategory('')}
              className="mr-2"
            />
            <label htmlFor="all" className="text-gray-700">Toutes les catégories</label>
          </div>
          
          {categories.map((category) => (
            <div key={category} className="flex items-center">
              <input
                type="radio"
                id={category}
                name="category"
                checked={selectedCategory === category}
                onChange={() => onSelectCategory(category)}
                className="mr-2"
              />
              <label htmlFor={category} className="text-gray-700">{category}</label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Composant de carte produit
const ProductCard = ({ product }: { product: Product }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <Link to={`/product/${product.id}`}>
        <img
          src={product.imageUrl || 'https://placehold.co/300x200?text=Image+non+disponible'}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
      </Link>
      <div className="p-4">
        <Link to={`/product/${product.id}`} className="block">
          <h3 className="text-lg font-semibold text-gray-800 mb-1 hover:text-primary">{product.name}</h3>
        </Link>
        <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
        <div className="flex justify-between items-center mb-2">
          <span className="font-bold text-primary">{product.price.toFixed(2)} €</span>
          <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">{product.category}</span>
        </div>
        <div className="text-sm text-gray-500">
          Vendeur: {product.vendorName || 'Anonyme'}
        </div>
      </div>
    </div>
  );
};

// Page principale de la boutique
const BoutiquePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Liste des catégories disponibles
  const [categories, setCategories] = useState<string[]>([]);
  
  // Charger les produits au chargement de la page
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const result = await productService.getProducts();
        setProducts(result.products);
        
        // Extraire les catégories uniques des produits
        const uniqueCategories = Array.from(
          new Set(result.products.filter(product => product.category).map(product => product.category))
        ) as string[];
        setCategories(uniqueCategories);
      } catch (err) {
        console.error('Erreur lors du chargement des produits:', err);
        setError('Impossible de charger les produits. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };
    
    loadProducts();
  }, []);
  
  // Filtrer les produits en fonction de la recherche et de la catégorie
  const filteredProducts = products.filter((product) => {
    const matchesSearch = searchQuery === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === '' || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-bold mb-6">Boutique</h1>
      
      {/* Barre de recherche */}
      <div className="mb-6">
        <SearchBar onSearch={setSearchQuery} />
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Bouton pour afficher les filtres sur mobile */}
        <div className="md:hidden mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center bg-white px-4 py-2 rounded-md shadow-sm border border-gray-200"
          >
            <FaFilter className="mr-2" /> Filtres
          </button>
        </div>
        
        {/* Sidebar avec filtres */}
        <div className={`md:w-1/4 ${showFilters ? 'block' : 'hidden'} md:block`}>
          <FilterSidebar
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onClose={() => setShowFilters(false)}
          />
        </div>
        
        {/* Liste des produits */}
        <div className="md:w-3/4">
          {loading ? (
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <p className="text-gray-600">Chargement des produits...</p>
            </div>
          ) : error ? (
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <p className="text-red-500">{error}</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <p className="text-gray-600">
                Aucun produit ne correspond à votre recherche.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BoutiquePage;
