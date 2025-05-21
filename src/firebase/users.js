import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  query, 
  where, 
  getDocs,
  limit
} from 'firebase/firestore';
import { db, auth } from './config';

// Crear o actualizar un usuario en Firestore cuando se registra
export const createUserDocument = async (user, additionalData = {}) => {
  if (!user) return;

  const userRef = doc(db, 'users', user.uid);
  const snapshot = await getDoc(userRef);

  // Si el usuario no existe en Firestore, lo creamos
  if (!snapshot.exists()) {
    const { displayName, email, photoURL } = user;
    const createdAt = new Date();

    try {
      await setDoc(userRef, {
        displayName,
        email,
        photoURL,
        createdAt,
        ...additionalData
      });
    } catch (error) {
      console.error('Error al crear el documento de usuario:', error);
    }
  }

  return userRef;
};

// Obtener datos de un usuario por su ID
export const getUserById = async (userId) => {
  if (!userId) return null;
  
  try {
    const userRef = doc(db, 'users', userId);
    const userSnapshot = await getDoc(userRef);
    
    if (userSnapshot.exists()) {
      return { id: userSnapshot.id, ...userSnapshot.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    return null;
  }
};

// Buscar usuarios por nombre para la funcionalidad de invitación
export const searchUsersByName = async (searchTerm) => {
  if (!searchTerm || searchTerm.length < 2) return [];
  
  try {
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      where('displayName', '>=', searchTerm),
      where('displayName', '<=', searchTerm + '\uf8ff'), // Truco para búsqueda de prefijo
      limit(10)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error al buscar usuarios:', error);
    return [];
  }
};