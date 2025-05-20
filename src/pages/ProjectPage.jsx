import React from 'react';
import { useParams } from 'react-router-dom';
import ProjectDetail from '../components/Projects/ProjectDetail';
import CollaboratorList from '../components/Collaborators/CollaboratorList';
import ChatRoom from '../components/Chat/ChatRoom';
import { useProjects } from '../hooks/useProjects';

const ProjectPage = () => {
    const { projectId } = useParams();
    const { project, loading } = useProjects(projectId);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>{project.name}</h1>
            <ProjectDetail project={project} />
            <CollaboratorList collaborators={project.collaborators} />
            <ChatRoom projectId={projectId} />
        </div>
    );
};

export default ProjectPage;