import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
  signInWithGithub, 
  logOut, 
  onAuthChange 
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
      await signInWithGithub();
    } catch (err) {
      console.error("Error en el inicio de sesión:", err);
      setError("No se pudo iniciar sesión con GitHub");
    } finally {
      setLoading(false);
    }
  };

  // Cerrar sesión
  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
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