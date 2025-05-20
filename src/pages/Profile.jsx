import React, { useContext, useState } from 'react';
import { Redirect } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useAuth } from '../hooks/useAuth';
import './Profile.css';

const Profile = () => {
  const { currentUser } = useContext(AuthContext);
  const { logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  if (!currentUser) {
    return <Redirect to="/login" />;
  }

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
      // El redireccionamiento se manejará en el AuthContext
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <img 
            src={currentUser.photoURL || 'https://via.placeholder.com/150'} 
            alt="Foto de perfil" 
            className="profile-avatar" 
          />
          <h1>{currentUser.displayName || 'Usuario'}</h1>
          <p className="profile-email">{currentUser.email}</p>
        </div>

        <div className="profile-info">
          <div className="info-item">
            <strong>GitHub:</strong>
            <span>{currentUser.reloadUserInfo?.screenName || 'No disponible'}</span>
          </div>
          <div className="info-item">
            <strong>Miembro desde:</strong>
            <span>{currentUser.metadata?.creationTime 
              ? new Date(currentUser.metadata.creationTime).toLocaleDateString() 
              : 'No disponible'}
            </span>
          </div>
        </div>

        <div className="profile-actions">
          <button 
            className="btn btn-danger"
            onClick={handleLogout}
            disabled={isLoading}
          >
            {isLoading ? 'Cerrando sesión...' : 'Cerrar Sesión'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;