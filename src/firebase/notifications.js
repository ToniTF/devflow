import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs,
  updateDoc,
  orderBy,
  doc,
  getDoc,
  deleteDoc,
  serverTimestamp,
  onSnapshot,
  arrayUnion,
  writeBatch // Asegúrate de que writeBatch esté importado aquí
} from 'firebase/firestore';
import { db } from './config';

// Crear una nueva notificación
export const createNotification = async (data) => {
  try {
    const notificationData = {
      ...data,
      createdAt: serverTimestamp(),
      read: false
    };
    
    const docRef = await addDoc(collection(db, 'notifications'), notificationData);
    return { id: docRef.id, ...notificationData };
  } catch (error) {
    console.error('Error al crear notificación:', error);
    throw error;
  }
};

// Crear notificación de invitación a proyecto
export const createProjectInvitationNotification = async (recipientId, projectId, projectName, senderId, senderName) => {
  try {
    return await createNotification({
      type: 'project_invitation',
      recipientId,
      senderId,
      title: 'Invitación a proyecto',
      message: `${senderName} te ha invitado a colaborar en el proyecto "${projectName}"`,
      data: {
        projectId,
        senderName
      },
      actions: [
        {
          label: 'Aceptar',
          type: 'accept_invitation'
        },
        {
          label: 'Rechazar',
          type: 'reject_invitation'
        }
      ]
    });
  } catch (error) {
    console.error('Error al crear notificación de invitación:', error);
    throw error;
  }
};

// Obtener notificaciones de un usuario (en tiempo real)
export const getNotifications = (userId, callback) => {
  const notificationsQuery = query(
    collection(db, 'notifications'),
    where('recipientId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  // Usar onSnapshot para recibir actualizaciones en tiempo real
  return onSnapshot(notificationsQuery, (snapshot) => {
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    callback(notifications);
  });
};

// Contar notificaciones no leídas
export const getUnreadNotificationsCount = (userId, callback) => {
  const unreadQuery = query(
    collection(db, 'notifications'),
    where('recipientId', '==', userId),
    where('read', '==', false)
  );
  
  return onSnapshot(unreadQuery, (snapshot) => {
    callback(snapshot.size);
  });
};

// Marcar notificación como leída
export const markAsRead = async (notificationId) => {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      read: true
    });
  } catch (error) {
    console.error('Error al marcar notificación como leída:', error);
    throw error;
  }
};

// Marcar todas las notificaciones como leídas
export const markAllAsRead = async (userId) => {
  try {
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('recipientId', '==', userId),
      where('read', '==', false)
    );
    
    const snapshot = await getDocs(notificationsQuery);
    
    const updatePromises = snapshot.docs.map(doc => 
      updateDoc(doc.ref, { read: true })
    );
    
    await Promise.all(updatePromises);
  } catch (error) {
    console.error('Error al marcar todas las notificaciones como leídas:', error);
    throw error;
  }
};

// Eliminar una notificación
export const deleteNotification = async (notificationId) => {
  try {
    await deleteDoc(doc(db, 'notifications', notificationId));
  } catch (error) {
    console.error('Error al eliminar notificación:', error);
    throw error;
  }
};

// Eliminar todas las notificaciones de un usuario
export const deleteAllNotifications = async (userId) => {
  try {
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('recipientId', '==', userId)
    );
    
    const snapshot = await getDocs(notificationsQuery);
    
    if (snapshot.empty) {
      return { success: true, message: 'No hay notificaciones para eliminar.' };
    }

    const batch = writeBatch(db); // Ahora writeBatch debería estar definido
    snapshot.docs.forEach(document => { // Cambiado 'doc' a 'document' para evitar conflicto de nombres con la función 'doc' de Firestore
      batch.delete(document.ref);
    });
    
    await batch.commit();
    return { success: true };
  } catch (error) {
    console.error('Error al eliminar todas las notificaciones:', error);
    throw error;
  }
};

// Aceptar invitación a proyecto
export const acceptProjectInvitation = async (notificationId, userId) => {
  try {
    // 1. Obtener la notificación
    const notificationRef = doc(db, 'notifications', notificationId);
    const notificationDoc = await getDoc(notificationRef);
    
    if (!notificationDoc.exists()) {
      throw new Error('Notificación no encontrada');
    }
    
    const notification = {
      id: notificationDoc.id,
      ...notificationDoc.data()
    };
    
    // 2. Verificar que sea una invitación a proyecto
    if (notification.type !== 'project_invitation') {
      throw new Error('Esta notificación no es una invitación a proyecto');
    }
    
    // 3. Obtener el nombre del proyecto (probablemente falta en los datos)
    let projectName = notification.data?.projectName;
    
    // Si no existe el nombre del proyecto en la notificación, obtenerlo de la base de datos
    if (!projectName) {
      const projectRef = doc(db, 'projects', notification.data.projectId);
      const projectDoc = await getDoc(projectRef);
      
      if (projectDoc.exists()) {
        projectName = projectDoc.data().name || 'Sin nombre';
      } else {
        projectName = 'Desconocido';
      }
    }
    
    // 4. Añadir el usuario como colaborador del proyecto
    const projectRef = doc(db, 'projects', notification.data.projectId);
    await updateDoc(projectRef, {
      collaborators: arrayUnion(userId)
    });
    
    // 5. Actualizar la notificación para indicar que ha sido aceptada
    await updateDoc(notificationRef, {
      read: true,
      processed: true,
      status: 'accepted',
      processedAt: serverTimestamp()
    });
    
    // 6. Crear una notificación para el creador del proyecto con el nombre correcto
    await createNotification({
      type: 'invitation_accepted',
      recipientId: notification.senderId,
      senderId: userId,
      title: 'Invitación aceptada',
      message: `Han aceptado tu invitación para colaborar en el proyecto "${projectName}"`,
      data: {
        projectId: notification.data.projectId,
        projectName: projectName
      }
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error al aceptar invitación:', error);
    throw error;
  }
};

// Rechazar invitación a proyecto
export const rejectProjectInvitation = async (notificationId, userId) => {
  try {
    // 1. Obtener la notificación
    const notificationRef = doc(db, 'notifications', notificationId);
    const notificationDoc = await getDoc(notificationRef);
    
    if (!notificationDoc.exists()) {
      throw new Error('Notificación no encontrada');
    }
    
    const notification = {
      id: notificationDoc.id,
      ...notificationDoc.data()
    };
    
    // 2. Verificar que sea una invitación a proyecto
    if (notification.type !== 'project_invitation') {
      throw new Error('Esta notificación no es una invitación a proyecto');
    }
    
    // 3. Actualizar la notificación para indicar que ha sido rechazada
    await updateDoc(notificationRef, {
      read: true,
      processed: true,
      status: 'rejected',
      processedAt: serverTimestamp()
    });
    
    // 4. Crear una notificación para el creador del proyecto
    await createNotification({
      type: 'invitation_rejected',
      recipientId: notification.senderId,
      senderId: userId,
      title: 'Invitación rechazada',
      message: `Han rechazado tu invitación para colaborar en el proyecto "${notification.data.projectName}"`,
      data: {
        projectId: notification.data.projectId,
        projectName: notification.data.projectName
      }
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error al rechazar invitación:', error);
    throw error;
  }
};

// Solicitar unirse a un proyecto
export const requestJoinProject = async (projectId, projectName, ownerId, requesterId, requesterName) => {
  try {
    // Crear notificación para el dueño del proyecto
    await createNotification({
      type: 'join_request',
      recipientId: ownerId,
      senderId: requesterId,
      title: 'Solicitud para unirse a proyecto',
      message: `${requesterName} ha solicitado unirse a tu proyecto "${projectName}"`,
      data: {
        projectId,
        projectName,
        requesterId,
        requesterName
      },
      actions: [
        {
          label: 'Aceptar',
          type: 'accept_join_request'
        },
        {
          label: 'Rechazar',
          type: 'reject_join_request'
        }
      ]
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error al solicitar unirse al proyecto:', error);
    throw error;
  }
};

// Aceptar solicitud de unión al proyecto
export const acceptJoinRequest = async (notificationId) => {
  try {
    // 1. Obtener la notificación
    const notificationRef = doc(db, 'notifications', notificationId);
    const notificationDoc = await getDoc(notificationRef);
    
    if (!notificationDoc.exists()) {
      throw new Error('Notificación no encontrada');
    }
    
    const notification = {
      id: notificationDoc.id,
      ...notificationDoc.data()
    };
    
    // 2. Verificar que sea una solicitud de unión
    if (notification.type !== 'join_request') {
      throw new Error('Esta notificación no es una solicitud de unión');
    }
    
    const { projectId, projectName, requesterId, requesterName } = notification.data;
    
    // 3. Añadir al usuario como colaborador
    const projectRef = doc(db, 'projects', projectId);
    await updateDoc(projectRef, {
      collaborators: arrayUnion(requesterId)
    });
    
    // 4. Actualizar la notificación para indicar que ha sido aceptada
    await updateDoc(notificationRef, {
      read: true,
      processed: true,
      status: 'accepted',
      processedAt: serverTimestamp()
    });
    
    // 5. Crear notificación para el solicitante
    await createNotification({
      type: 'join_request_accepted',
      recipientId: requesterId,
      senderId: notification.recipientId,
      title: 'Solicitud aceptada',
      message: `Tu solicitud para unirte al proyecto "${projectName}" ha sido aceptada`,
      data: {
        projectId,
        projectName
      }
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error al aceptar solicitud de unión:', error);
    throw error;
  }
};

// Rechazar solicitud de unión al proyecto
export const rejectJoinRequest = async (notificationId) => {
  try {
    // 1. Obtener la notificación
    const notificationRef = doc(db, 'notifications', notificationId);
    const notificationDoc = await getDoc(notificationRef);
    
    if (!notificationDoc.exists()) {
      throw new Error('Notificación no encontrada');
    }
    
    const notification = {
      id: notificationDoc.id,
      ...notificationDoc.data()
    };
    
    // 2. Verificar que sea una solicitud de unión
    if (notification.type !== 'join_request') {
      throw new Error('Esta notificación no es una solicitud de unión');
    }
    
    const { projectId, projectName, requesterId } = notification.data;
    
    // 3. Actualizar la notificación para indicar que ha sido rechazada
    await updateDoc(notificationRef, {
      read: true,
      processed: true,
      status: 'rejected',
      processedAt: serverTimestamp()
    });
    
    // 4. Crear notificación para el solicitante
    await createNotification({
      type: 'join_request_rejected',
      recipientId: requesterId,
      senderId: notification.recipientId,
      title: 'Solicitud rechazada',
      message: `Tu solicitud para unirte al proyecto "${projectName}" ha sido rechazada`,
      data: {
        projectId,
        projectName
      }
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error al rechazar solicitud de unión:', error);
    throw error;
  }
};