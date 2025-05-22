import React, { useState, useContext, useEffect } from 'react';
import { ProjectContext } from '../../context/ProjectContext';
import { searchUsersByName } from '../../firebase/users';
import { createProjectInvitationNotification } from '../../firebase/notifications';
import { AuthContext } from '../../context/AuthContext';
import './InviteModal.css';

const InviteModal = ({ isOpen, onClose, projectId, projectName }) => {
  const { currentUser } = useContext(AuthContext);
  // Si necesitas datos del contexto del proyecto, puedes obtenerlos, pero onClose viene de props.
  // const { selectedProjectId: contextProjectId, selectedProjectName: contextProjectName } = useContext(ProjectContext);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [invitedUsers, setInvitedUsers] = useState([]);

  useEffect(() => {
    console.log("InviteModal recibió props:", { isOpen, projectId, projectName });
    if (isOpen) {
      // Resetear estados internos cuando el modal se abre
      setSearchTerm('');
      setSearchResults([]);
      setErrorMsg('');
      setSuccessMsg('');
      setInvitedUsers([]);
    }
  }, [isOpen, projectId, projectName]);

  const handleSearch = async () => {
    if (searchTerm.trim().length < 2) {
      setErrorMsg('Introduce al menos 2 caracteres para buscar');
      setSearchResults([]);
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const results = await searchUsersByName(searchTerm);
      const filteredResults = results.filter(
        user => !invitedUsers.some(invited => invited.id === user.id) && user.id !== currentUser?.uid
      );
      setSearchResults(filteredResults);
      if (filteredResults.length === 0) {
        setErrorMsg('No se encontraron usuarios o ya están invitados.');
      }
    } catch (error) {
      console.error("Error al buscar usuarios:", error);
      setErrorMsg('Error al buscar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (userToInvite) => {
    if (!projectId || !projectName) {
      setErrorMsg('Error: No se ha especificado el proyecto para la invitación.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      await createProjectInvitationNotification(
        userToInvite.id,
        projectId, // Usar la prop projectId
        projectName, // Usar la prop projectName
        currentUser.uid,
        currentUser.displayName || currentUser.email || 'Un usuario'
      );
      setInvitedUsers(prev => [...prev, userToInvite]);
      setSearchResults(prev => prev.filter(u => u.id !== userToInvite.id));
      setSuccessMsg(`Invitación enviada a ${userToInvite.displayName || userToInvite.email}`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      console.error("Error al enviar invitación:", error);
      setErrorMsg('Error al enviar la invitación');
    } finally {
      setLoading(false);
    }
  };

  // Si isOpen es falso, no renderizar nada.
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-backdrop">
      <div className="invite-modal">
        <div className="modal-header">
          <h2>Invitar colaboradores</h2>
          {/* Asegúrate de que este botón llame a la prop onClose */}
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <p>Proyecto: <strong>{projectName}</strong></p>
          
          <div className="search-container">
            <input
              type="text"
              placeholder="Buscar por nombre o email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button 
              onClick={handleSearch} 
              disabled={loading}
              className="search-button"
            >
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
          
          {errorMsg && <div className="error-message">{errorMsg}</div>}
          {successMsg && <div className="success-message">{successMsg}</div>}
          
          {searchResults.length > 0 && (
            <div className="results-container">
              <h3>Resultados de la búsqueda</h3>
              <ul className="user-list">
                {searchResults.map(user => (
                  <li key={user.id} className="user-item">
                    <div className="user-info">
                      <img 
                        src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || user.email}&background=random`} 
                        alt={user.displayName || user.email} 
                        className="user-avatar"
                      />
                      <span className="user-name">{user.displayName || user.email}</span>
                    </div>
                    <button 
                      onClick={() => handleInvite(user)}
                      className="invite-button"
                      disabled={loading}
                    >
                      Invitar
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {invitedUsers.length > 0 && (
            <div className="invited-container">
              <h3>Usuarios ya invitados en esta sesión</h3>
              <ul className="user-list">
                {invitedUsers.map(user => (
                  <li key={user.id} className="user-item invited">
                    <div className="user-info">
                      <img 
                        src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || user.email}&background=random`} 
                        alt={user.displayName || user.email} 
                        className="user-avatar"
                      />
                      <span className="user-name">{user.displayName || user.email}</span>
                    </div>
                    <span className="invited-badge">Invitado</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <div className="modal-footer">
          {/* Asegúrate de que este botón llame a la prop onClose */}
          <button onClick={onClose} className="cancel-button">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default InviteModal;