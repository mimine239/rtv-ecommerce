import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDocs, 
  query, 
  where,
  orderBy,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Message, Conversation } from '../types/message';
import { USE_MOCK_FIRESTORE } from './productService';
import { mockMessageService } from '../firebase/mockMessages';

/**
 * Service pour gérer les messages et conversations
 */
export const messageService = {
  /**
   * Envoyer un nouveau message
   */
  sendMessage: async (message: Omit<Message, 'id' | 'timestamp' | 'read'>): Promise<string> => {
    try {
      if (USE_MOCK_FIRESTORE) {
        // Utiliser le mock
        // Ajouter les propriétés manquantes pour correspondre au type attendu par mockMessageService.addMessage
        const messageWithRequiredProps = {
          ...message,
          timestamp: new Date(),
          read: false
        };
        
        const newMessage = mockMessageService.addMessage(messageWithRequiredProps);
        
        // Créer ou mettre à jour la conversation
        mockMessageService.createOrUpdateConversation(
          message.senderId,
          message.senderName,
          message.receiverId,
          message.receiverName,
          newMessage,
          message.productId,
          message.productName
        );
        
        return newMessage.id;
      } else {
        // Utiliser Firestore réel
        const messageData = {
          ...message,
          timestamp: serverTimestamp(),
          read: false,
          conversationId: ''
        };
        
        // Ajouter le message à Firestore
        const messagesCollection = collection(db, 'messages');
        const docRef = await addDoc(messagesCollection, messageData);
        
        // Vérifier si une conversation existe déjà entre ces utilisateurs
        const conversationsRef = collection(db, 'conversations');
        const q = query(
          conversationsRef, 
          where('participants', 'array-contains', message.senderId)
        );
        
        const querySnapshot = await getDocs(q);
        let conversation: Conversation | null = null;
        
        querySnapshot.forEach((docSnapshot) => {
          const data = docSnapshot.data();
          if (data && data.participants && Array.isArray(data.participants) && data.participants.includes(message.receiverId)) {
            conversation = { 
              id: docSnapshot.id, 
              ...data,
              participants: data.participants || [],
              unreadCount: data.unreadCount || {},
              participantNames: data.participantNames || {},
              lastMessage: data.lastMessage || { content: '', timestamp: new Date(), senderId: '' },
              createdAt: new Date(),
              updatedAt: new Date()
            } as Conversation;
          }
        });
        
        // Créer une nouvelle conversation ou mettre à jour une existante
        let newConversationId = '';
        
        if (!conversation) {
          // Créer une nouvelle conversation
          // Utiliser Record<string, any> pour éviter les erreurs TypeScript avec les index dynamiques
          const conversationData: Record<string, any> = {
            participants: [message.senderId, message.receiverId],
            participantNames: {} as Record<string, string>,
            lastMessage: {
              content: message.content,
              timestamp: serverTimestamp(),
              senderId: message.senderId
            },
            unreadCount: {} as Record<string, number>,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            productId: message.productId,
            productName: message.productName
          };
          
          // Ajouter les noms des participants de manière sécurisée
          if (typeof message.senderId === 'string') {
            conversationData.participantNames[message.senderId] = message.senderName;
          }
          if (typeof message.receiverId === 'string') {
            conversationData.participantNames[message.receiverId] = message.receiverName;
          }
          
          // Initialiser les compteurs de messages non lus
          if (typeof message.senderId === 'string') {
            conversationData.unreadCount[message.senderId] = 0;
          }
          if (typeof message.receiverId === 'string') {
            conversationData.unreadCount[message.receiverId] = 1;
          }
          
          const newConversationRef = await addDoc(collection(db, 'conversations'), conversationData);
          newConversationId = newConversationRef.id;
          
          // Créer un objet conversation typé pour éviter les erreurs TypeScript
          conversation = {
            id: newConversationId,
            participants: [message.senderId, message.receiverId],
            participantNames: {
              [message.senderId]: message.senderName,
              [message.receiverId]: message.receiverName
            },
            lastMessage: {
              content: message.content,
              timestamp: new Date(), // Utiliser Date() au lieu de serverTimestamp() pour le typage
              senderId: message.senderId
            },
            unreadCount: {
              [message.senderId]: 0,
              [message.receiverId]: 1
            },
            createdAt: new Date(),
            updatedAt: new Date(),
            productId: message.productId || '',
            productName: message.productName || ''
          } as Conversation;
        } else {
          // Mettre à jour la conversation existante
          if (conversation && typeof conversation === 'object' && 'id' in conversation && 'unreadCount' in conversation) {
            const conversationRef = doc(db, 'conversations', (conversation as any).id);
            
            // Mettre à jour la conversation avec les nouvelles informations
            const unreadCount = (conversation as any).unreadCount as Record<string, number> || {};
            const currentUnreadCount = typeof message.receiverId === 'string' ? (unreadCount[message.receiverId] || 0) : 0;
            
            await updateDoc(conversationRef, {
              lastMessage: {
                content: message.content,
                timestamp: serverTimestamp(),
                senderId: message.senderId
              },
              [`unreadCount.${message.receiverId}`]: currentUnreadCount + 1,
              updatedAt: serverTimestamp()
            });
          }
        }
        
        // Mettre à jour le message avec l'id de la conversation
        if (conversation && typeof conversation === 'object' && 'id' in conversation) {
          const messageRef = doc(db, 'messages', docRef.id);
          await updateDoc(messageRef, {
            conversationId: conversation.id
          });
        }
        
        return docRef.id;
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
      throw error;
    }
  },
  
  /**
   * Récupérer les conversations d'un utilisateur
   */
  getUserConversations: async (userId: string): Promise<Conversation[]> => {
    try {
      if (USE_MOCK_FIRESTORE) {
        // Utiliser le mock
        return mockMessageService.getUserConversations(userId);
      } else {
        // Utiliser Firestore réel
        const conversationsRef = collection(db, 'conversations');
        const q = query(conversationsRef, where('participants', 'array-contains', userId));
        const querySnapshot = await getDocs(q);
        
        const conversations: Conversation[] = [];
        querySnapshot.forEach((docSnapshot) => {
          const data = docSnapshot.data();
          conversations.push({ 
            id: docSnapshot.id, 
            ...data,
            participants: data.participants || [],
            unreadCount: data.unreadCount || {},
            participantNames: data.participantNames || {},
            lastMessage: data.lastMessage || { content: '', timestamp: new Date(), senderId: '' },
            createdAt: data.createdAt || new Date(),
            updatedAt: data.updatedAt || new Date()
          } as Conversation);
        });
        
        // Trier par date de mise à jour (plus récent en premier)
        return conversations.sort((a, b) => {
          let dateA: Date;
          let dateB: Date;
          
          // Conversion sécurisée des dates
          dateA = a.updatedAt instanceof Date ? a.updatedAt : new Date(a.updatedAt || 0);
          dateB = b.updatedAt instanceof Date ? b.updatedAt : new Date(b.updatedAt || 0);
          
          return dateB.getTime() - dateA.getTime();
        });
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des conversations:', error);
      throw error;
    }
  },
  
  /**
   * Récupérer les messages d'une conversation
   */
  getConversationMessages: async (conversationId: string): Promise<Message[]> => {
    try {
      if (USE_MOCK_FIRESTORE) {
        // Utiliser le mock
        return mockMessageService.getConversationMessages(conversationId);
      } else {
        // Utiliser Firestore réel
        const messagesRef = collection(db, 'messages');
        
        // Requête pour obtenir les messages de la conversation
        const q = query(
          messagesRef,
          where('conversationId', '==', conversationId),
          orderBy('timestamp', 'asc')
        );
        
        const querySnapshot = await getDocs(q);
        const messages: Message[] = [];
        
        querySnapshot.forEach((docSnapshot) => {
          const data = docSnapshot.data();
          messages.push({ 
            id: docSnapshot.id, 
            ...data,
            senderId: data.senderId || '',
            senderName: data.senderName || '',
            receiverId: data.receiverId || '',
            receiverName: data.receiverName || '',
            content: data.content || '',
            timestamp: data.timestamp || new Date(),
            read: data.read || false,
            conversationId: data.conversationId || ''
          } as Message);
        });
        
        return messages;
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des messages:", error);
      throw error;
    }
  },
  
  /**
   * Marquer les messages comme lus
   */
  markMessagesAsRead: async (conversationId: string, userId: string): Promise<void> => {
    try {
      if (USE_MOCK_FIRESTORE) {
        // Utiliser le mock
        mockMessageService.markMessagesAsRead(conversationId, userId);
      } else {
        // Utiliser Firestore réel
        const conversationRef = doc(db, 'conversations', conversationId);
        
        // Mettre à jour le compteur de messages non lus
        await updateDoc(conversationRef, {
          [`unreadCount.${userId}`]: 0
        });
        
        // Récupérer les messages non lus
        const messagesRef = collection(db, 'messages');
        const q = query(
          messagesRef,
          where('conversationId', '==', conversationId),
          where('receiverId', '==', userId),
          where('read', '==', false)
        );
        
        const querySnapshot = await getDocs(q);
        
        // Marquer chaque message comme lu
        const batch = writeBatch(db);
        querySnapshot.forEach((docSnapshot) => {
          batch.update(docSnapshot.ref, { read: true });
        });
        
        await batch.commit();
      }
    } catch (error) {
      console.error("Erreur lors du marquage des messages comme lus:", error);
      throw error;
    }
  }
};
