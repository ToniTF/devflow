import { 
  getAuth, 
  signInWithPopup, 
  GithubAuthProvider, 
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { app } from './config';
import { doc, setDoc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from './config';

// Obtener la instancia de autenticación
const auth = getAuth(app);
const githubProvider = new GithubAuthProvider();

// Iniciar sesión con GitHub
export const signInWithGithub = async () => {
  try {
    const result = await signInWithPopup(auth, githubProvider);
    // Añadir scopes adicionales para acceder a repositorios si es necesario
    // githubProvider.addScope('repo');
    return result.user;
  } catch (error) {
    console.error("Error al autenticar con GitHub:", error);
    throw error;
  }
};

// Cerrar sesión
export const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    throw error;
  }
};

// Observador de cambio de estado de autenticación
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Función para guardar/actualizar datos de usuario
export const saveUserData = async (user) => {
  if (!user) return;
  
  const userRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userRef);
  
  // Obtener datos adicionales de GitHub
  const githubData = user.providerData[0] || {};
  
  if (!userDoc.exists()) {
    // Es un usuario nuevo, guardar todos los datos
    await setDoc(userRef, {
      uid: user.uid,
      displayName: user.displayName || 'Usuario',
      email: user.email,
      photoURL: user.photoURL,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      
      // Datos de GitHub
      githubUsername: user.reloadUserInfo?.screenName || '',
      githubId: githubData.uid || '',
      githubUrl: `https://github.com/${user.reloadUserInfo?.screenName || ''}`,
      
      // Datos de aplicación
      role: 'user',
      projects: [],
      settings: {
        notifications: true,
        theme: 'light',
        language: 'es'
      }
    });
  } else {
    // Usuario existente, actualizar solo algunos campos
    await updateDoc(userRef, {
      lastLogin: serverTimestamp(),
      displayName: user.displayName || userDoc.data().displayName,
      photoURL: user.photoURL || userDoc.data().photoURL,
      email: user.email || userDoc.data().email
    });
  }
};

// Exportar instancia de autenticación
export { auth };