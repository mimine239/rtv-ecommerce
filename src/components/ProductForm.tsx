import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSave, FaArrowLeft } from 'react-icons/fa';
import toast from 'react-hot-toast';
import ImageUploader from './ImageUploader';
import { uploadService } from '../services/uploadService';
import { useAuth } from '../contexts/AuthContext';

// Type pour le produit
interface ProductFormData {
  id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  imageFile?: File;
  stock: number;
  vendorId: string;
  vendorName: string;
  featured: boolean;
}

interface ProductFormProps {
  initialData?: Partial<ProductFormData>;
  onSubmit: (productData: ProductFormData) => Promise<void>;
  isEditing?: boolean;
}

const ProductForm = ({ initialData, onSubmit, isEditing = false }: ProductFormProps) => {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  
  const [formData, setFormData] = useState<ProductFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    price: initialData?.price !== undefined && !isNaN(Number(initialData.price)) ? Number(initialData.price) : 0,
    category: initialData?.category || '',
    imageUrl: initialData?.imageUrl || '',
    stock: initialData?.stock !== undefined && !isNaN(Number(initialData.stock)) ? Number(initialData.stock) : 1,
    vendorId: currentUser?.uid || '',
    vendorName: userProfile?.displayName || '',
    featured: initialData?.featured || false
  });
  
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  useEffect(() => {
    // Mettre à jour les informations du vendeur si l'utilisateur change
    if (currentUser && userProfile) {
      setFormData(prev => ({
        ...prev,
        vendorId: currentUser.uid,
        vendorName: userProfile.displayName || ''
      }));
    }
  }, [currentUser, userProfile]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData(prev => {
      if (type === 'checkbox') {
        return { ...prev, [name]: (e.target as HTMLInputElement).checked };
      } else if (type === 'number') {
        // Pour les champs numériques, gérer les cas vides et invalides
        const parsedValue = value === '' ? 0 : parseFloat(value);
        const validValue = isNaN(parsedValue) ? 0 : parsedValue;
        return { ...prev, [name]: validValue };
      } else {
        return { ...prev, [name]: value };
      }
    });
  };
  
  const handleImageUploaded = (imageUrl: string, file: File) => {
    setFormData(prev => ({
      ...prev,
      imageUrl,
      imageFile: file
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Validation
      if (!formData.name || !formData.description || formData.price <= 0) {
        toast.error('Veuillez remplir tous les champs obligatoires');
        return;
      }
      
      let finalImageUrl = formData.imageUrl;
      
      // Si une nouvelle image a été sélectionnée, la télécharger
      if (formData.imageFile) {
        finalImageUrl = await uploadService.uploadImage(
          formData.imageFile, 
          'products',
          (progress) => setUploadProgress(progress)
        );
      }
      
      // Soumettre le produit avec l'URL de l'image mise à jour
      // Retirer l'objet imageFile avant d'envoyer à Firestore car il n'est pas supporté
      const { imageFile, ...productDataToSubmit } = formData;
      await onSubmit({
        ...productDataToSubmit,
        imageUrl: finalImageUrl
      });
      
      toast.success(`Produit ${isEditing ? 'modifié' : 'ajouté'} avec succès!`);
      navigate('/vendor/products');
      
    } catch (error) {
      console.error('Erreur lors de la soumission du produit:', error);
      toast.error(`Erreur lors de ${isEditing ? 'la modification' : 'l\'ajout'} du produit`);
    } finally {
      setLoading(false);
    }
  };
  
  const categories = [
    'Vêtements',
    'Accessoires',
    'Électronique',
    'Maison',
    'Beauté',
    'Livres',
    'Sports',
    'Autres'
  ];
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-primary"
        >
          <FaArrowLeft className="mr-2" /> Retour
        </button>
        <h2 className="text-2xl font-bold">
          {isEditing ? 'Modifier le produit' : 'Ajouter un nouveau produit'}
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nom du produit *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Prix (€) *
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={isNaN(formData.price) ? '0' : formData.price.toString()}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            
            <div>
              <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
                Stock *
              </label>
              <input
                type="number"
                id="stock"
                name="stock"
                value={isNaN(formData.stock) ? '0' : formData.stock.toString()}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Catégorie *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="">Sélectionner une catégorie</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="featured"
              name="featured"
              checked={formData.featured}
              onChange={handleChange}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
              Produit en vedette
            </label>
          </div>
        </div>
        
        <div>
          <ImageUploader
            onImageUploaded={handleImageUploaded}
            currentImage={formData.imageUrl}
            label="Image du produit *"
          />
          
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-primary h-2.5 rounded-full" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Téléchargement: {uploadProgress.toFixed(0)}%
              </p>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className={`flex items-center bg-primary text-white py-2 px-6 rounded-md ${
            loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary/80'
          }`}
        >
          {loading ? (
            <>Enregistrement en cours...</>
          ) : (
            <>
              <FaSave className="mr-2" /> 
              {isEditing ? 'Enregistrer les modifications' : 'Ajouter le produit'}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
