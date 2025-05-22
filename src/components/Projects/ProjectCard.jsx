import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { getUserWithGitHubData } from '../../firebase/users';
import { requestJoinProject } from '../../firebase/notifications';
import './ProjectCard.css';

const ProjectCard = ({ project, onInviteClick }) => {
  const [creator, setCreator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [joinRequestSent, setJoinRequestSent] = useState(false);
  const { currentUser } = useContext(AuthContext);
  const isCreator = currentUser && project.createdBy === currentUser.uid;

  const handleInviteButtonClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("ProjectCard: Botón invitar clickeado. Tipo de onInviteClick:", typeof onInviteClick);
    if (typeof onInviteClick === 'function') {
      onInviteClick(project.id, project.name || project.title);
    } else {
      console.warn("ProjectCard: onInviteClick no es una función o no fue proporcionada.", onInviteClick);
      // Podrías mostrar un mensaje al usuario o simplemente no hacer nada.
    }
  };

  // Verificar si el usuario actual ya es colaborador
  const isCollaborator = currentUser && 
                         project.collaborators && 
                         project.collaborators.includes(currentUser.uid);
  
  // Obtener información del creador cuando se carga el componente
  useEffect(() => {
    const fetchCreator = async () => {
      if (project.createdBy) {
        try {
          const userData = await getUserWithGitHubData(project.createdBy);
          setCreator(userData);
        } catch (error) {
          console.error('Error al obtener datos del creador:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    
    fetchCreator();
  }, [project.createdBy]);

  // Manejar solicitud para unirse al proyecto
  const handleJoinRequest = async () => {
    if (!currentUser || isCreator || isCollaborator || joining) return;
    
    try {
      setJoining(true);
      await requestJoinProject(
        project.id,
        project.name || 'Proyecto sin nombre',
        project.createdBy,
        currentUser.uid,
        currentUser.displayName || 'Usuario'
      );
      setJoinRequestSent(true);
    } catch (error) {
      console.error('Error al solicitar unirse al proyecto:', error);
    } finally {
      setJoining(false);
    }
  };

  // Renderizar el botón apropiado según el rol del usuario
  const renderActionButton = () => {
    if (isCreator) {
      // El usuario es el creador: mostrar botón de Invitar siempre activo
      return (
        <button 
          onClick={handleInviteButtonClick} 
          className="btn-invite"
        >
          Invitar
        </button>
      );
    } else if (isCollaborator) {
      // El usuario ya es colaborador
      return (
        <span className="collaborator-badge">
          Ya eres colaborador
        </span>
      );
    } else if (joinRequestSent) {
      // El usuario ha enviado una solicitud
      return (
        <span className="request-sent-badge">
          Solicitud enviada
        </span>
      );
    } else {
      // El usuario no es ni creador ni colaborador: mostrar botón Unirse
      return (
        <button 
          onClick={handleJoinRequest} 
          className="btn-join"
          disabled={joining}
        >
          {joining ? 'Enviando...' : 'Unirse'}
        </button>
      );
    }
  };

  return (
    <div className="project-card">
      <h3>{project.title || project.name}</h3>
      <p className="project-description">
        {project.description && project.description.length > 100 
          ? `${project.description.substring(0, 100)}...` 
          : project.description}
      </p>
      
      {/* Renderizar etiquetas */}
      {project.tags && project.tags.length > 0 && (
        <div className="project-tags">
          {project.tags.map((tag, index) => (
            <span key={index} className="project-tag">
              {tag}
            </span>
          ))}
        </div>
      )}
      
      {/* Sección de creador del proyecto */}
      <div className="project-creator">
        {loading ? (
          <span>Cargando creador...</span>
        ) : creator ? (
          <div className="creator-info">
            {/* Se elimina la imagen pero se mantiene el nombre */}
            <span className="creator-name">
              Creado por: {creator.displayName || creator.githubUsername || 'Usuario'}
            </span>
          </div>
        ) : (
          <span>Creador desconocido</span>
        )}
      </div>
      
      {/* Botones de acción */}
      <div className="project-card-actions">
        <Link to={`/project/${project.id}`} className="btn-view">
          Ver proyecto
        </Link>
        {renderActionButton()}
      </div>
    </div>
  );
};

export default ProjectCard;