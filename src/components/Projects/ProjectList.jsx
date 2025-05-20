import React from 'react';
import { useProjects } from '../../hooks/useProjects';
import ProjectCard from './ProjectCard';

const ProjectList = () => {
    const { projects, loading, error } = useProjects();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error loading projects: {error.message}</div>;
    }

    return (
        <div className="project-list">
            {projects.length === 0 ? (
                <p>No projects available.</p>
            ) : (
                projects.map(project => (
                    <ProjectCard key={project.id} project={project} />
                ))
            )}
        </div>
    );
};

export default ProjectList;