// Types importés de Firebase pour référence, mais nous utilisons nos propres implémentations
// Ces imports sont commentés pour éviter les erreurs de lint
// import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

import { v4 as uuidv4 } from 'uuid';

// Interface pour simuler un fichier stocké
interface StoredFile {
  id: string;
  name: string;
  path: string;
  url: string;
  contentType: string;
  size: number;
  createdAt: number;
}

// Stockage local des fichiers mockés
const getStoredFiles = (): StoredFile[] => {
  const storedFiles = localStorage.getItem('mockStorageFiles');
  if (storedFiles) {
    return JSON.parse(storedFiles);
  }
  return [];
};

// Sauvegarde des fichiers dans le localStorage
const saveStoredFiles = (files: StoredFile[]): void => {
  localStorage.setItem('mockStorageFiles', JSON.stringify(files));
};

// Génère une URL de données pour un fichier (base64)
const generateDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Mock pour la fonction ref de Firebase Storage
export const mockRef = (_storage: any, path: string) => {
  return {
    fullPath: path,
    name: path.split('/').pop() || '',
    bucket: 'mock-bucket'
  };
};

// Mock pour la fonction uploadBytesResumable de Firebase Storage
export const mockUploadBytesResumable = (storageRef: any, file: File) => {
  const id = uuidv4();
  const path = storageRef.fullPath;
  const fileName = path.split('/').pop() || '';
  
  // Créer un objet qui simule UploadTask
  const uploadTask = {
    snapshot: {
      ref: storageRef,
      bytesTransferred: 0,
      totalBytes: file.size,
      state: 'running',
      metadata: {
        name: fileName,
        contentType: file.type,
        size: file.size,
        fullPath: path
      }
    },
    
    on: (
      _event: string, 
      progressCallback?: (snapshot: any) => void,
      errorCallback?: (error: any) => void,
      completeCallback?: () => void
    ) => {
      // Simuler la progression du téléchargement
      const simulateProgress = async () => {
        try {
          // Simuler une progression de 0% à 100%
          for (let progress = 0; progress <= 100; progress += 10) {
            if (progressCallback) {
              uploadTask.snapshot.bytesTransferred = (progress / 100) * file.size;
              uploadTask.snapshot.state = progress < 100 ? 'running' : 'success';
              progressCallback(uploadTask.snapshot);
            }
            
            // Attendre un peu pour simuler le téléchargement
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          
          // Générer une URL de données pour le fichier
          const dataUrl = await generateDataUrl(file);
          
          // Stocker le fichier dans notre mock localStorage
          const storedFiles = getStoredFiles();
          const storedFile: StoredFile = {
            id,
            name: fileName,
            path,
            url: dataUrl,
            contentType: file.type,
            size: file.size,
            createdAt: Date.now()
          };
          
          storedFiles.push(storedFile);
          saveStoredFiles(storedFiles);
          
          // Appeler le callback de complétion
          if (completeCallback) {
            completeCallback();
          }
        } catch (error) {
          // En cas d'erreur, appeler le callback d'erreur
          if (errorCallback) {
            errorCallback(error);
          }
        }
      };
      
      // Démarrer la simulation de progression
      simulateProgress();
      
      // Retourner une fonction pour annuler le téléchargement (non implémentée)
      return () => {};
    }
  };
  
  return uploadTask;
};

// Mock pour la fonction getDownloadURL de Firebase Storage
export const mockGetDownloadURL = async (ref: any): Promise<string> => {
  const path = ref.fullPath;
  const storedFiles = getStoredFiles();
  const file = storedFiles.find(f => f.path === path);
  
  if (file) {
    return file.url;
  }
  
  // Si le fichier n'est pas trouvé, retourner une URL d'image placeholder
  const fileName = path.split('/').pop() || 'image';
  return `https://placehold.co/400x300?text=${fileName}`;
};

// Exporter un objet qui contient toutes les fonctions mockées
export const mockStorage = {
  ref: mockRef,
  uploadBytesResumable: mockUploadBytesResumable,
  getDownloadURL: mockGetDownloadURL
};
