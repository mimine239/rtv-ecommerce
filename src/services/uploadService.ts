import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/config';
import { v4 as uuidv4 } from 'uuid';
import { mockStorage } from '../firebase/mockStorage';

// Flag pour utiliser le mock de Firebase Storage
const USE_MOCK_STORAGE = true;

/**
 * Service pour gérer le téléchargement d'images vers Firebase Storage
 */
export const uploadService = {
  /**
   * Télécharge une image vers Firebase Storage
   * @param file - Le fichier à télécharger
   * @param path - Le chemin dans Firebase Storage (ex: 'products', 'banners')
   * @param onProgress - Callback pour suivre la progression du téléchargement
   * @returns Promise avec l'URL de téléchargement
   */
  uploadImage: async (
    file: File, 
    path: string = 'products',
    onProgress?: (progress: number) => void
  ): Promise<string> => {
    try {
      // Générer un nom de fichier unique
      const fileExtension = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExtension}`;
      
      let storageRef;
      let uploadTask;
      
      if (USE_MOCK_STORAGE) {
        // Utiliser le mock de Firebase Storage
        storageRef = mockStorage.ref(null, `${path}/${fileName}`);
        uploadTask = mockStorage.uploadBytesResumable(storageRef, file);
      } else {
        // Utiliser Firebase Storage réel
        storageRef = ref(storage, `${path}/${fileName}`);
        uploadTask = uploadBytesResumable(storageRef, file);
      }
      
      // Retourner une promesse qui se résout avec l'URL de téléchargement
      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            // Calculer et rapporter la progression
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            if (onProgress) {
              onProgress(progress);
            }
          },
          (error) => {
            // Gérer les erreurs
            console.error('Erreur de téléchargement:', error);
            reject(error);
          },
          async () => {
            try {
              // Téléchargement terminé, obtenir l'URL
              let downloadURL;
              
              if (USE_MOCK_STORAGE) {
                // Utiliser le mock pour obtenir l'URL
                downloadURL = await mockStorage.getDownloadURL(uploadTask.snapshot.ref);
              } else {
                // Utiliser Firebase Storage réel
                downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              }
              
              resolve(downloadURL);
            } catch (error) {
              console.error('Erreur lors de la récupération de l\'URL:', error);
              reject(error);
            }
          }
        );
      });
    } catch (error) {
      console.error('Erreur lors du téléchargement de l\'image:', error);
      throw error;
    }
  },
  
  /**
   * Télécharge plusieurs images vers Firebase Storage
   * @param files - Les fichiers à télécharger
   * @param path - Le chemin dans Firebase Storage
   * @returns Promise avec un tableau d'URLs de téléchargement
   */
  uploadMultipleImages: async (
    files: File[], 
    path: string = 'products'
  ): Promise<string[]> => {
    try {
      const uploadPromises = files.map(file => 
        uploadService.uploadImage(file, path)
      );
      
      return Promise.all(uploadPromises);
    } catch (error) {
      console.error('Erreur lors du téléchargement multiple d\'images:', error);
      throw error;
    }
  }
};

export default uploadService;
