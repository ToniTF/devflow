import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  getNotifications, 
  markAsRead, 
  acceptProjectInvitation, 
  rejectProjectInvitation, 
  acceptJoinRequest, 
  rejectJoinRequest,
  deleteNotification,
  deleteAllNotifications
} from '../firebase/notifications';
import ComposeMessageModal from '../components/Notifications/ComposeMessageModal';
import './NotificationsPage.css';

const NotificationsPage = () => {
  const { currentUser } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState({});
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null); // Para almacenar el mensaje seleccionado

  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = getNotifications(currentUser.uid, (notificationsList) => {
      setNotifications(notificationsList);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [currentUser]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
    } catch (error) {
      console.error('Error al marcar como leída:', error);
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

  const handleDeleteNotification = async (notificationId) => {
    if (processing[notificationId]) return;
    try {
      setProcessing(prev => ({ ...prev, [notificationId]: true }));
      await deleteNotification(notificationId);
    } catch (error) {
      console.error('Error al eliminar notificación:', error);
    } finally {
      setProcessing(prev => ({ ...prev, [notificationId]: false }));
    }
  };

  const handleDeleteAllNotifications = async () => {
    if (window.confirm('¿Estás seguro de eliminar TODAS tus notificaciones? Esta acción no se puede deshacer.')) {
      try {
        setIsDeletingAll(true);
        await deleteAllNotifications(currentUser.uid);
      } catch (error) {
        console.error('Error al eliminar todas las notificaciones:', error);
      } finally {
        setIsDeletingAll(false);
      }
    }
  };

  const renderNotification = (notification) => {
    const isUnread = !notification.read;
    const isProcessed = notification.processed;
    const isCurrentlyProcessing = processing[notification.id]; 
    
    const formattedDate = notification.createdAt ? 
      new Date(notification.createdAt.seconds * 1000).toLocaleString() : 
      'Fecha desconocida';

    const canBeMarkedAsReadOnClick = isUnread && !isProcessed && !isCurrentlyProcessing;

    const mainNotificationClickHandler = () => {
      if (canBeMarkedAsReadOnClick) {
        handleMarkAsRead(notification.id);
      }
    };
    
    return (
      <div 
        key={notification.id} 
        className={`notification-item ${isUnread ? 'unread' : ''} ${isProcessed ? 'processed' : ''}`}
        onClick={mainNotificationClickHandler}
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
        
        {/* Contenedor principal para todos los grupos de acciones */}
        <div className="notification-actions-group">
        
          {/* Grupo de acciones para invitaciones a proyectos */}
          {notification.type === 'project_invitation' && !notification.processed && (
            <div className="notification-actions">
              <button 
                className="btn-accept"
                onClick={(e) => { e.stopPropagation(); handleAcceptInvitation(notification);}}
                disabled={isCurrentlyProcessing}
              >
                {isCurrentlyProcessing ? 'Procesando...' : 'Aceptar'}
              </button>
              <button 
                className="btn-reject"
                onClick={(e) => { e.stopPropagation(); handleRejectInvitation(notification);}}
                disabled={isCurrentlyProcessing}
              >
                {isCurrentlyProcessing ? 'Procesando...' : 'Rechazar'}
              </button>
            </div>
          )}

          {/* Grupo de acciones para solicitudes de unión al proyecto */}
          {notification.type === 'join_request' && !notification.processed && (
            <div className="notification-actions">
              <button 
                className="btn-accept"
                onClick={(e) => { e.stopPropagation(); handleAcceptJoinRequest(notification);}}
                disabled={isCurrentlyProcessing}
              >
                {isCurrentlyProcessing ? 'Procesando...' : 'Aceptar'}
              </button>
              <button 
                className="btn-reject"
                onClick={(e) => { e.stopPropagation(); handleRejectJoinRequest(notification);}}
                disabled={isCurrentlyProcessing}
              >
                {isCurrentlyProcessing ? 'Procesando...' : 'Rechazar'}
              </button>
            </div>
          )}
          
          {/* Grupo de acciones para enlace "Ver proyecto" */}
          {(notification.type === 'invitation_accepted' || notification.type === 'join_request_accepted') && notification.data?.projectId && (
            <div className="notification-actions">
              <Link 
                to={`/project/${notification.data.projectId}`}
                className="btn-view-project"
                onClick={(e) => {
                  // El clic en el padre marcará como leído.
                }}
              >
                Ver proyecto
              </Link>
            </div>
          )}

          {/* Para mensajes directos, añadir botón de responder */}
          {notification.type === 'direct_message' && (
            <div className="notification-actions">
              <button 
                className="btn-reply"
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setSelectedMessage(notification);
                  setShowComposeModal(true); 
                }}
                disabled={isCurrentlyProcessing}
              >
                Responder
              </button>
            </div>
          )}
          
          {/* Grupo de acciones para el botón de eliminar individual */}
          {/* Este div siempre debería renderizarse, el botón interior se deshabilita si isCurrentlyProcessing es true */}
          <div className="notification-actions"> 
            <button
              className="btn-delete-notification"
              onClick={(e) => {
                e.stopPropagation(); 
                if (window.confirm('¿Estás seguro de eliminar esta notificación?')) {
                  handleDeleteNotification(notification.id);
                }
              }}
              disabled={isCurrentlyProcessing}
              title="Eliminar notificación"
            >
              Eliminar
            </button>
          </div>

        </div> {/* Fin de notification-actions-group */}
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
          <div className="notifications-header-actions">
            <button
              className="btn-compose"
              onClick={() => setShowComposeModal(true)}
            >
              Nuevo mensaje
            </button>
            <button
              className="btn-delete-all"
              onClick={handleDeleteAllNotifications}
              disabled={isDeletingAll || loading}
            >
              {isDeletingAll ? 'Eliminando...' : 'Eliminar todas las notificaciones'}
            </button>
          </div>
          <div className="notifications-list-full">
            {notifications.map(notification => renderNotification(notification))}
          </div>
        </div>
      ) : (
        <div className="no-notifications">
          <p>No tienes notificaciones</p>
        </div>
      )}

      {showComposeModal && (
        <ComposeMessageModal 
          onClose={() => setShowComposeModal(false)} 
          initialMessage={selectedMessage} // Pasar el mensaje seleccionado para responder
        />
      )}
    </div>
  );
};

export default NotificationsPage;