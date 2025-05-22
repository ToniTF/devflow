import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProjectContext } from '../context/ProjectContext'; // Usado para obtener 'projects' y 'loading'
import { AuthContext } from '../context/AuthContext';
import ProjectCard from '../components/Projects/ProjectCard';
import InviteModal from '../components/Projects/InviteModal';
import './Dashboard.css';

const Dashboard = () => {
  const { currentUser } = useContext(AuthContext);
  // 'projects' y 'loading' vienen del ProjectContext.
  // 'openInviteModal' del ProjectContext no se usa aquí si el modal es local.
  const { projects, loading } = useContext(ProjectContext); 
  const [error, setError] = useState(null); // Error local para esta página
  
  // Estados para el modal local
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedProjectName, setSelectedProjectName] = useState('');

  // useEffect para cargar proyectos ya no es necesario aquí si ProjectContext lo maneja.
  // Si ProjectContext no carga los proyectos, este useEffect debería hacerlo.
  // Por ahora, asumimos que ProjectContext provee 'projects' y 'loading'.

  // Función para abrir el modal de invitación LOCAL
  const handleInviteClick = (projectId, projectName) => {
    console.log("Dashboard: handleInviteClick llamado con", projectId, projectName);
    setSelectedProjectId(projectId);
    setSelectedProjectName(projectName || 'Proyecto');
    setInviteModalOpen(true); // Esto actualiza el estado local
  };
  
  useEffect(() => {
    // Log para verificar el cambio de estado del modal
    console.log("Dashboard: inviteModalOpen cambió a:", inviteModalOpen);
  }, [inviteModalOpen]);

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
        <div className="login-banner" style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f0f0f0', borderRadius: '4px', margin: '1rem 0' }}>
          <p>Estás viendo proyectos públicos. Para crear proyectos o ver los tuyos privados, inicia sesión.</p>
          <Link to="/login" className="btn">Iniciar sesión</Link>
        </div>
      )}

      {error && <div className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

      {loading ? (
        <div className="loading" style={{ textAlign: 'center', padding: '2rem' }}>Cargando proyectos...</div>
      ) : (
        <div className="projects-grid">
          {projects && projects.length > 0 ? ( // Añadida verificación de projects
            projects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                // Llamar a la función local para abrir el modal
                // Solo permitir invitar si el usuario es el creador del proyecto
                onInviteClick={project.createdBy === currentUser?.uid ? handleInviteClick : undefined}
              />
            ))
          ) : (
            <div className="no-projects" style={{ textAlign: 'center', padding: '2rem' }}>
              <p>No hay proyectos disponibles.</p>
              {currentUser && (
                <Link to="/project/new" className="btn btn-primary">
                  Crear un proyecto
                </Link>
              )}
            </div>
          )}
        </div>
      )}

      {/* El modal local se renderiza basado en el estado local inviteModalOpen */}
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