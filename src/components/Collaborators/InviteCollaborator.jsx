import React, { useState } from 'react';
import { db } from '../../firebase/firestore'; // Importa la configuración de Firestore
import { useAuth } from '../../hooks/useAuth'; // Hook para obtener información del usuario autenticado

const InviteCollaborator = ({ projectId }) => {
    const [email, setEmail] = useState('');
    const { user } = useAuth();

    const handleInvite = async (e) => {
        e.preventDefault();
        if (!email) return;

        try {
            // Lógica para invitar al colaborador
            await db.collection('projects').doc(projectId).update({
                collaborators: firebase.firestore.FieldValue.arrayUnion(email)
            });
            setEmail('');
            alert('Colaborador invitado con éxito');
        } catch (error) {
            console.error('Error al invitar al colaborador: ', error);
            alert('Error al invitar al colaborador');
        }
    };

    return (
        <div>
            <h2>Invitar Colaborador</h2>
            <form onSubmit={handleInvite}>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email del colaborador"
                    required
                />
                <button type="submit">Invitar</button>
            </form>
        </div>
    );
};

export default InviteCollaborator;