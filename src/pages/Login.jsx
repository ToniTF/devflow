import React, { useContext } from 'react';
import { Redirect } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useAuth } from '../hooks/useAuth';
// Elimina la importación del logo local
// import githubLogo from '../assets/github-logo.png';
import './Login.css';

const Login = () => {
  const { currentUser } = useContext(AuthContext);
  const { login, loading, error } = useAuth();

  // Redireccionar si el usuario ya está autenticado
  if (currentUser) {
    return <Redirect to="/dashboard" />;
  }

  const handleLogin = async () => {
    try {
      await login();
    } catch (err) {
      console.error('Error en página de login:', err);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Bienvenido a DevFlow</h1>
        <p className="login-subtitle">
          Inicia sesión con tu cuenta de GitHub para acceder a la plataforma.
        </p>

        <button 
          className="github-button" 
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? (
            'Iniciando sesión...'
          ) : (
            <>
              {/* Usar URL externa en lugar de imagen local */}
              <img 
                src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" 
                alt="GitHub Logo" 
                className="github-logo" 
              />
              Iniciar sesión con GitHub
            </>
          )}
        </button>

        {error && <div className="login-error">{error}</div>}

        <div className="login-info">
          <h3>¿Por qué GitHub?</h3>
          <p>
            DevFlow está diseñado para desarrolladores. 
            Al iniciar sesión con GitHub, podrás conectar tus proyectos 
            y colaborar fácilmente con otros desarrolladores.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;