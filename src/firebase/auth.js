import { 
  getAuth, 
  signInWithPopup, 
  GithubAuthProvider, 
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { app } from './config';

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

// Exportar instancia de autenticación
export { auth };