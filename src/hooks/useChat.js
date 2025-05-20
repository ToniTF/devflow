import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

export const useChat = (projectId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar mensajes
  useEffect(() => {
    if (!projectId) return;

    setLoading(true);
    
    try {
      const messagesRef = collection(db, 'projects', projectId, 'messages');
      const messagesQuery = query(messagesRef, orderBy('createdAt', 'asc'));
      
      const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
        const messageList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setMessages(messageList);
        setLoading(false);
      });
      
      // Limpiar la suscripción al desmontar
      return () => unsubscribe();
    } catch (err) {
      console.error('Error al cargar mensajes:', err);
      setError('No se pudieron cargar los mensajes');
      setLoading(false);
    }
  }, [projectId]);

  // Función para enviar mensajes
  const sendMessage = async (content, user) => {
    try {
      if (!content.trim() || !user || !projectId) return;
      
      await addDoc(collection(db, 'projects', projectId, 'messages'), {
        content,
        userId: user.uid,
        userName: user.displayName || 'Usuario',
        userAvatar: user.photoURL || '',
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.error('Error al enviar mensaje:', err);
      setError('No se pudo enviar el mensaje');
    }
  };

  return { messages, loading, error, sendMessage };
};