import React, { createContext, useEffect, useState } from 'react';
import { auth } from '../firebase/config';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  signInWithPopup,
  GithubAuthProvider
} from 'firebase/auth';
import { createUserDocument } from '../firebase/users'; // Importa la función

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Cuando un usuario inicia sesión, lo guardamos/actualizamos en Firestore
                await createUserDocument(user);
            }
            setCurrentUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const loginWithGitHub = async () => {
        try {
            const provider = new GithubAuthProvider();
            provider.addScope('repo');
            provider.addScope('user');
            provider.addScope('read:user');
            provider.addScope('user:email');
            
            const result = await signInWithPopup(auth, provider);
            
            // Acceder al token y datos del usuario
            const credential = GithubAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            const user = result.user;
            
            // Extraer información completa de GitHub del resultado
            const githubData = {
                accessToken: token,
                id: result._tokenResponse.githubUserId || result._tokenResponse.screenName,
                username: result._tokenResponse.screenName,
                profileUrl: `https://github.com/${result._tokenResponse.screenName}`,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                // Datos adicionales que podemos obtener del tokenResponse
                additionalUserInfo: result._tokenResponse,
                lastLogin: new Date(),
                // Otras propiedades específicas que queramos extraer
                createdAt: user.metadata.creationTime
            };
            
            // Guardar el token en localStorage
            localStorage.setItem('github_token', token);
            
            // Guardar datos completos en Firestore
            await createUserDocument(user, { github: githubData });
            
            return user;
        } catch (error) {
            console.error('Error en loginWithGitHub:', error);
            throw error;
        }
    };

    const value = {
        currentUser,
        loginWithGitHub
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};