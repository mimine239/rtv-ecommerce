import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { mockFirestore } from '../firebase/mockFirestore';
import { USE_MOCK_FIRESTORE, productService } from '../services/productService';
import toast from 'react-hot-toast';
import type { Product } from '../types/index';

// Page principale des vendeurs
const VendeurPage = () => {
  const { currentUser, userProfile, isAuthenticated } = useAuth();
  
  // Utilisation des données réelles de Firebase
  const [vendorProducts, setVendorProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Fonction pour récupérer les produits du vendeur depuis Firebase ou mock
  const fetchVendorProducts = async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      
      if (USE_MOCK_FIRESTORE) {
        // Associer l'ID du vendeur actuel aux produits mockés (uniquement pour le développement)
        mockFirestore.associateVendorIdToMockProducts(currentUser.uid);
        
        // Utiliser le mock de Firestore
        const productsRef = mockFirestore.collection();
        const whereClause = mockFirestore.where('vendorId', '==', currentUser.uid);
        const q = mockFirestore.query(productsRef, whereClause);
        const querySnapshot = await mockFirestore.getDocs(q);
        
        const products: Product[] = [];
        querySnapshot.forEach((docSnapshot) => {
          const data = docSnapshot.data() as Partial<Omit<Product, 'id'>>;
          products.push({
            id: docSnapshot.id,
            name: data.name || '',
            description: data.description || '',
            price: data.price || 0,
            stock: data.stock || 0,
            imageUrl: data.imageUrl || '',
            vendorId: data.vendorId || currentUser.uid,
            category: data.category || '',
            vendorName: data.vendorName || currentUser.displayName || 'Vendeur',
            featured: data.featured || false,
            createdAt: data.createdAt || new Date(),
            updatedAt: data.updatedAt || new Date()
          });
        });
        
        setVendorProducts(products);
      } else {
        // Utiliser Firebase réel
        const productsRef = collection(db, 'products');
        const q = query(productsRef, where('vendorId', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);
        
        const products: Product[] = [];
        querySnapshot.forEach((docSnapshot) => {
          const data = docSnapshot.data() as Partial<Omit<Product, 'id'>>;
          products.push({
            id: docSnapshot.id,
            name: data.name || '',
            description: data.description || '',
            price: data.price || 0,
            stock: data.stock || 0,
            imageUrl: data.imageUrl || '',
            vendorId: data.vendorId || currentUser.uid,
            category: data.category || '',
            vendorName: data.vendorName || currentUser.displayName || 'Vendeur',
            featured: data.featured || false,
            createdAt: data.createdAt || new Date(),
            updatedAt: data.updatedAt || new Date()
          });
        });
        
        setVendorProducts(products);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Erreur lors de la récupération des produits:', err);
      setError('Une erreur est survenue lors du chargement de vos produits.');
      setLoading(false);
    }
  };
  
  // Fonction pour supprimer un produit
  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      return;
    }
    
    try {
      console.log('Début de la suppression du produit:', productId);
      
      // Utiliser le service productService pour la suppression
      // Ce service gère déjà la logique pour les mocks et le Firestore réel
      await productService.deleteProduct(productId);
      
      console.log('Produit supprimé avec succès');
      toast.success('Produit supprimé avec succès');
      
      // Mettre à jour la liste des produits
      setVendorProducts(prevProducts => prevProducts.filter(product => product.id !== productId));
    } catch (err) {
      console.error('Erreur lors de la suppression du produit:', err);
      toast.error('Une erreur est survenue lors de la suppression du produit');
    }
  };
  
  // Charger les produits au montage du composant
  useEffect(() => {
    fetchVendorProducts();
  }, [currentUser]);

  // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
  if (!isAuthenticated) {
    return (
      <div className="container-custom py-8">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold mb-4">Espace Vendeur</h2>
          <p className="mb-6">Connectez-vous pour accéder à votre espace vendeur.</p>
          <Link to="/login" className="btn-primary">
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  // Si l'utilisateur est connecté mais n'est pas un vendeur
  if (userProfile && userProfile.role !== 'vendor' && userProfile.role !== 'admin') {
    return (
      <div className="container-custom py-8">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold mb-4">Accès refusé</h2>
          <p className="mb-6">Seuls les vendeurs peuvent accéder à cette page.</p>
          <Link to="/" className="btn-primary">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Espace Vendeur</h2>
          <Link to="/vendor/products/add" className="btn-primary">
            <FaPlus className="mr-2" /> Ajouter un produit
          </Link>
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Chargement de vos produits...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500">{error}</p>
          </div>
        ) : vendorProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prix
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vendorProducts.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img 
                            className="h-10 w-10 rounded-md object-cover" 
                            src={product.imageUrl || 'https://placehold.co/150'} 
                            alt={product.name} 
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{product.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.price} €
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {product.stock > 0 ? `En stock (${product.stock})` : 'Épuisé'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link 
                          to={`/product/${product.id}`} 
                          className="text-primary hover:text-primary/80" 
                          title="Voir"
                        >
                          <FaEye />
                        </Link>
                        <Link 
                          to={`/vendor/products/edit/${product.id}`} 
                          className="text-accent hover:text-accent/80" 
                          title="Modifier"
                        >
                          <FaEdit />
                        </Link>
                        <button 
                          onClick={() => handleDeleteProduct(product.id)} 
                          className="text-red-600 hover:text-red-800" 
                          title="Supprimer"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Vous n'avez pas encore ajouté de produits.</p>
            <Link to="/vendor/products/add" className="btn-primary">
              Ajouter mon premier produit
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendeurPage;
