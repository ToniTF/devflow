import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, where, getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { AuthContext } from '../context/AuthContext';
import './ContactsPage.css';

const ContactsPage = () => {
  const { currentUser } = useContext(AuthContext);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState(''); // Para filtrar contactos

  useEffect(() => {
    // Si no hay usuario autenticado, no hacemos la consulta
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const fetchContacts = async () => {
      try {
        setLoading(true);
        
        // Paso 1: Obtener todos los proyectos donde el usuario es colaborador
        const projectsRef = collection(db, 'projects');
        const userProjectsQuery = query(
          projectsRef, 
          where("collaborators", "array-contains", currentUser.uid)
        );
        
        const projectsSnapshot = await getDocs(userProjectsQuery);
        const projectsData = projectsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Paso 2: Extraer todos los IDs de colaboradores/creadores únicos
        const contactIds = new Set();
        projectsData.forEach(project => {
          // Añadir creador del proyecto
          if (project.createdBy && project.createdBy !== currentUser.uid) {
            contactIds.add(project.createdBy);
          }
          
          // Añadir todos los colaboradores excepto el usuario actual
          if (project.collaborators && Array.isArray(project.collaborators)) {
            project.collaborators.forEach(userId => {
              if (userId !== currentUser.uid) {
                contactIds.add(userId);
              }
            });
          }
        });

        // Paso 3: Obtener datos de usuario para cada contacto
        const contactsData = [];
        for (const userId of contactIds) {
          try {
            const userDoc = await getDoc(doc(db, 'users', userId));
            if (userDoc.exists()) {
              contactsData.push({
                id: userId,
                ...userDoc.data()
              });
            }
          } catch (e) {
            console.error(`Error al obtener datos del usuario ${userId}:`, e);
          }
        }
        
        setContacts(contactsData);
      } catch (err) {
        console.error('Error al cargar contactos:', err);
        setError('Error al cargar tus contactos');
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, [currentUser]);

  // Filtrar contactos según el término de búsqueda
  const filteredContacts = contacts.filter(contact => {
    if (!filter) return true;
    
    const searchTerm = filter.toLowerCase();
    return (
      (contact.displayName && contact.displayName.toLowerCase().includes(searchTerm)) ||
      (contact.email && contact.email.toLowerCase().includes(searchTerm)) ||
      (contact.githubUsername && contact.githubUsername.toLowerCase().includes(searchTerm))
    );
  });

  // Si el usuario no está autenticado, mostrar mensaje de error
  if (!currentUser) {
    return (
      <div className="error-container" style={{ color: '#c62828', textAlign: 'center', padding: '3rem' }}>
        Debes iniciar sesión para ver tus contactos
      </div>
    );
  }

  return (
    <div className="contacts-container">
      <div className="contacts-header">
        <h1>Mis Contactos</h1>
        <div className="contacts-search">
          <input
            type="text"
            placeholder="Buscar contactos..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Cargando contactos...</div>
      ) : (
        <>
          {filteredContacts.length > 0 ? (
            <div className="contacts-grid">
              {filteredContacts.map(contact => (
                <div key={contact.id} className="contact-card">
                  <div className="contact-avatar">
                    {contact.photoURL ? (
                      <img src={contact.photoURL} alt={contact.displayName || 'Usuario'} />
                    ) : (
                      <div className="avatar-placeholder">
                        {(contact.displayName || 'U')[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="contact-info">
                    <h3>{contact.displayName || 'Usuario sin nombre'}</h3>
                    {contact.email && <p className="contact-email">{contact.email}</p>}
                    {contact.githubUsername && (
                      <p className="contact-github">
                        <i className="fab fa-github"></i> {contact.githubUsername}
                      </p>
                    )}
                  </div>
                  <div className="contact-actions">
                    {/* Aquí se pueden añadir acciones como enviar mensaje, invitar a proyecto, etc. */}
                    <button className="btn-invite">
                      <i className="fas fa-user-plus"></i> Invitar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-contacts">
              <p>{filter ? 'No se encontraron contactos que coincidan con tu búsqueda.' : 'Aún no tienes contactos.'}</p>
              <p>Los contactos se añaden automáticamente cuando colaboras en proyectos con otros usuarios.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ContactsPage;
