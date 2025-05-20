import { useState, useEffect } from 'react';
import { auth } from '../firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';

const useAuth = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const loginWithGithub = async () => {
        // Implement GitHub login logic here
    };

    const logout = async () => {
        // Implement logout logic here
    };

    return { user, loading, loginWithGithub, logout };
};

export default useAuth;