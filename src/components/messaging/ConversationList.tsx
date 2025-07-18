import React from 'react';
import type { Conversation } from '../../types/message';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { FaCircle, FaSpinner } from 'react-icons/fa';

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId: string | undefined;
  onSelectConversation: (conversation: Conversation) => void;
  currentUserId: string;
  loading: boolean;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedConversationId,
  onSelectConversation,
  currentUserId,
  loading
}) => {
  // Formater la date relative (il y a X minutes, heures, etc.)
  const formatRelativeTime = (timestamp: Date | string) => {
    if (!timestamp) return '';
    
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    
    try {
      return formatDistanceToNow(date, { addSuffix: true, locale: fr });
    } catch (error) {
      console.error('Erreur de formatage de date:', error);
      return 'Date inconnue';
    }
  };

  // Obtenir le nom de l'autre participant
  const getOtherParticipantName = (conversation: Conversation) => {
    const otherParticipantId = conversation.participants.find(id => id !== currentUserId);
    return otherParticipantId ? conversation.participantNames[otherParticipantId] : 'Utilisateur inconnu';
  };

  // Vérifier s'il y a des messages non lus
  const hasUnreadMessages = (conversation: Conversation) => {
    return (conversation.unreadCount[currentUserId] || 0) > 0;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full p-4">
        <FaSpinner className="animate-spin text-primary text-2xl" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>Aucune conversation</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {conversations.map(conversation => (
        <div
          key={conversation.id}
          className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
            selectedConversationId === conversation.id ? 'bg-gray-100' : ''
          }`}
          onClick={() => onSelectConversation(conversation)}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center">
                <h3 className={`font-medium ${hasUnreadMessages(conversation) ? 'font-bold' : ''}`}>
                  {getOtherParticipantName(conversation)}
                </h3>
                {hasUnreadMessages(conversation) && (
                  <FaCircle className="text-primary ml-2 text-xs" />
                )}
              </div>
              
              {conversation.productName && (
                <p className="text-xs text-gray-500 mt-1">
                  Produit: {conversation.productName}
                </p>
              )}
              
              {conversation.lastMessage && (
                <p className="text-sm text-gray-600 mt-1 truncate">
                  {conversation.lastMessage.senderId === currentUserId ? 'Vous: ' : ''}
                  {conversation.lastMessage.content}
                </p>
              )}
            </div>
            
            {conversation.lastMessage?.timestamp && (
              <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                {formatRelativeTime(conversation.lastMessage.timestamp)}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ConversationList;
