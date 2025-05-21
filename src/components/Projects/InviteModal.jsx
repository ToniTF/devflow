import React, { useState, useEffect } from 'react';
import { updateDoc, doc, arrayUnion } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { searchUsersByName } from '../../firebase/users';
import './InviteModal.css';

const InviteModal = ({ isOpen, onClose, projectId, projectName }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');

  // Buscar usuarios al escribir
  useEffect(() => {
    const delaySearch = setTimeout(async () => {
      if (!searchTerm || searchTerm.length < 3) {
        setSearchResults([]);
        return;
      }
      
      setLoading(true);
      try {
        const users = await searchUsersByName(searchTerm);
        setSearchResults(users);
      } catch (error) {
        console.error('Error al buscar usuarios:', error);
      } finally {
        setLoading(false);
      }
    }, 500); // Delay para evitar muchas peticiones

    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  // Seleccionar/deseleccionar usuario
  const toggleUserSelection = (user) => {
    if (selectedUsers.some(u => u.id === user.id)) {
      setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  // Enviar invitaciones
  const handleSendInvitations = async () => {
    if (selectedUsers.length === 0) return;
    
    setSending(true);
    try {
      const projectRef = doc(db, 'projects', projectId);
      
      // Para cada usuario seleccionado, crear una invitación
      for (const user of selectedUsers) {
        const invitationData = {
          userId: user.id,
          email: user.email,
          displayName: user.displayName,
          status: 'pending',
          sentAt: new Date()
        };
        
        // Añadir a la lista de invitaciones pendientes del proyecto
        await updateDoc(projectRef, {
          pendingInvitations: arrayUnion(invitationData)
        });
      }
      
      setMessage('¡Invitaciones enviadas correctamente!');
      setSearchTerm('');
      setSelectedUsers([]);
      setSearchResults([]);
      
      // Cerrar el modal después de un breve tiempo
      setTimeout(() => {
        onClose();
        setMessage('');
      }, 2000);
      
    } catch (error) {
      console.error('Error al enviar invitaciones:', error);
      setMessage('Error al enviar invitaciones. Inténtalo de nuevo.');
    } finally {
      setSending(false);
    }
  };

  // Si el modal no está abierto, no renderizamos nada
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="invite-modal">
        <div className="modal-header">
          <h2>Invitar colaboradores a "{projectName}"</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-content">
          <div className="search-container">
            <input 
              type="text"
              className="search-input"
              placeholder="Buscar usuarios por nombre (mínimo 3 caracteres)..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          
          {searchTerm.length > 0 && searchTerm.length < 3 && (
            <p className="search-hint">Escribe al menos 3 caracteres para buscar</p>
          )}
          
          <div className="search-results">
            {loading ? (
              <p className="loading-text">Buscando usuarios...</p>
            ) : searchResults.length > 0 ? (
              <ul className="users-list">
                {searchResults.map(user => (
                  <li 
                    key={user.id}
                    className={`user-item ${selectedUsers.some(u => u.id === user.id) ? 'selected' : ''}`}
                    onClick={() => toggleUserSelection(user)}
                  >
                    <div className="user-avatar">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt={user.displayName} />
                      ) : (
                        <div className="user-initials">
                          {user.displayName?.charAt(0) || user.email?.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="user-info">
                      <span className="user-name">{user.displayName}</span>
                      <span className="user-email">{user.email}</span>
                    </div>
                    <div className="selection-indicator">
                      {selectedUsers.some(u => u.id === user.id) && <span>✓</span>}
                    </div>
                  </li>
                ))}
              </ul>
            ) : searchTerm.length >= 3 ? (
              <p className="no-results">No se encontraron usuarios que coincidan con "{searchTerm}"</p>
            ) : null}
          </div>
          
          {selectedUsers.length > 0 && (
            <div className="selected-users">
              <h3>Usuarios seleccionados ({selectedUsers.length})</h3>
              <ul className="selected-users-list">
                {selectedUsers.map(user => (
                  <li key={user.id} className="selected-user-tag">
                    <span>{user.displayName}</span>
                    <button 
                      onClick={() => toggleUserSelection(user)}
                      className="remove-selected"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {message && (
            <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
              {message}
            </div>
          )}
        </div>
        
        <div className="modal-footer">
          <button 
            className="cancel-button"
            onClick={onClose}
            disabled={sending}
          >
            Cancelar
          </button>
          <button 
            className="invite-button"
            onClick={handleSendInvitations}
            disabled={selectedUsers.length === 0 || sending}
          >
            {sending ? 'Enviando...' : 'Enviar invitaciones'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InviteModal;