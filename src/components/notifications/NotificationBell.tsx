import React from 'react';
import { Link } from 'react-router-dom';
import { FaBell } from 'react-icons/fa';
import { useUnreadMessages } from '../../services/notificationService';

interface NotificationBellProps {
  className?: string;
  onClick?: () => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ className = '', onClick }) => {
  const { unreadCount, loading } = useUnreadMessages();
  
  return (
    <Link 
      to="/messages" 
      className={`relative ${className}`}
      onClick={onClick}
    >
      <FaBell className="text-gray-700 hover:text-primary" size={20} />
      
      {!loading && unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Link>
  );
};

export default NotificationBell;
