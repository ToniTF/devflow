import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getNotifications, markAsRead, acceptProjectInvitation, rejectProjectInvitation, acceptJoinRequest, rejectJoinRequest } from '../firebase/notifications';
import './NotificationsPage.css';

const NotificationsPage = () => {
  const { currentUser } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState({});

  useEffect(() => {
    if (!currentUser) return;

    // Suscribirse a las notificaciones del usuario
    const unsubscribe = getNotifications(currentUser.uid, (notificationsList) => {
      setNotifications(notificationsList);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [currentUser]);

  const handleMarkAsRead = async (notificationId) => {
    if (processing[notificationId]) return;
    
    try {
      setProcessing(prev => ({ ...prev, [notificationId]: true }));
      await markAsRead(notificationId);
    } catch (error) {
      console.error('Error al marcar como leída:', error);
    } finally {
      setProcessing(prev => ({ ...prev, [notificationId]: false }));
    }
  };

  const handleAcceptInvitation = async (notification) => {
    if (processing[notification.id]) return;
    
    try {
      setProcessing(prev => ({ ...prev, [notification.id]: true }));
      await acceptProjectInvitation(notification.id, currentUser.uid);
    } catch (error) {
      console.error('Error al aceptar invitación:', error);
    } finally {
      setProcessing(prev => ({ ...prev, [notification.id]: false }));
    }
  };

  const handleRejectInvitation = async (notification) => {
    if (processing[notification.id]) return;
    
    try {
      setProcessing(prev => ({ ...prev, [notification.id]: true }));
      await rejectProjectInvitation(notification.id, currentUser.uid);
    } catch (error) {
      console.error('Error al rechazar invitación:', error);
    } finally {
      setProcessing(prev => ({ ...prev, [notification.id]: false }));
    }
  };

  const handleAcceptJoinRequest = async (notification) => {
    if (processing[notification.id]) return;
    
    try {
      setProcessing(prev => ({ ...prev, [notification.id]: true }));
      await acceptJoinRequest(notification.id);
    } catch (error) {
      console.error('Error al aceptar solicitud de unión:', error);
    } finally {
      setProcessing(prev => ({ ...prev, [notification.id]: false }));
    }
  };

  const handleRejectJoinRequest = async (notification) => {
    if (processing[notification.id]) return;
    
    try {
      setProcessing(prev => ({ ...prev, [notification.id]: true }));
      await rejectJoinRequest(notification.id);
    } catch (error) {
      console.error('Error al rechazar solicitud de unión:', error);
    } finally {
      setProcessing(prev => ({ ...prev, [notification.id]: false }));
    }
  };

  // Renderizar cada notificación según su tipo
  const renderNotification = (notification) => {
    const isUnread = !notification.read;
    const isProcessed = notification.processed;
    const isProcessing = processing[notification.id];
    
    // Formatear fecha
    const formattedDate = notification.createdAt ? 
      new Date(notification.createdAt.seconds * 1000).toLocaleString() : 
      'Fecha desconocida';
    
    return (
      <div 
        key={notification.id} 
        className={`notification-item ${isUnread ? 'unread' : ''} ${isProcessed ? 'processed' : ''}`}
        onClick={() => isUnread && !isProcessed && handleMarkAsRead(notification.id)}
      >
        <div className="notification-content">
          <h4>{notification.title}</h4>
          <p>{notification.message}</p>
          <div className="notification-time">{formattedDate}</div>
          
          {notification.processed && notification.status === 'accepted' && (
            <div className="notification-status accepted">
              ✓ Invitación aceptada
            </div>
          )}
          
          {notification.processed && notification.status === 'rejected' && (
            <div className="notification-status rejected">
              ✗ Invitación rechazada
            </div>
          )}
        </div>
        
        {/* Botones de acción para invitaciones a proyectos que no han sido procesadas */}
        {notification.type === 'project_invitation' && !notification.processed && (
          <div className="notification-actions">
            <button 
              className="btn-accept"
              onClick={() => handleAcceptInvitation(notification)}
              disabled={isProcessing}
            >
              {isProcessing ? 'Procesando...' : 'Aceptar'}
            </button>
            <button 
              className="btn-reject"
              onClick={() => handleRejectInvitation(notification)}
              disabled={isProcessing}
            >
              {isProcessing ? 'Procesando...' : 'Rechazar'}
            </button>
          </div>
        )}

        {/* Botones para solicitudes de unión al proyecto */}
        {notification.type === 'join_request' && !notification.processed && (
          <div className="notification-actions">
            <button 
              className="btn-accept"
              onClick={() => handleAcceptJoinRequest(notification)}
              disabled={isProcessing}
            >
              {isProcessing ? 'Procesando...' : 'Aceptar'}
            </button>
            <button 
              className="btn-reject"
              onClick={() => handleRejectJoinRequest(notification)}
              disabled={isProcessing}
            >
              {isProcessing ? 'Procesando...' : 'Rechazar'}
            </button>
          </div>
        )}
        
        {/* Para notificaciones de invitación aceptada */}
        {notification.type === 'invitation_accepted' && (
          <div className="notification-actions">
            <Link 
              to={`/project/${notification.data?.projectId}`}
              className="btn-view-project"
            >
              Ver proyecto
            </Link>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="notifications-page">
      <h1>Mis notificaciones</h1>
      
      {loading ? (
        <div className="loading">Cargando notificaciones...</div>
      ) : notifications.length > 0 ? (
        <div className="notifications-container">
          <div className="notifications-list-full">
            {notifications.map(notification => renderNotification(notification))}
          </div>
        </div>
      ) : (
        <div className="no-notifications">
          <p>No tienes notificaciones</p>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;