import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  query, 
  where, 
  getDocs,
  limit,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth } from './config';

// Crear o actualizar un usuario en Firestore cuando se registra
export const createUserDocument = async (user, additionalData = {}) => {
  if (!user) return;

  const userRef = doc(db, 'users', user.uid);
  const snapshot = await getDoc(userRef);

  // Información básica del usuario
  const userData = {
    uid: user.uid,
    displayName: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
    lastUpdated: serverTimestamp()
  };
  
  if (additionalData.github) {
    // Datos específicos de GitHub
    const githubData = additionalData.github;
    
    // Extraer campos específicos para facilitar consultas
    userData.githubUsername = githubData.username;
    userData.githubId = githubData.id;
    userData.githubUrl = githubData.profileUrl;
    userData.lastLogin = serverTimestamp();
    
    // Guardar todos los datos de GitHub en un subcampo
    userData.github = {
      id: githubData.id,
      username: githubData.username,
      accessToken: githubData.accessToken,
      profileUrl: githubData.profileUrl,
      additionalData: githubData.additionalUserInfo,
      lastLogin: serverTimestamp()
    };
  }
  
  try {
    if (!snapshot.exists()) {
      // Crear nuevo usuario
      await setDoc(userRef, {
        ...userData,
        createdAt: serverTimestamp(),
        role: 'user', // Rol predeterminado
        settings: {
          language: 'es',
          theme: 'light',
          notifications: true
        },
        projects: [] // Array vacío de proyectos
      });
    } else {
      // Actualizar usuario existente
      await updateDoc(userRef, userData);
    }
  } catch (error) {
    console.error('Error al guardar datos de usuario:', error);
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

// Buscar usuarios por nombre o nombre de usuario de GitHub
export const searchUsersByName = async (searchTerm) => {
  if (!searchTerm || searchTerm.length < 2) return [];
  
  try {
    const results = [];
    const usersRef = collection(db, 'users');
    const lowercaseSearch = searchTerm.toLowerCase();
    
    // Primera consulta: buscar por displayName
    const nameQuery = query(
      usersRef,
      where('displayName', '>=', searchTerm),
      where('displayName', '<=', searchTerm + '\uf8ff'),
      limit(8)
    );
    
    const nameSnapshot = await getDocs(nameQuery);
    nameSnapshot.docs.forEach(doc => {
      results.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Segunda consulta: buscar por githubUsername
    const usernameQuery = query(
      usersRef,
      where('githubUsername', '>=', lowercaseSearch),
      where('githubUsername', '<=', lowercaseSearch + '\uf8ff'),
      limit(8)
    );
    
    const usernameSnapshot = await getDocs(usernameQuery);
    usernameSnapshot.docs.forEach(doc => {
      // Evitar duplicados
      if (!results.some(user => user.id === doc.id)) {
        results.push({
          id: doc.id,
          ...doc.data()
        });
      }
    });
    
    // Tercera consulta: buscar por email (si se quiere incluir)
    const emailQuery = query(
      usersRef,
      where('email', '>=', lowercaseSearch),
      where('email', '<=', lowercaseSearch + '\uf8ff'),
      limit(5)
    );
    
    const emailSnapshot = await getDocs(emailQuery);
    emailSnapshot.docs.forEach(doc => {
      // Evitar duplicados
      if (!results.some(user => user.id === doc.id)) {
        results.push({
          id: doc.id,
          ...doc.data()
        });
      }
    });
    
    // Limitar los resultados finales
    return results.slice(0, 10);
  } catch (error) {
    console.error('Error al buscar usuarios:', error);
    return [];
  }
};

// Obtiene los datos completos de un usuario, incluyendo información de GitHub
export const getUserWithGitHubData = async (userId) => {
  if (!userId) return null;
  
  try {
    const userRef = doc(db, 'users', userId);
    const userSnapshot = await getDoc(userRef);
    
    if (userSnapshot.exists()) {
      // Devolver datos del usuario con su ID incluido
      return {
        id: userSnapshot.id,
        ...userSnapshot.data()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error al obtener datos del usuario:', error);
    return null;
  }
};