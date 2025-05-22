import { 
  collection, 
  doc, 
  getDocs,
  deleteDoc, 
  query, 
  where, 
  writeBatch
} from 'firebase/firestore';
import { db } from './config';

/**
 * Eliminar un proyecto y todos sus datos relacionados
 * @param {string} projectId - ID del proyecto a eliminar
 * @returns {Promise<void>}
 */
export const deleteProject = async (projectId) => {
  if (!projectId) {
    throw new Error('Se requiere el ID del proyecto');
  }

  const batch = writeBatch(db);
  
  try {
    // 1. Eliminar todas las tareas asociadas al proyecto
    const tasksRef = collection(db, 'projects', projectId, 'tasks');
    const tasksSnapshot = await getDocs(tasksRef);
    tasksSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    // 2. Eliminar todos los mensajes del chat del proyecto
    const messagesRef = collection(db, 'projects', projectId, 'messages');
    const messagesSnapshot = await getDocs(messagesRef);
    messagesSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    // 3. Eliminar todas las notificaciones relacionadas con este proyecto
    const notificationsRef = collection(db, 'notifications');
    const notificationsQuery = query(
      notificationsRef, 
      where('data.projectId', '==', projectId)
    );
    const notificationsSnapshot = await getDocs(notificationsQuery);
    notificationsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    // 4. Ejecutar el batch para eliminar todas las colecciones anidadas
    await batch.commit();
    
    // 5. Finalmente, eliminar el documento del proyecto
    await deleteDoc(doc(db, 'projects', projectId));
    
    return true;
  } catch (error) {
    console.error('Error al eliminar el proyecto:', error);
    throw error;
  }
};