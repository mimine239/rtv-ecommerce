// Types pour la messagerie
export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  receiverId: string;
  receiverName: string;
  content: string;
  timestamp: Date | string;
  read: boolean;
  conversationId: string; // ID de la conversation associée
  productId?: string; // ID du produit concerné, si applicable
  productName?: string; // Nom du produit concerné, si applicable
}

export interface Conversation {
  id: string;
  participants: string[]; // IDs des participants
  participantNames: Record<string, string>; // Mapping des IDs aux noms
  participantPhotos?: Record<string, string>; // Mapping des IDs aux photos
  lastMessage?: {
    content: string;
    timestamp: Date | string;
    senderId: string;
  };
  unreadCount: Record<string, number>; // Nombre de messages non lus par utilisateur
  createdAt: Date | string;
  updatedAt: Date | string;
  productId?: string; // ID du produit concerné, si applicable
  productName?: string; // Nom du produit concerné, si applicable
}
