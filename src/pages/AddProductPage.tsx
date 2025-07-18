import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import ProductForm from '../components/ProductForm';
import { productService } from '../services/productService';

const AddProductPage = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  
  // Vérifier si l'utilisateur est connecté et est un vendeur
  useEffect(() => {
    if (!currentUser) {
      toast.error('Vous devez être connecté pour accéder à cette page');
      navigate('/login');
      return;
    }
    
    if (userProfile && userProfile.role !== 'vendor' && userProfile.role !== 'admin') {
      toast.error('Seuls les vendeurs peuvent ajouter des produits');
      navigate('/');
    }
  }, [currentUser, userProfile, navigate]);
  
  const handleSubmit = async (productData: any) => {
    try {
      await productService.addProduct(productData);
      return Promise.resolve();
    } catch (error) {
      console.error('Erreur lors de l\'ajout du produit:', error);
      return Promise.reject(error);
    }
  };
  
  if (!currentUser || !userProfile) {
    return (
      <div className="container-custom py-12">
        <div className="text-center">
          <p>Chargement...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container-custom py-12">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <ProductForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
};

export default AddProductPage;
