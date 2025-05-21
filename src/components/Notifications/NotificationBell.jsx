import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { getUnreadNotificationsCount, markAllAsRead } from '../../firebase/notifications';
import './NotificationBell.css';

const NotificationBell = () => {
  const { currentUser } = useContext(AuthContext);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  
  useEffect(() => {
    if (!currentUser) return;
    
    // Suscribirse al conteo de notificaciones no leídas
    const unsubscribe = getUnreadNotificationsCount(currentUser.uid, (count) => {
      setUnreadCount(count);
    });
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentUser]);
  
  // Cerrar el dropdown al hacer clic afuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead(currentUser.uid);
      setShowDropdown(false);
    } catch (error) {
      console.error('Error al marcar todas como leídas:', error);
    }
  };
  
  if (!currentUser) return null;
  
  return (
    <div className="notification-bell-container" ref={dropdownRef}>
      <div 
        className="notification-bell"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        {/* SVG de campana en color blanco */}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="22" 
          height="22" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="white" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="bell-icon"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        
        {unreadCount > 0 && (
          <span className="notification-count">{unreadCount}</span>
        )}
      </div>
      
      {showDropdown && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notificaciones</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllAsRead}
                className="mark-all-read"
              >
                Marcar todo como leído
              </button>
            )}
          </div>
          
          <div className="notification-dropdown-content">
            {unreadCount === 0 ? (
              <p className="no-notifications">No tienes notificaciones nuevas</p>
            ) : (
              <p className="notification-summary">
                Tienes {unreadCount} notificaciones sin leer
              </p>
            )}
            
            <Link 
              to="/notifications" 
              className="view-all-link"
              onClick={() => setShowDropdown(false)}
            >
              Ver todas las notificaciones
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;