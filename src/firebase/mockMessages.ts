// Types pour les messages et conversations
import type { Message, Conversation } from '../types/message';

// Données mockées pour les messages et conversations
const mockMessages: Message[] = [];
const mockConversations: Conversation[] = [];

// Fonction pour obtenir les messages du localStorage ou initialiser avec les données mockées
export const getStoredMessages = (): Message[] => {
  const storedMessages = localStorage.getItem('mockMessages');
  if (storedMessages) {
    return JSON.parse(storedMessages);
  }
  
  // Initialiser avec les données mockées
  localStorage.setItem('mockMessages', JSON.stringify(mockMessages));
  return mockMessages;
};

// Fonction pour sauvegarder les messages dans le localStorage
export const saveMessages = (messages: Message[]): void => {
  localStorage.setItem('mockMessages', JSON.stringify(messages));
};

// Fonction pour obtenir les conversations du localStorage ou initialiser avec les données mockées
export const getStoredConversations = (): Conversation[] => {
  const storedConversations = localStorage.getItem('mockConversations');
  if (storedConversations) {
    return JSON.parse(storedConversations);
  }
  
  // Initialiser avec les données mockées
  localStorage.setItem('mockConversations', JSON.stringify(mockConversations));
  return mockConversations;
};

// Fonction pour sauvegarder les conversations dans le localStorage
export const saveConversations = (conversations: Conversation[]): void => {
  localStorage.setItem('mockConversations', JSON.stringify(conversations));
};

// Fonction pour ajouter un message
export const addMessage = (message: Omit<Message, 'id'>): Message => {
  const messages = getStoredMessages();
  const newMessage = {
    id: `msg-${Date.now()}`,
    ...message,
    timestamp: new Date(),
    read: false
  };
  
  messages.push(newMessage);
  saveMessages(messages);
  
  return newMessage;
};

// Fonction pour créer ou mettre à jour une conversation
export const createOrUpdateConversation = (
  senderId: string, 
  senderName: string, 
  receiverId: string, 
  receiverName: string,
  message: Message,
  productId?: string,
  productName?: string
): Conversation => {
  const conversations = getStoredConversations();
  
  // Vérifier si une conversation existe déjà entre ces utilisateurs
  let conversation = conversations.find(conv => 
    conv.participants.includes(senderId) && 
    conv.participants.includes(receiverId)
  );
  
  if (!conversation) {
    // Créer une nouvelle conversation
    const now = new Date();
    conversation = {
      id: `conv-${Date.now()}`,
      participants: [senderId, receiverId],
      participantNames: {
        [senderId]: senderName,
        [receiverId]: receiverName
      },
      lastMessage: {
        content: message.content,
        timestamp: message.timestamp,
        senderId: senderId
      },
      unreadCount: {
        [senderId]: 0,
        [receiverId]: 1
      },
      createdAt: now,
      updatedAt: now,
      productId,
      productName
    };
    
    conversations.push(conversation);
  } else {
    // Mettre à jour la conversation existante
    conversation.lastMessage = {
      content: message.content,
      timestamp: message.timestamp,
      senderId: senderId
    };
    
    // Incrémenter le compteur de messages non lus pour le destinataire
    conversation.unreadCount[receiverId] = 
      (conversation.unreadCount[receiverId] || 0) + 1;
      
    // Mettre à jour la date de mise à jour
    conversation.updatedAt = new Date();
      
    // Mettre à jour la conversation dans le tableau
    const index = conversations.findIndex(conv => conv.id === conversation!.id);
    if (index !== -1) {
      conversations[index] = conversation;
    }
  }
  
  saveConversations(conversations);
  
  return conversation;
};

// Fonction pour marquer les messages comme lus
export const markMessagesAsRead = (conversationId: string, userId: string): void => {
  const conversations = getStoredConversations();
  const messages = getStoredMessages();
  
  // Trouver la conversation
  const conversationIndex = conversations.findIndex(conv => conv.id === conversationId);
  if (conversationIndex === -1) {
    return;
  }
  
  // Mettre à jour le compteur de messages non lus
  conversations[conversationIndex].unreadCount[userId] = 0;
  saveConversations(conversations);
  
  // Marquer les messages comme lus
  const updatedMessages = messages.map(msg => {
    if (msg.receiverId === userId && !msg.read) {
      return { ...msg, read: true };
    }
    return msg;
  });
  
  saveMessages(updatedMessages);
};

// Fonction pour obtenir les conversations d'un utilisateur
export const getUserConversations = (userId: string): Conversation[] => {
  const conversations = getStoredConversations();
  return conversations.filter(conv => conv.participants.includes(userId));
};

// Fonction pour obtenir les messages d'une conversation
export const getConversationMessages = (conversationId: string): Message[] => {
  const messages = getStoredMessages();
  const conversations = getStoredConversations();
  
  // Trouver la conversation
  const conversation = conversations.find(conv => conv.id === conversationId);
  if (!conversation) {
    return [];
  }
  
  // Filtrer les messages entre ces participants
  return messages.filter(msg => 
    conversation.participants.includes(msg.senderId) && 
    conversation.participants.includes(msg.receiverId)
  ).sort((a, b) => {
    const dateA = a.timestamp instanceof Date ? a.timestamp : new Date(a.timestamp);
    const dateB = b.timestamp instanceof Date ? b.timestamp : new Date(b.timestamp);
    return dateA.getTime() - dateB.getTime();
  });
};

// Exporter un objet qui contient toutes les fonctions mockées pour les messages
export const mockMessageService = {
  getStoredMessages,
  saveMessages,
  getStoredConversations,
  saveConversations,
  addMessage,
  createOrUpdateConversation,
  markMessagesAsRead,
  getUserConversations,
  getConversationMessages
};
