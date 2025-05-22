import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { AuthContext } from '../context/AuthContext';
import { ProjectContext } from '../context/ProjectContext'; // Asegúrate de importar el contexto de proyectos
import ProjectCard from '../components/Projects/ProjectCard';
import InviteModal from '../components/Projects/InviteModal';
import './Dashboard.css';

const MyProjectsPage = () => {
  const { currentUser } = useContext(AuthContext);
  const { openInviteModal } = useContext(ProjectContext); // Asegúrate de tener acceso a esta función
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedProjectName, setSelectedProjectName] = useState('');

  useEffect(() => {
    // Si no hay usuario autenticado, no hacemos la consulta
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const fetchProjects = async () => {
      try {
        setLoading(true);
        // Consultamos solo los proyectos donde el usuario es creador o colaborador
        const projectsRef = collection(db, 'projects');
        const userProjectsQuery = query(
          projectsRef, 
          where("collaborators", "array-contains", currentUser.uid)
        );
        
        const userProjectsSnapshot = await getDocs(userProjectsQuery);
        const userProjects = userProjectsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setProjects(userProjects);
      } catch (err) {
        console.error('Error al cargar proyectos:', err);
        setError('Error al cargar los proyectos');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [currentUser]);

  const handleInviteCollaborator = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    setSelectedProjectId(projectId);
    setSelectedProjectName(project?.name || 'Proyecto');
    setInviteModalOpen(true);
  };

  // Si el usuario no está autenticado, mostrar mensaje de error apropiado
  if (!currentUser) {
    return (
      <div className="error-container" style={{ color: '#c62828', textAlign: 'center', padding: '3rem' }}>
        Debes iniciar sesión para ver tus proyectos
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Mis Proyectos</h1>
        <div className="dashboard-actions">
          <Link to="/project/new" className="btn btn-primary">
            <i className="fas fa-plus"></i> Nuevo Proyecto
          </Link>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Cargando proyectos...</div>
      ) : (
        <div className="projects-grid">
          {projects.length > 0 ? (
            projects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                // Usar project.createdBy para determinar si el usuario es el propietario
                onInviteClick={project.createdBy === currentUser?.uid ? (projectId, projectName) => openInviteModal(projectId, projectName) : undefined}
              />
            ))
          ) : (
            <div className="no-projects">
              <p>No tienes proyectos todavía.</p>
              <Link to="/project/new" className="btn btn-primary">
                Crear mi primer proyecto
              </Link>
            </div>
          )}
        </div>
      )}

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

export default MyProjectsPage;