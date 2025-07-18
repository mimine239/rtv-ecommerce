import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import ProductForm from '../components/ProductForm';
import { productService } from '../services/productService';

const EditProductPage = () => {
  const { productId } = useParams<{ productId: string }>();
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Charger les données du produit
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      
      try {
        setLoading(true);
        const productData = await productService.getProductById(productId);
        
        // Vérifier si l'utilisateur est le propriétaire du produit ou un admin
        if (
          productData.vendorId !== currentUser?.uid && 
          userProfile?.role !== 'admin'
        ) {
          toast.error('Vous n\'êtes pas autorisé à modifier ce produit');
          navigate('/vendor/products');
          return;
        }
        
        setProduct(productData);
      } catch (err) {
        console.error('Erreur lors du chargement du produit:', err);
        setError('Impossible de charger les informations du produit');
        toast.error('Erreur lors du chargement du produit');
      } finally {
        setLoading(false);
      }
    };
    
    if (currentUser) {
      fetchProduct();
    }
  }, [productId, currentUser, userProfile, navigate]);
  
  // Vérifier si l'utilisateur est connecté
  useEffect(() => {
    if (!currentUser) {
      toast.error('Vous devez être connecté pour accéder à cette page');
      navigate('/login');
    }
  }, [currentUser, navigate]);
  
  const handleSubmit = async (productData: any) => {
    try {
      if (!productId) throw new Error('ID du produit manquant');
      
      // S'assurer que les propriétés importantes sont préservées
      const updatedData = {
        ...productData,
        updatedAt: new Date() // Ajouter la date de mise à jour
      };
      
      // Préserver les images existantes si elles existent
      if (product.images && !updatedData.images) {
        updatedData.images = product.images;
      }
      
      console.log('Données de mise à jour:', updatedData);
      await productService.updateProduct(productId, updatedData);
      toast.success('Produit mis à jour avec succès');
      return Promise.resolve();
    } catch (error) {
      console.error('Erreur lors de la modification du produit:', error);
      toast.error('Erreur lors de la mise à jour du produit');
      return Promise.reject(error);
    }
  };
  
  if (loading) {
    return (
      <div className="container-custom py-12">
        <div className="text-center">
          <p>Chargement du produit...</p>
        </div>
      </div>
    );
  }
  
  if (error || !product) {
    return (
      <div className="container-custom py-12">
        <div className="bg-red-50 p-4 rounded-md border border-red-200">
          <p className="text-red-700">{error || 'Produit non trouvé'}</p>
          <button 
            onClick={() => navigate(-1)}
            className="mt-4 text-primary hover:underline"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container-custom py-12">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <ProductForm 
          initialData={product} 
          onSubmit={handleSubmit} 
          isEditing={true} 
        />
      </div>
    </div>
  );
};

export default EditProductPage;
