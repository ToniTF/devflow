import React from 'react';
import { useParams } from 'react-router-dom';
import { useProjects } from '../../hooks/useProjects';
import CollaboratorList from '../Collaborators/CollaboratorList';
import ChatRoom from '../Chat/ChatRoom';

const ProjectDetail = () => {
    const { projectId } = useParams();
    const { project, loading } = useProjects(projectId);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!project) {
        return <div>Project not found</div>;
    }

    return (
        <div>
            <h1>{project.name}</h1>
            <p>{project.description}</p>
            <h2>Collaborators</h2>
            <CollaboratorList projectId={projectId} />
            <h2>Chat</h2>
            <ChatRoom projectId={projectId} />
        </div>
    );
};

export default ProjectDetail;