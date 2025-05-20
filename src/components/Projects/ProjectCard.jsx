import React from 'react';

const ProjectCard = ({ project, onInviteCollaborator }) => {
    return (
        <div className="project-card">
            <h3>{project.title}</h3>
            <p>{project.description}</p>
            <button onClick={() => onInviteCollaborator(project.id)}>Invite Collaborator</button>
        </div>
    );
};

export default ProjectCard;