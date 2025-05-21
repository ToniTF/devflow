import React from 'react';
import { Link } from 'react-router-dom';
import './ProjectCard.css'; // Asegúrate de crear este archivo si no existe

const ProjectCard = ({ project, isOwner, showInviteButton, onInviteCollaborator }) => {
    const handleInviteClick = (e) => {
        e.stopPropagation(); // Evita que se dispare el onClick del Link
        onInviteCollaborator(project.id);
    };

    // Función para procesar las etiquetas (maneja tanto strings como arrays)
    const renderTags = () => {
        // Si no hay etiquetas, no renderizamos nada
        if (!project.tags) return null;
        
        // Convertimos las etiquetas a un array
        let tagsArray = [];
        
        if (typeof project.tags === 'string') {
            // Si es un string, dividimos por comas y eliminamos espacios en blanco
            tagsArray = project.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        } else if (Array.isArray(project.tags)) {
            // Si ya es un array, lo usamos directamente
            tagsArray = project.tags;
        }
        
        // Si no hay etiquetas después del procesamiento, no mostramos nada
        if (tagsArray.length === 0) return null;
        
        return (
            <div className="project-tags">
                {tagsArray.map((tag, index) => (
                    <span key={index} className="project-tag">
                        {tag}
                    </span>
                ))}
            </div>
        );
    };

    return (
        <div className="project-card">
            <h3>{project.title || project.name}</h3>
            
            {/* Descripción con truncamiento si es muy larga */}
            <p className="project-description">
                {project.description && project.description.length > 100 
                    ? `${project.description.substring(0, 100)}...` 
                    : project.description}
            </p>
            
            {/* Renderizamos las etiquetas */}
            {renderTags()}
            
            <div className="project-card-actions">
                <Link to={`/project/${project.id}`} className="btn-view">
                    Ver Proyecto
                </Link>
                
                {showInviteButton && isOwner && (
                    <button 
                        onClick={handleInviteClick} 
                        className="btn-invite"
                    >
                        <i className="fas fa-user-plus"></i> Invitar
                    </button>
                )}
            </div>
        </div>
    );
};

export default ProjectCard;