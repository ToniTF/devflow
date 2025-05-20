import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ProjectContext } from '../context/ProjectContext';
import { getUserById, addCollaboratorToProject } from '../firebase/firestore';
import './Dashboard.css';

const Dashboard = () => {
  const { currentUser } = useContext(AuthContext);
  const { projects, loading } = useContext(ProjectContext);
  const [filter, setFilter] = useState('all');
  const [usersData, setUsersData] = useState({});
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [joinStatus, setJoinStatus] = useState({});
  
  // Filtrar proyectos según la selección
  const filteredProjects = filter === 'all' 
    ? projects 
    : projects.filter(project => project.createdBy === currentUser?.uid);
  
  // Obtener información de usuarios para los proyectos
  useEffect(() => {
    const fetchUsersData = async () => {
      if (!projects.length) return;
      
      setLoadingUsers(true);
      const uniqueUserIds = new Set();
      
      // Recopilar todos los IDs de usuario (creadores y colaboradores)
      projects.forEach(project => {
        if (project.createdBy) uniqueUserIds.add(project.createdBy);
        if (project.collaborators?.length) {
          project.collaborators.forEach(id => uniqueUserIds.add(id));
        }
      });
      
      // Obtener datos de cada usuario
      const usersDataObj = {};
      const promises = Array.from(uniqueUserIds).map(async (userId) => {
        const userData = await getUserById(userId);
        usersDataObj[userId] = userData;
      });
      
      await Promise.all(promises);
      setUsersData(usersDataObj);
      setLoadingUsers(false);
    };
    
    fetchUsersData();
  }, [projects]);

  // Función para unirse a un proyecto
  const handleJoinProject = async (projectId) => {
    if (!currentUser) return;
    
    setJoinStatus(prev => ({
      ...prev,
      [projectId]: { loading: true, message: '', error: false }
    }));
    
    try {
      const result = await addCollaboratorToProject(projectId, currentUser.uid);
      
      if (result.success) {
        // Actualizar el estado local del proyecto para reflejar el nuevo colaborador
        const updatedProjects = projects.map(project => {
          if (project.id === projectId) {
            return {
              ...project,
              collaborators: [...(project.collaborators || []), currentUser.uid]
            };
          }
          return project;
        });
        
        // Actualizar el contexto (esto dependerá de tu implementación)
        // updateProjects(updatedProjects);
        
        setJoinStatus(prev => ({
          ...prev,
          [projectId]: { 
            loading: false, 
            message: result.message,
            success: true,
            error: false 
          }
        }));
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Error al unirse al proyecto:", error);
      setJoinStatus(prev => ({
        ...prev,
        [projectId]: { 
          loading: false, 
          message: error.message || 'Error al unirse al proyecto',
          error: true,
          success: false
        }
      }));
    }
  };

  // Determinar si el usuario puede unirse al proyecto
  const canJoinProject = (project) => {
    if (!currentUser) return false;
    
    // No puede unirse si es el creador
    if (project.createdBy === currentUser.uid) return false;
    
    // No puede unirse si ya es colaborador
    if (project.collaborators?.includes(currentUser.uid)) return false;
    
    return true;
  };

  if (!currentUser) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-unauthorized">
          <h2>Acceso no autorizado</h2>
          <p>Debes iniciar sesión para ver el dashboard.</p>
          <Link to="/login" className="btn btn-primary">Iniciar Sesión</Link>
        </div>
      </div>
    );
  }

  // Renderizado condicional
  const renderCollaborators = (collaborators) => {
    if (!collaborators || collaborators.length === 0) return null;
    
    return (
      <div className="project-collaborators">
        <h4>Colaboradores:</h4>
        <div className="collaborators-list">
          {collaborators.map(userId => (
            <span key={userId} className="collaborator-tag">
              {usersData[userId]?.displayName || 'Cargando...'}
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <div className="dashboard-actions">
          <div className="filter-buttons">
            <button 
              className={filter === 'all' ? 'active' : ''} 
              onClick={() => setFilter('all')}
            >
              Todos los Proyectos
            </button>
            <button 
              className={filter === 'my' ? 'active' : ''} 
              onClick={() => setFilter('my')}
            >
              Mis Proyectos
            </button>
          </div>
          <Link to="/project/new" className="btn btn-primary">
            <i className="fas fa-plus"></i> Nuevo Proyecto
          </Link>
        </div>
      </div>

      {(loading || loadingUsers) ? (
        <div className="loading-container">Cargando proyectos...</div>
      ) : (
        <div className="projects-grid">
          {filteredProjects.length > 0 ? (
            filteredProjects.map(project => (
              <div key={project.id} className="project-card">
                <h3>{project.name}</h3>
                <p className="project-description">{project.description}</p>
                
                <div className="project-meta">
                  <div className="project-creator">
                    <strong>Creado por:</strong> {usersData[project.createdBy]?.displayName || 'Cargando...'}
                  </div>
                  
                  {project.collaborators?.length > 1 && (
                    <div className="project-collaborators-count">
                      <strong>Colaboradores:</strong> {project.collaborators.length}
                    </div>
                  )}
                </div>
                
                {project.collaborators?.length > 1 && renderCollaborators(project.collaborators)}
                
                <div className="project-tags">
                  {project.tags?.map(tag => (
                    <span key={tag} className="project-tag">{tag}</span>
                  ))}
                </div>
                
                <div className="project-actions">
                  <Link to={`/project/${project.id}`} className="btn btn-secondary">
                    Ver Proyecto
                  </Link>
                  
                  {canJoinProject(project) && (
                    <button 
                      className={`btn ${joinStatus[project.id]?.success ? 'btn-success' : 'btn-primary'}`}
                      onClick={() => handleJoinProject(project.id)}
                      disabled={joinStatus[project.id]?.loading}
                    >
                      {joinStatus[project.id]?.loading ? 'Uniéndose...' : 
                       joinStatus[project.id]?.success ? 'Unido' : 'Unirse'}
                    </button>
                  )}
                </div>
                
                {joinStatus[project.id]?.message && (
                  <div className={`join-message ${joinStatus[project.id]?.error ? 'error' : 'success'}`}>
                    {joinStatus[project.id].message}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="no-projects">
              <p>No hay proyectos disponibles.</p>
              <Link to="/project/new" className="btn btn-primary">Crear Proyecto</Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;