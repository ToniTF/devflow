import React from 'react';
import { useAuth } from '../hooks/useAuth';

const Profile = () => {
    const { user } = useAuth();

    return (
        <div className="profile">
            <h1>Perfil de Usuario</h1>
            {user ? (
                <div>
                    <h2>{user.displayName}</h2>
                    <p>Email: {user.email}</p>
                    <img src={user.photoURL} alt={user.displayName} />
                </div>
            ) : (
                <p>No hay información de usuario disponible.</p>
            )}
        </div>
    );
};

export default Profile;