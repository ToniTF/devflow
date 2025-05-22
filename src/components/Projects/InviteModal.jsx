import React, { useState, useContext, useEffect } from 'react';
import { ProjectContext } from '../../context/ProjectContext';
import { searchUsersByName } from '../../firebase/users';
import { createProjectInvitationNotification } from '../../firebase/notifications';
import { AuthContext } from '../../context/AuthContext';
import './InviteModal.css';

const InviteModal = ({ isOpen, onClose, projectId, projectName }) => { // onClose viene de las props
  // const { closeInviteModal, selectedProjectId, selectedProjectName } = useContext(ProjectContext); // No necesitas closeInviteModal del contexto si usas la prop
  const { selectedProjectId: contextProjectId, selectedProjectName: contextProjectName } = useContext(ProjectContext); // Renombrar para evitar confusión si es necesario
  const { currentUser } = useContext(AuthContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [invitedUsers, setInvitedUsers] = useState([]);

  // Asegurarse de que el modal es visible con estilos claros
  useEffect(() => {
    // Usar las props projectId y projectName para la lógica inicial si es necesario,
    // o el estado del contexto si esa es la intención.
    // El console.log actual usa selectedProjectId y selectedProjectName del contexto.
    console.log("Modal montado con proyecto (contexto):", contextProjectId, contextProjectName);
    console.log("Modal montado con proyecto (props):", projectId, projectName);
  }, [contextProjectId, contextProjectName, projectId, projectName]);

  // Dentro del componente InviteModal, al inicio, agrega esto:
  useEffect(() => {
    console.log("InviteModal recibió props:", { isOpen, projectId, projectName });
  }, [isOpen, projectId, projectName]);

  const handleSearch = async () => {
    if (searchTerm.trim().length < 2) {
      setErrorMsg('Introduce al menos 2 caracteres para buscar');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const results = await searchUsersByName(searchTerm);
      // Filtrar usuarios ya invitados
      const filteredResults = results.filter(
        user => !invitedUsers.some(invited => invited.id === user.id)
      );
      setSearchResults(filteredResults);
      if (filteredResults.length === 0) {
        setErrorMsg('No se encontraron usuarios');
      }
    } catch (error) {
      console.error("Error al buscar usuarios:", error);
      setErrorMsg('Error al buscar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (user) => {
    try {
      setLoading(true);
      setErrorMsg('');
      
      // Enviar notificación de invitación
      await createProjectInvitationNotification(
        user.id,
        projectId, // Usar prop
        projectName, // Usar prop
        currentUser.uid,
        currentUser.displayName || 'Usuario'
      );
      
      // Actualizar la UI
      setInvitedUsers([...invitedUsers, user]);
      setSearchResults(prev => prev.filter(u => u.id !== user.id));
      setSuccessMsg(`Invitación enviada a ${user.displayName || user.email}`);
      
      // Limpiar mensaje de éxito después de unos segundos
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      console.error("Error al enviar invitación:", error);
      setErrorMsg('Error al enviar la invitación');
    } finally {
      setLoading(false);
    }
  };

  // Verificar que las props están llegando
  console.log("InviteModal renderizado con:", { isOpen, projectId, projectName });
  
  return (
    <div className="modal-backdrop"> {/* Solo renderizar si isOpen es true */}
      <div className="invite-modal">
        <div className="modal-header">
          <h2>Invitar colaboradores</h2>
          {/* Usar la prop onClose */}
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {/* Usar la prop projectName para mostrar el nombre del proyecto */}
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
          
          <div className="results-container">
            <h3>Resultados</h3>
            {searchResults.length > 0 ? (
              <ul className="user-list">
                {searchResults.map(user => (
                  <li key={user.id} className="user-item">
                    <div className="user-info">
                      <img 
                        src={user.photoURL || 'https://via.placeholder.com/40'} 
                        alt={user.displayName || 'Usuario'} 
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
            ) : (
              <p className="no-results">No hay resultados</p>
            )}
          </div>
          
          {invitedUsers.length > 0 && (
            <div className="invited-container">
              <h3>Usuarios invitados</h3>
              <ul className="user-list">
                {invitedUsers.map(user => (
                  <li key={user.id} className="user-item invited">
                    <div className="user-info">
                      <img 
                        src={user.photoURL || 'https://via.placeholder.com/40'} 
                        alt={user.displayName || 'Usuario'} 
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
          {/* Usar la prop onClose */}
          <button onClick={onClose} className="cancel-button">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default InviteModal;