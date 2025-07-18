import { useEffect } from 'react';
import { mockFirestore } from '../firebase/mockFirestore';
import toast from 'react-hot-toast';

/**
 * Composant qui nettoie les données d'exemple au démarrage de l'application
 * Ce composant ne rend rien visuellement, il effectue uniquement des opérations de nettoyage
 */
const CleanupService = () => {

  useEffect(() => {
    // Nettoyer les produits d'exemple du localStorage
    const cleanupData = async () => {
      try {
        await mockFirestore.clearMockProducts();
        // Supprimer également d'autres données potentiellement obsolètes
        localStorage.removeItem('exampleProducts');
        localStorage.removeItem('tempProducts');
        
        console.log('Nettoyage des données d\'exemple terminé');
        
        // Notifier l'utilisateur uniquement la première fois
        if (!localStorage.getItem('cleanupNotified')) {
          toast.success('Les produits d\'exemple ont été supprimés');
          // Marquer comme nettoyé dans le localStorage pour éviter de montrer plusieurs fois la notification
          localStorage.setItem('exampleProductsCleaned', 'true');
        }
        
      } catch (error) {
        console.error('Erreur lors du nettoyage des données:', error);
        toast.error('Erreur lors du nettoyage des données');
      }
    };
    
    cleanupData();
  }, []);
  
  // Ce composant ne rend rien
  return null;
};

export default CleanupService;
