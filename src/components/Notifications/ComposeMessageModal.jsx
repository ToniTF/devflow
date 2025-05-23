import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { createDirectMessage } from '../../firebase/notifications';
import { searchUsers, getUserById } from '../../firebase/users';
import './ComposeMessageModal.css';

const ComposeMessageModal = ({ onClose, selectedMessage }) => {
  const { currentUser } = useContext(AuthContext);
  const [recipientSearch, setRecipientSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Preseleccionar al remitente cuando estamos respondiendo a un mensaje
  useEffect(() => {
    console.log('selectedMessage recibido:', selectedMessage);
    
    if (selectedMessage) {
      // Verificar que tenemos la información requerida
      console.log('Tipo:', selectedMessage.type);
      console.log('senderId:', selectedMessage.senderId);
      console.log('Título:', selectedMessage.title);
      
      if (selectedMessage.type === 'direct_message') {
        // Obtener y establecer el remitente como destinatario
        const loadSender = async () => {
          try {
            const senderId = selectedMessage.senderId || 
                            (selectedMessage.data && selectedMessage.data.senderId);
            
            if (!senderId) {
              console.error('No se encontró ID del remitente en la notificación');
              return;
            }
            
            console.log('Intentando cargar usuario con ID:', senderId);
            const senderData = await getUserById(senderId);
            
            if (senderData) {
              console.log('Datos del remitente obtenidos:', senderData);
              setSelectedRecipient({
                id: senderData.id,
                displayName: senderData.displayName || senderData.email
              });
              setRecipientSearch(senderData.displayName || senderData.email);
              
              if (selectedMessage.title) {
                const title = selectedMessage.title;
                const newSubject = title.startsWith('Re:') ? title : `Re: ${title}`;
                setSubject(newSubject);
                console.log('Asunto establecido:', newSubject);
              }
            } else {
              console.error('No se pudieron obtener datos del remitente');
            }
          } catch (error) {
            console.error('Error al cargar el remitente:', error);
          }
        };
        
        loadSender();
      }
    }
  }, [selectedMessage]);

  // Buscar usuarios mientras se escribe
  const handleSearch = async (e) => {
    const query = e.target.value;
    setRecipientSearch(query);
    
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }
    
    try {
      const results = await searchUsers(query);
      // Filtrar para no incluir al usuario actual
      const filteredResults = results.filter(user => user.id !== currentUser.uid);
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Error al buscar usuarios:', error);
      setError('Error al buscar usuarios');
    }
  };

  const handleSelectRecipient = (user) => {
    setSelectedRecipient(user);
    setRecipientSearch(user.displayName || user.email);
    setSearchResults([]);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!selectedRecipient) {
      setError('Debes seleccionar un destinatario');
      return;
    }
    
    if (!message.trim()) {
      setError('El mensaje no puede estar vacío');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await createDirectMessage(
        selectedRecipient.id,
        currentUser.uid,
        currentUser.displayName || currentUser.email,
        subject,
        message
      );
      
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      setError('Error al enviar el mensaje');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="compose-message-modal">
        <div className="modal-header">
          <h2>Nuevo mensaje</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        
        {success ? (
          <div className="success-message">
            <p>Mensaje enviado con éxito</p>
          </div>
        ) : (
          <form className="compose-form" onSubmit={handleSendMessage}>
            <div className="form-group">
              <label htmlFor="recipient">Para:</label>
              <div className="recipient-search-container">
                <input
                  type="text"
                  id="recipient"
                  value={recipientSearch}
                  onChange={handleSearch}
                  placeholder="Buscar usuario por nombre o email"
                  disabled={selectedRecipient !== null}
                  required
                />
                {selectedRecipient && (
                  <button 
                    className="clear-recipient" 
                    onClick={() => {
                      setSelectedRecipient(null);
                      setRecipientSearch('');
                    }}
                    type="button"
                  >
                    ×
                  </button>
                )}
                
                {searchResults.length > 0 && !selectedRecipient && (
                  <div className="search-results">
                    {searchResults.map(user => (
                      <div 
                        key={user.id} 
                        className="search-result-item"
                        onClick={() => handleSelectRecipient(user)}
                      >
                        {user.displayName || user.email}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="subject">Asunto:</label>
              <input
                type="text"
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Asunto del mensaje"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="message">Mensaje:</label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escribe tu mensaje aquí"
                rows={6}
                required
              />
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <div className="form-actions">
              <button 
                type="button" 
                className="btn-cancel"
                onClick={onClose}
                disabled={loading}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="btn-send"
                disabled={loading || !selectedRecipient || !message.trim()}
              >
                {loading ? 'Enviando...' : 'Enviar mensaje'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ComposeMessageModal;