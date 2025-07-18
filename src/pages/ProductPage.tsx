import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaShare, FaComment } from 'react-icons/fa';
import { productService } from '../services/productService';
import { messageService } from '../services/messageService';
import type { Product } from '../types/index';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

// Type pour les paramètres d'URL
type ProductParams = {
  id: string;
}

const ProductPage = () => {
  const { id } = useParams<ProductParams>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [activeImage, setActiveImage] = useState(0);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contactLoading, setContactLoading] = useState(false);
  
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError('ID du produit manquant');
        setLoading(false);
        return;
      }
      
      try {
        const productData = await productService.getProductById(id);
        if (!productData) {
          setError('Produit non trouvé');
          setLoading(false);
          return;
        }
        
        setProduct(productData);
      } catch (err) {
        console.error('Erreur lors du chargement du produit:', err);
        setError('Erreur lors du chargement du produit');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [id]);
  

  const shareProduct = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Lien copié dans le presse-papier !");
  };

  if (loading) {
    return (
      <div className="container-custom py-8 text-center">
        <p>Chargement du produit...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container-custom py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p>{error || 'Produit non trouvé'}</p>
          <Link to="/boutique" className="text-primary hover:underline mt-2 inline-block">
            Retour à la boutique
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      {/* Fil d'Ariane et actions */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <Link to="/boutique" className="text-gray-600 hover:text-primary flex items-center">
            <FaArrowLeft className="mr-2" /> Retour aux produits
          </Link>
        </div>
        <button 
          onClick={shareProduct}
          className="text-gray-600 hover:text-primary flex items-center"
        >
          <FaShare className="mr-2" /> Partager
        </button>
      </div>

      {/* Contenu principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Galerie d'images */}
        <div className="space-y-4">
          <div className="aspect-w-4 aspect-h-3 bg-gray-100 rounded-lg overflow-hidden">
            {product.images && product.images.length > 0 ? (
              <img 
                src={product.images[activeImage]} 
                alt={product.name} 
                className="w-full h-full object-cover"
              />
            ) : product.imageUrl ? (
              <img 
                src={product.imageUrl} 
                alt={product.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <p>Aucune image disponible</p>
              </div>
            )}
          </div>
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-3 gap-2">
              {product.images.map((image: string, index: number) => (
                <div 
                  key={index}
                  className={`aspect-w-1 aspect-h-1 bg-gray-100 rounded-lg overflow-hidden cursor-pointer ${index === activeImage ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => setActiveImage(index)}
                >
                  <img 
                    src={image} 
                    alt={`${product.name} - Image ${index + 1}`} 
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Informations produit */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <p className="text-2xl font-bold text-primary">{product.price} €</p>
            <p className="text-gray-500 mt-1">Catégorie: {product.category}</p>
            {product.createdAt && (
              <p className="text-gray-500 mt-1">
                Publié le {
                  // Gérer les différents formats possibles de date
                  (() => {
                    try {
                      if (typeof product.createdAt === 'object' && product.createdAt !== null) {
                        // Format Firestore Timestamp
                        if ('seconds' in product.createdAt && typeof product.createdAt.seconds === 'number') {
                          return new Date(product.createdAt.seconds * 1000).toLocaleDateString();
                        }
                        // Format Date standard
                        if (product.createdAt instanceof Date) {
                          return product.createdAt.toLocaleDateString();
                        }
                      }
                      // Format string ou autre
                      return new Date(String(product.createdAt)).toLocaleDateString();
                    } catch (e) {
                      return 'Date inconnue';
                    }
                  })()
                }
              </p>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-gray-700">{product.description}</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Détails</h2>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex">
                <span className="font-medium mr-2">Stock:</span>
                <span className="text-gray-700">{product.stock || 'Non spécifié'}</span>
              </div>
              <div className="flex">
                <span className="font-medium mr-2">Vendeur:</span>
                <span className="text-gray-700">{product.vendorName || 'Non spécifié'}</span>
              </div>
            </div>
          </div>

          {/* Bouton de contact */}
          <div className="border-t pt-4 mt-6">
            <button
              onClick={async () => {
                if (!currentUser) {
                  toast.error("Vous devez être connecté pour contacter le vendeur");
                  return;
                }
                
                if (!product || !product.vendorId) {
                  toast.error("Impossible de contacter le vendeur");
                  return;
                }
                
                try {
                  setContactLoading(true);
                  
                  // Créer ou récupérer une conversation existante
                  const conversations = await messageService.getUserConversations(currentUser.uid);
                  let existingConversation = conversations.find(conv => 
                    conv.participants.includes(product.vendorId || '') && 
                    conv.productId === product.id
                  );
                  
                  if (!existingConversation) {
                    // Générer un ID temporaire pour la nouvelle conversation
                    const tempConversationId = `conv_${Date.now()}_${currentUser.uid}_${product.vendorId}`;
                    
                    // Créer un nouveau message pour initialiser la conversation
                    await messageService.sendMessage({
                      senderId: currentUser.uid,
                      senderName: currentUser.displayName || 'Utilisateur',
                      receiverId: product.vendorId,
                      receiverName: product.vendorName || 'Vendeur',
                      content: `Bonjour, je suis intéressé par votre produit "${product.name}".`,
                      conversationId: tempConversationId,
                      productId: product.id,
                      productName: product.name
                    });
                    
                    toast.success("Conversation créée avec le vendeur");
                  }
                  
                  // Rediriger vers la page de messagerie
                  navigate('/messages');
                  setContactLoading(false);
                } catch (error) {
                  console.error("Erreur lors de la création de la conversation:", error);
                  toast.error("Impossible de contacter le vendeur. Veuillez réessayer.");
                  setContactLoading(false);
                }
              }}
              className="btn-primary flex items-center w-full justify-center"
              disabled={contactLoading || !product?.vendorId}
            >
              {contactLoading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span> Chargement...
                </>
              ) : (
                <>
                  <FaComment className="mr-2" /> Contacter le vendeur
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
