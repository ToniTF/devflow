import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
  signInWithGithub, 
  logOut, 
  saveUserData 
} from '../firebase/auth';

export const useAuth = () => {
  const { currentUser, loading: contextLoading } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Iniciar sesión con GitHub
  const login = async () => {
    try {
      setLoading(true);
      setError(null);
      const user = await signInWithGithub();
      // Aquí está la llamada a saveUserData después de autenticación exitosa
      await saveUserData(user);
      return user;
    } catch (err) {
      console.error("Error en el inicio de sesión:", err);
      setError("No se pudo iniciar sesión con GitHub");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Cerrar sesión
  const logout = async () => {
    try {
      setLoading(true);
      await logOut();
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
      setError("No se pudo cerrar sesión");
    } finally {
      setLoading(false);
    }
  };

  return {
    currentUser,
    loading: loading || contextLoading,
    error,
    login,
    logout,
    isAuthenticated: !!currentUser
  };
};