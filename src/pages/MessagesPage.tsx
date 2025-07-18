import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { messageService } from '../services/messageService';
import type { Conversation } from '../types/message';
import ConversationList from '../components/messaging/ConversationList';
import MessageThread from '../components/messaging/MessageThread';
import { FaInbox } from 'react-icons/fa';
import toast from 'react-hot-toast';

const MessagesPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les conversations de l'utilisateur
  useEffect(() => {
    const loadConversations = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const userConversations = await messageService.getUserConversations(currentUser.uid);
        setConversations(userConversations);
        setLoading(false);
      } catch (err) {
        console.error("Erreur lors du chargement des conversations:", err);
        setError("Impossible de charger vos conversations. Veuillez réessayer plus tard.");
        setLoading(false);
      }
    };

    loadConversations();
  }, [currentUser]);

  // Sélectionner une conversation
  const handleSelectConversation = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    
    // Marquer les messages comme lus
    if (currentUser) {
      try {
        await messageService.markMessagesAsRead(conversation.id, currentUser.uid);
        
        // Mettre à jour le compteur de messages non lus dans la liste
        setConversations(prevConversations => 
          prevConversations.map(conv => 
            conv.id === conversation.id 
              ? { 
                  ...conv, 
                  unreadCount: { 
                    ...conv.unreadCount, 
                    [currentUser.uid]: 0 
                  } 
                } 
              : conv
          )
        );
      } catch (err) {
        console.error("Erreur lors du marquage des messages comme lus:", err);
        toast.error("Impossible de marquer les messages comme lus");
      }
    }
  };

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Connexion requise</h2>
          <p>Vous devez être connecté pour accéder à vos messages.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center">
        <FaInbox className="mr-2" /> Messagerie
      </h1>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 h-[600px]">
          {/* Liste des conversations */}
          <div className="col-span-1 border-r border-gray-200 overflow-y-auto">
            <ConversationList 
              conversations={conversations}
              selectedConversationId={selectedConversation?.id}
              onSelectConversation={handleSelectConversation}
              currentUserId={currentUser.uid}
              loading={loading}
            />
          </div>

          {/* Fil de discussion */}
          <div className="col-span-2 flex flex-col h-full">
            {selectedConversation ? (
              <MessageThread 
                conversation={selectedConversation}
                currentUserId={currentUser.uid}
                currentUserName={currentUser.displayName || 'Utilisateur'}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center p-6">
                  <div className="text-6xl mb-4 flex justify-center">
                    <FaInbox />
                  </div>
                  <p className="text-xl">Sélectionnez une conversation pour commencer</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
