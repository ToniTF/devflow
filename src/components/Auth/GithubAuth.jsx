import React from 'react';
import { auth, provider } from '../../firebase/auth'; // Asegúrate de que la ruta sea correcta
import { useAuth } from '../../hooks/useAuth';

const GithubAuth = () => {
    const { login } = useAuth();

    const handleGithubLogin = async () => {
        try {
            const result = await auth.signInWithPopup(provider);
            const user = result.user;
            login(user);
        } catch (error) {
            console.error("Error during GitHub login:", error);
        }
    };

    return (
        <div>
            <button onClick={handleGithubLogin}>
                Iniciar sesión con GitHub
            </button>
        </div>
    );
};

export default GithubAuth;