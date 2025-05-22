import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProjectContext } from '../context/ProjectContext';
import { AuthContext } from '../context/AuthContext';
import ProjectCard from '../components/Projects/ProjectCard';
import InviteModal from '../components/Projects/InviteModal';
import './Dashboard.css';

const Dashboard = () => {
  const { currentUser } = useContext(AuthContext);
  const { projects, loading } = useContext(ProjectContext);
  const [error, setError] = useState(null);
  
  // Estado local para el modal si lo manejas aquí
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedProjectName, setSelectedProjectName] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // Aquí podrías llamar a una acción del contexto para obtener los proyectos
        // Por ejemplo: await getProjects();
      } catch (err) {
        console.error('Error al cargar proyectos:', err);
        setError('Error al cargar los proyectos');
      }
    };

    fetchProjects();
  }, [currentUser]);

  const handleInviteClick = (projectId, projectName) => {
    console.log("Dashboard: handleInviteClick llamado con", projectId, projectName);
    setSelectedProjectId(projectId);
    setSelectedProjectName(projectName || 'Proyecto');
    setInviteModalOpen(true); // Esto abre el modal local
    // Si también necesitas interactuar con el contexto:
    // openInviteModal(projectId, projectName);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Panel de Proyectos</h1>
        {currentUser && (
          <div className="dashboard-actions">
            <Link to="/project/new" className="btn btn-primary">
              <i className="fas fa-plus"></i> Nuevo Proyecto
            </Link>
          </div>
        )}
      </div>

      {!currentUser && (
        <div className="login-banner">
          <p>Estás viendo proyectos públicos. Para crear proyectos o ver los tuyos privados, inicia sesión.</p>
          <Link to="/login" className="btn">Iniciar sesión</Link>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Cargando proyectos...</div>
      ) : (
        <div className="projects-grid">
          {projects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onInviteClick={handleInviteClick} // Asegúrate que handleInviteClick es una función
            />
          ))}
        </div>
      )}

      {/* Modal local */}
      {inviteModalOpen && (
        <InviteModal
          isOpen={inviteModalOpen}
          onClose={() => setInviteModalOpen(false)}
          projectId={selectedProjectId}
          projectName={selectedProjectName}
        />
      )}
    </div>
  );
};

export default Dashboard;