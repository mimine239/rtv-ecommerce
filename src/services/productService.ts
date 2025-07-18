import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where,
  orderBy,
  limit,
  startAfter,
} from 'firebase/firestore';
import type { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase/config';
import type { Product } from '../types/index';
import { mockFirestore } from '../firebase/mockFirestore';
import { mockStorage } from '../firebase/mockStorage';

// Flag pour utiliser les mocks
export const USE_MOCK_FIRESTORE = false;
export const USE_MOCK_STORAGE = false;

/**
 * Service pour gérer les produits dans Firestore
 */
export const productService = {
  /**
   * Ajouter un nouveau produit
   * @param product - Les données du produit
   * @returns L'ID du produit créé
   */
  addProduct: async (product: Omit<Product, 'id'>): Promise<string> => {
    try {
      // Si une seule image est fournie via imageUrl, l'utiliser
      const productData = {
        ...product,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      if (USE_MOCK_FIRESTORE) {
        // Utiliser le mock Firestore
        const collectionRef = mockFirestore.collection();
        const docRef = await mockFirestore.addDoc(collectionRef, productData);
        return docRef.id;
      } else {
        // Utiliser Firestore réel
        const docRef = await addDoc(collection(db, 'products'), productData);
        return docRef.id;
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout du produit:", error);
      throw error;
    }
  },

  /**
   * Supprimer un produit existant
   * @param productId - L'ID du produit à supprimer
   */
  deleteProduct: async (productId: string): Promise<void> => {
    try {
      console.log('Début de la suppression du produit dans le service:', productId);
      console.log('Mode mock Firestore:', USE_MOCK_FIRESTORE);
      
      if (USE_MOCK_FIRESTORE) {
        // Utiliser le mock Firestore
        console.log('Utilisation de mockFirestore pour la suppression');
        
        // Vérifier si le produit existe dans le mock
        const mockProducts = mockFirestore.getProducts();
        const productExists = mockProducts.some(p => p.id === productId);
        
        if (!productExists) {
          console.error('Produit non trouvé dans le mock:', productId);
          throw new Error('Produit non trouvé');
        }
        
        // Créer une référence de document pour mockFirestore
        const docRef = mockFirestore.doc(null, 'products', productId);
        console.log('Référence du document à supprimer:', docRef);
        
        // Supprimer le document
        await mockFirestore.deleteDoc(docRef);
        console.log('Document supprimé avec succès dans mockFirestore');
      } else {
        // Utiliser Firestore réel
        console.log('Utilisation de Firestore réel pour la suppression');
        const productRef = doc(db, 'products', productId);
        const productSnapshot = await getDoc(productRef);
        
        if (!productSnapshot.exists()) {
          console.error('Produit non trouvé dans Firestore:', productId);
          throw new Error('Produit non trouvé');
        }
        
        const productData = productSnapshot.data() as Product;
        
        // Supprimer les images associées au produit
        if (productData.images && productData.images.length > 0) {
          await Promise.all(
            productData.images.map(async (imageUrl) => {
              try {
                const imageRef = ref(storage, imageUrl);
                await deleteObject(imageRef);
              } catch (error) {
                console.warn('Erreur lors de la suppression de l\'image:', error);
                // Continue même si la suppression d'une image échoue
              }
            })
          );
        }
        
        // Supprimer le document produit
        await deleteDoc(productRef);
        console.log('Document supprimé avec succès dans Firestore réel');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du produit:', error);
      throw error;
    }
  },

  /**
   * Mettre à jour un produit existant
   * @param productId - L'ID du produit à mettre à jour
   * @param productData - Les nouvelles données du produit
   * @param newImages - Nouvelles images à ajouter (optionnel)
   */
  updateProduct: async (
    productId: string,
    productData: Partial<Omit<Product, 'id'>>,
    newImages?: File[]
  ): Promise<void> => {
    try {
      if (USE_MOCK_FIRESTORE) {
        // Utiliser le mock Firestore
        const mockProducts = mockFirestore.getProducts();
        const productIndex = mockProducts.findIndex(p => p.id === productId);
        
        if (productIndex === -1) {
          throw new Error('Produit non trouvé');
        }
        
        const currentProduct = mockProducts[productIndex];
        let updatedImageUrls = currentProduct.images || [];
        
        // Si de nouvelles images sont fournies, les uploader avec le mock storage
        if (newImages && newImages.length > 0 && USE_MOCK_STORAGE) {
          const newImageUrls = await Promise.all(
            newImages.map(async (image) => {
              const storageRef = mockStorage.ref(null, `products/${Date.now()}_${image.name}`);
              const uploadTask = mockStorage.uploadBytesResumable(storageRef, image);
              
              return new Promise<string>((resolve) => {
                uploadTask.on(
                  'state_changed',
                  undefined,
                  undefined,
                  async () => {
                    const downloadUrl = await mockStorage.getDownloadURL(storageRef);
                    resolve(downloadUrl);
                  }
                );
              });
            })
          );
          updatedImageUrls = [...updatedImageUrls, ...newImageUrls];
        }
        
        await mockFirestore.updateDoc({ id: productId }, {
          ...productData,
          images: updatedImageUrls,
          updatedAt: new Date()
        });
      } else {
        // Utiliser Firestore réel
        const productRef = doc(db, 'products', productId);
        const productSnapshot = await getDoc(productRef);
        
        if (!productSnapshot.exists()) {
          throw new Error('Produit non trouvé');
        }
        
        const currentProduct = productSnapshot.data() as Product;
        let updatedImageUrls = currentProduct.images || [];
        
        // Si de nouvelles images sont fournies, les uploader
        if (newImages && newImages.length > 0) {
          const newImageUrls = await Promise.all(
            newImages.map(async (image) => {
              const storageRef = ref(storage, `products/${Date.now()}_${image.name}`);
              await uploadBytes(storageRef, image);
              return await getDownloadURL(storageRef);
            })
          );
          updatedImageUrls = [...updatedImageUrls, ...newImageUrls];
        }
        
        // Mettre à jour le document produit
        await updateDoc(productRef, {
          ...productData,
          images: updatedImageUrls,
          updatedAt: new Date()
        });
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du produit:', error);
      throw error;
    }
  },

  /**
   * Obtenir un produit par son ID
   * @param productId - L'ID du produit à récupérer
   * @returns Le produit correspondant à l'ID
   */
  getProductById: async (productId: string): Promise<Product> => {
    try {
      if (USE_MOCK_FIRESTORE) {
        // Utiliser le mock Firestore
        const mockProducts = mockFirestore.getProducts();
        const product = mockProducts.find(p => p.id === productId);
        
        if (!product) {
          throw new Error('Produit non trouvé');
        }
        
        return product;
      } else {
        // Utiliser Firestore réel
        const productRef = doc(db, 'products', productId);
        const productSnapshot = await getDoc(productRef);
        
        if (!productSnapshot.exists()) {
          throw new Error('Produit non trouvé');
        }
        
        return { id: productSnapshot.id, ...productSnapshot.data() } as Product;
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du produit:', error);
      throw error;
    }
  },

  /**
   * Obtenir tous les produits avec pagination
   * @param category - Catégorie pour filtrer les produits (optionnel)
   * @param lastVisible - Dernier document visible pour la pagination (optionnel)
   * @param itemsPerPage - Nombre d'éléments par page
   * @param featured - Filtrer par produits en vedette
   * @returns Les produits, le dernier document et s'il y a plus de résultats
   */
  getProducts: async (
    category?: string,
    lastVisible?: QueryDocumentSnapshot<DocumentData>,
    itemsPerPage: number = 12,
    featured: boolean = false
  ) => {
    try {
      if (USE_MOCK_FIRESTORE) {
        // Utiliser le mock Firestore
        const mockProducts = mockFirestore.getProducts();
        let filteredProducts = [...mockProducts];
        
        // Appliquer les filtres
        if (category) {
          filteredProducts = filteredProducts.filter((p: any) => p.category === category);
        }
        
        if (featured) {
          filteredProducts = filteredProducts.filter((p: any) => p.featured === true);
        }
        
        // Trier par date de création décroissante
        filteredProducts.sort((a: any, b: any) => {
          const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
          const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
          return dateB.getTime() - dateA.getTime();
        });
        
        // Pagination
        const startIndex = lastVisible ? mockProducts.findIndex((p: any) => p.id === lastVisible.id) + 1 : 0;
        const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);
        
        return {
          products: paginatedProducts,
          lastDoc: paginatedProducts.length > 0 ? { id: paginatedProducts[paginatedProducts.length - 1].id } : null,
          hasMore: startIndex + itemsPerPage < filteredProducts.length
        };
      } else {
        // Utiliser Firestore réel
        let productsQuery = collection(db, 'products');
        let constraints = [];
        
        if (category) {
          constraints.push(where('category', '==', category));
        }
        
        if (featured) {
          constraints.push(where('featured', '==', true));
        }
        
        constraints.push(orderBy('createdAt', 'desc'));
        
        if (lastVisible) {
          constraints.push(startAfter(lastVisible));
        }
        
        constraints.push(limit(itemsPerPage));
        
        const q = query(productsQuery, ...constraints);
        const querySnapshot = await getDocs(q);
        
        const products: Product[] = [];
        querySnapshot.forEach((doc) => {
          products.push({ id: doc.id, ...doc.data() } as Product);
        });
        
        const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
        
        return {
          products,
          lastDoc,
          hasMore: querySnapshot.docs.length === itemsPerPage
        };
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des produits:', error);
      throw error;
    }
  },

  /**
   * Obtenir les produits d'un vendeur spécifique
   * @param sellerId - L'ID du vendeur
   * @returns Les produits du vendeur
   */
  getSellerProducts: async (sellerId: string): Promise<Product[]> => {
    try {
      if (USE_MOCK_FIRESTORE) {
        // Utiliser le mock Firestore
        const mockProducts = mockFirestore.getProducts();
        const sellerProducts = mockProducts.filter((p: any) => p.vendorId === sellerId);
        
        // Trier par date de création décroissante
        sellerProducts.sort((a: any, b: any) => {
          const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
          const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
          return dateB.getTime() - dateA.getTime();
        });
        
        return sellerProducts;
      } else {
        // Utiliser Firestore réel
        const q = query(
          collection(db, 'products'),
          where('vendorId', '==', sellerId),
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        
        const products: Product[] = [];
        querySnapshot.forEach((doc) => {
          products.push({ id: doc.id, ...doc.data() } as Product);
        });
        
        return products;
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des produits du vendeur:', error);
      throw error;
    }
  }
};
