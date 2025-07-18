import { useState, useEffect } from 'react';
import { messageService } from './messageService';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook personnalisé pour gérer les notifications de messages non lus
 */
export const useUnreadMessages = () => {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    let isMounted = true;
    
    const fetchUnreadMessages = async () => {
      if (!currentUser) {
        setUnreadCount(0);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Récupérer toutes les conversations de l'utilisateur
        const conversations = await messageService.getUserConversations(currentUser.uid);
        
        // Calculer le nombre total de messages non lus
        const totalUnread = conversations.reduce((total, conversation) => {
          return total + (conversation.unreadCount?.[currentUser.uid] || 0);
        }, 0);
        
        if (isMounted) {
          setUnreadCount(totalUnread);
          setLoading(false);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des messages non lus:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUnreadMessages();
    
    // Mettre à jour les messages non lus toutes les 30 secondes
    const intervalId = setInterval(fetchUnreadMessages, 30000);
    
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [currentUser]);

  return { unreadCount, loading };
};
