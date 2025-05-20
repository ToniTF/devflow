import { collection, addDoc, getDocs, query, orderBy, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db } from './config';

// Enviar un nuevo mensaje
export const sendMessage = async (projectId, userId, message) => {
  try {
    const messagesRef = collection(db, 'projects', projectId, 'messages');
    await addDoc(messagesRef, {
      content: message,
      sender: userId,
      createdAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error al enviar mensaje:', error);
    return false;
  }
};

// Escuchar nuevos mensajes en tiempo real
export const listenToMessages = (projectId, callback) => {
  try {
    const messagesRef = collection(db, 'projects', projectId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));
    
    // Devuelve un unsubscribe function que debe llamarse cuando el componente se desmonte
    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(messages);
    });
  } catch (error) {
    console.error('Error al escuchar mensajes:', error);
    callback([]);
    return () => {}; // Dummy unsubscribe function
  }
};