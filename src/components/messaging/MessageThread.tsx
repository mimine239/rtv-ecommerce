import React, { useState, useEffect, useRef } from 'react';
import type { Conversation, Message } from '../../types/message';
import { messageService } from '../../services/messageService';
import { format } from 'date-fns';
import { FaPaperPlane, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';

interface MessageThreadProps {
  conversation: Conversation;
  currentUserId: string;
  currentUserName: string;
}

const MessageThread: React.FC<MessageThreadProps> = ({
  conversation,
  currentUserId,
  currentUserName
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Obtenir l'ID et le nom de l'autre participant
  const otherParticipantId = conversation.participants.find(id => id !== currentUserId) || '';
  const otherParticipantName = conversation.participantNames[otherParticipantId] || 'Utilisateur inconnu';

  // Charger les messages de la conversation
  useEffect(() => {
    const loadMessages = async () => {
      try {
        setLoading(true);
        const conversationMessages = await messageService.getConversationMessages(conversation.id);
        setMessages(conversationMessages);
        setLoading(false);
      } catch (err) {
        console.error("Erreur lors du chargement des messages:", err);
        toast.error("Impossible de charger les messages");
        setLoading(false);
      }
    };

    loadMessages();
  }, [conversation.id]);

  // Faire défiler vers le bas lorsque les messages changent
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Formater la date du message
  const formatMessageDate = (timestamp: Date | string) => {
    if (!timestamp) return '';
    
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    
    try {
      return format(date, "dd/MM/yyyy HH:mm");
    } catch (error) {
      console.error('Erreur de formatage de date:', error);
      return 'Date inconnue';
    }
  };

  // Envoyer un nouveau message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    try {
      setSending(true);
      
      await messageService.sendMessage({
        senderId: currentUserId,
        senderName: currentUserName,
        receiverId: otherParticipantId,
        receiverName: otherParticipantName,
        content: newMessage.trim(),
        conversationId: conversation.id,
        productId: conversation.productId,
        productName: conversation.productName
      });
      
      // Ajouter le message à la liste locale pour un affichage immédiat
      const tempMessage: Message = {
        id: `temp-${Date.now()}`,
        senderId: currentUserId,
        senderName: currentUserName,
        receiverId: otherParticipantId,
        receiverName: otherParticipantName,
        content: newMessage.trim(),
        timestamp: new Date(),
        read: false,
        conversationId: conversation.id
      };
      
      setMessages(prevMessages => [...prevMessages, tempMessage]);
      setNewMessage('');
      setSending(false);
    } catch (err) {
      console.error("Erreur lors de l'envoi du message:", err);
      toast.error("Impossible d'envoyer le message");
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* En-tête de la conversation */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h2 className="font-medium text-lg">{otherParticipantName}</h2>
        {conversation.productName && (
          <p className="text-sm text-gray-600">
            Produit: {conversation.productName}
          </p>
        )}
      </div>

      {/* Corps des messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <FaSpinner className="animate-spin text-primary text-2xl" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>Envoyez votre premier message pour démarrer la conversation.</p>
          </div>
        ) : (
          messages.map(message => (
            <div
              key={message.id}
              className={`flex ${message.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.senderId === currentUserId
                    ? 'bg-primary text-white rounded-br-none'
                    : 'bg-gray-200 text-gray-800 rounded-bl-none'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.senderId === currentUserId ? 'text-primary-100' : 'text-gray-500'
                }`}>
                  {formatMessageDate(message.timestamp)}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Formulaire d'envoi de message */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Écrivez votre message..."
            className="flex-1 border border-gray-300 rounded-l-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            disabled={sending}
          />
          <button
            type="submit"
            className="bg-primary text-white rounded-r-lg py-2 px-4 hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 disabled:opacity-50"
            disabled={sending || !newMessage.trim()}
          >
            {sending ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MessageThread;
