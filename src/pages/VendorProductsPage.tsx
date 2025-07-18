import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { productService } from '../services/productService';
import type { Product } from '../types/index';

const VendorProductsPage = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  
  // Vérifier si l'utilisateur est connecté et est un vendeur
  useEffect(() => {
    if (!currentUser) {
      toast.error('Vous devez être connecté pour accéder à cette page');
      navigate('/login');
      return;
    }
    
    if (userProfile && userProfile.role !== 'vendor' && userProfile.role !== 'admin') {
      toast.error('Seuls les vendeurs peuvent accéder à cette page');
      navigate('/');
      return;
    }
    
    loadProducts();
  }, [currentUser, userProfile, navigate]);
  
  // Charger les produits du vendeur
  const loadProducts = async () => {
    try {
      setLoading(true);
      if (!currentUser) return;
      
      const vendorProducts = await productService.getSellerProducts(currentUser.uid);
      setProducts(vendorProducts);
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
      toast.error('Impossible de charger vos produits');
    } finally {
      setLoading(false);
    }
  };
  
  // Filtrer les produits en fonction du terme de recherche
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Supprimer un produit
  const handleDeleteProduct = async (productId: string) => {
    try {
      setLoading(true);
      await productService.deleteProduct(productId);
      
      // Mettre à jour la liste des produits
      setProducts(products.filter(product => product.id !== productId));
      toast.success('Produit supprimé avec succès');
      setConfirmDelete(null);
    } catch (error) {
      console.error('Erreur lors de la suppression du produit:', error);
      toast.error('Erreur lors de la suppression du produit');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container-custom py-12">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Mes Produits</h1>
        <Link 
          to="/vendor/products/add" 
          className="flex items-center bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/80"
        >
          <FaPlus className="mr-2" /> Ajouter un produit
        </Link>
      </div>
      
      {/* Barre de recherche */}
      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Rechercher un produit..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>
      
      {loading ? (
        <div className="text-center py-12">
          <p>Chargement de vos produits...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-600 mb-4">Vous n'avez pas encore de produits.</p>
          <Link 
            to="/vendor/products/add" 
            className="inline-flex items-center bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/80"
          >
            <FaPlus className="mr-2" /> Ajouter votre premier produit
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Image</th>
                <th className="px-4 py-2 text-left">Nom</th>
                <th className="px-4 py-2 text-left">Catégorie</th>
                <th className="px-4 py-2 text-left">Prix</th>
                <th className="px-4 py-2 text-left">Stock</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">
                    <img 
                      src={product.imageUrl} 
                      alt={product.name} 
                      className="w-16 h-16 object-cover rounded-md"
                    />
                  </td>
                  <td className="px-4 py-2 font-medium">{product.name}</td>
                  <td className="px-4 py-2">{product.category}</td>
                  <td className="px-4 py-2">{product.price.toFixed(2)} €</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      product.stock > 10 
                        ? 'bg-green-100 text-green-800' 
                        : product.stock > 0 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-red-100 text-red-800'
                    }`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex space-x-2">
                      <Link 
                        to={`/vendor/products/edit/${product.id}`}
                        className="p-1 text-blue-600 hover:text-blue-800"
                        title="Modifier"
                      >
                        <FaEdit />
                      </Link>
                      
                      {confirmDelete === product.id ? (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-1 text-red-600 hover:text-red-800"
                            title="Confirmer la suppression"
                          >
                            Oui
                          </button>
                          <button
                            onClick={() => setConfirmDelete(null)}
                            className="p-1 text-gray-600 hover:text-gray-800"
                            title="Annuler"
                          >
                            Non
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDelete(product.id)}
                          className="p-1 text-red-600 hover:text-red-800"
                          title="Supprimer"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default VendorProductsPage;
