import React from 'react';

const CollaboratorList = ({ collaborators }) => {
    return (
        <div>
            <h2>Colaboradores</h2>
            <ul>
                {collaborators.map((collaborator, index) => (
                    <li key={index}>{collaborator}</li>
                ))}
            </ul>
        </div>
    );
};

export default CollaboratorList;