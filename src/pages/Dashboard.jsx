import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ProjectContext } from '../context/ProjectContext';
import './Dashboard.css';

const Dashboard = () => {
  const { currentUser } = useContext(AuthContext);
  const { projects, loading } = useContext(ProjectContext);
  const [filter, setFilter] = useState('all');

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

  const filteredProjects = filter === 'all' 
    ? projects 
    : projects.filter(project => project.createdBy === currentUser.uid);

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

      {loading ? (
        <div className="loading-container">Cargando proyectos...</div>
      ) : (
        <div className="projects-grid">
          {filteredProjects.length > 0 ? (
            filteredProjects.map(project => (
              <div key={project.id} className="project-card">
                <h3>{project.name}</h3>
                <p>{project.description}</p>
                <div className="project-meta">
                  <span>Colaboradores: {project.collaborators?.length || 1}</span>
                </div>
                <Link to={`/project/${project.id}`} className="btn btn-secondary">
                  Ver Proyecto
                </Link>
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