import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

const GithubAuth = () => {
    const { login, loading, error } = useAuth();
    const [localError, setLocalError] = useState('');

    const handleGithubLogin = async () => {
        try {
            // Usa la función login del hook useAuth que ya incluye saveUserData
            await login();
        } catch (error) {
            setLocalError("Error al iniciar sesión con GitHub");
            console.error("Error durante el login con GitHub:", error);
        }
    };

    return (
        <div className="github-auth-container">
            {localError && <p className="error">{localError}</p>}
            <button 
                className="github-button"
                onClick={handleGithubLogin}
                disabled={loading}
            >
                {loading ? 'Procesando...' : 'Iniciar sesión con GitHub'}
            </button>
        </div>
    );
};

export default GithubAuth;