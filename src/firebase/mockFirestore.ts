// Types importés de Firebase pour référence, mais nous utilisons nos propres implémentations
// Ces imports sont commentés pour éviter les erreurs de lint
// import { collection, query, where, getDocs, doc, deleteDoc, addDoc, updateDoc } from 'firebase/firestore';

// Types pour les produits - importé depuis types/index.ts pour assurer la cohérence
import type { Product } from '../types/index';

// Données de produits mockées - tableau vide par défaut
const mockProducts: Product[] = [];

// Fonction pour obtenir les produits du localStorage ou initialiser avec les données mockées
const getStoredProducts = (): Product[] => {
  const storedProducts = localStorage.getItem('mockProducts');
  if (storedProducts) {
    return JSON.parse(storedProducts);
  }
  
  // Initialiser avec les données mockées
  localStorage.setItem('mockProducts', JSON.stringify(mockProducts));
  return mockProducts;
};

// Fonction pour sauvegarder les produits dans le localStorage
const saveProducts = (products: Product[]): void => {
  localStorage.setItem('mockProducts', JSON.stringify(products));
};

// Mock pour la fonction collection de Firestore
export const mockCollection = () => {
  return {
    type: 'collection',
    path: 'products'
  };
};

// Mock pour la fonction query de Firestore
export const mockQuery = (collectionRef: any, whereClause: any) => {
  return {
    type: 'query',
    collection: collectionRef,
    where: whereClause
  };
};

// Mock pour la fonction where de Firestore
export const mockWhere = (field: string, operator: string, value: any) => {
  return {
    type: 'where',
    field,
    operator,
    value
  };
};

// Mock pour la fonction getDocs de Firestore
export const mockGetDocs = async (queryRef: any) => {
  const products = getStoredProducts();
  
  // Filtrer les produits en fonction de la clause where
  let filteredProducts = [...products];
  
  if (queryRef.where && queryRef.where.type === 'where') {
    const { field, operator, value } = queryRef.where;
    
    if (operator === '==') {
      filteredProducts = products.filter(product => {
        // Utiliser une vérification de type sécurisée
        return field in product && product[field as keyof Product] === value;
      });
    }
  }
  
  // Créer un objet qui ressemble à un QuerySnapshot de Firestore
  return {
    forEach: (callback: (doc: any) => void) => {
      filteredProducts.forEach(product => {
        callback({
          id: product.id,
          data: () => {
            const { id, ...data } = product;
            return data;
          }
        });
      });
    },
    docs: filteredProducts.map(product => ({
      id: product.id,
      data: () => {
        const { id, ...data } = product;
        return data;
      }
    }))
  };
};

// Mock pour la fonction doc de Firestore
export const mockDoc = (_db: any, collection: string, id: string) => {
  return {
    type: 'doc',
    collection,
    id
  };
};

// Mock pour la fonction deleteDoc de Firestore
export const mockDeleteDoc = async (docRef: any) => {
  console.log('mockDeleteDoc appelé avec:', docRef);
  
  if (!docRef || !docRef.id) {
    console.error('Erreur: docRef ou docRef.id est undefined', docRef);
    return Promise.reject(new Error('ID de document invalide'));
  }
  
  const products = getStoredProducts();
  console.log('Produits avant suppression:', products.length);
  
  // Vérifier si le produit existe avant de le supprimer
  const productToDelete = products.find(product => product.id === docRef.id);
  if (!productToDelete) {
    console.error(`Produit avec ID ${docRef.id} non trouvé`);
    return Promise.reject(new Error(`Produit avec ID ${docRef.id} non trouvé`));
  }
  
  const updatedProducts = products.filter(product => product.id !== docRef.id);
  console.log('Produits après suppression:', updatedProducts.length);
  
  // Sauvegarder les produits mis à jour
  saveProducts(updatedProducts);
  
  return Promise.resolve();
};

// Mock pour la fonction addDoc de Firestore
export const mockAddDoc = async (_collectionRef: any, data: any) => {
  const products = getStoredProducts();
  const newProduct = {
    id: `prod-${Date.now()}`,
    ...data
  };
  
  products.push(newProduct);
  saveProducts(products);
  
  return {
    id: newProduct.id
  };
};

// Mock pour la fonction updateDoc de Firestore
export const mockUpdateDoc = async (docRef: any, data: any) => {
  const products = getStoredProducts();
  const index = products.findIndex(product => product.id === docRef.id);
  
  if (index !== -1) {
    products[index] = {
      ...products[index],
      ...data
    };
    saveProducts(products);
  }
  
  return Promise.resolve();
};

// Fonction pour associer le vendorId aux produits mockés en fonction de l'utilisateur connecté
export const associateVendorIdToMockProducts = (userId: string) => {
  const products = getStoredProducts();
  const updatedProducts = products.map(product => ({
    ...product,
    vendorId: userId
  }));
  saveProducts(updatedProducts);
};

// Fonction pour nettoyer complètement le localStorage des produits d'exemple
export const clearMockProducts = () => {
  localStorage.removeItem('mockProducts');
  saveProducts([]);
  console.log('Tous les produits mockés ont été supprimés');
  return Promise.resolve();
};

// Fonction pour obtenir directement les produits mockés
export const getProducts = (): Product[] => {
  return getStoredProducts();
};

// Exporter un objet qui contient toutes les fonctions mockées
export const mockFirestore = {
  collection: mockCollection,
  query: mockQuery,
  where: mockWhere,
  getDocs: mockGetDocs,
  doc: mockDoc,
  deleteDoc: mockDeleteDoc,
  addDoc: mockAddDoc,
  updateDoc: mockUpdateDoc,
  associateVendorIdToMockProducts,
  clearMockProducts,
  getProducts // Ajout de la méthode getProducts
};

// Note: Les variables db et collectionRef ne sont pas utilisées dans ce fichier
// car nous implémentons des mocks qui n'ont pas besoin de ces références
