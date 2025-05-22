import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { AuthContext } from '../context/AuthContext';
// import { ProjectContext } from '../context/ProjectContext'; // No es necesario para el modal local si no se usa openInviteModal del contexto
import ProjectCard from '../components/Projects/ProjectCard';
import InviteModal from '../components/Projects/InviteModal';
import './Dashboard.css'; // Asumo que compartes estilos con Dashboard

const MyProjectsPage = () => {
  const { currentUser } = useContext(AuthContext);
  // const { openInviteModal } = useContext(ProjectContext); // Comentado si no se usa para el modal local

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para el modal local
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedProjectName, setSelectedProjectName] = useState('');

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      setProjects([]); // Limpiar proyectos si no hay usuario
      return;
    }

    const fetchProjects = async () => {
      setLoading(true);
      setError(null); // Resetear error
      try {
        const projectsRef = collection(db, 'projects');
        // Consulta para proyectos creados por el usuario
        const createdQuery = query(projectsRef, where("createdBy", "==", currentUser.uid));
        // Consulta para proyectos donde el usuario es colaborador
        const collaboratorQuery = query(projectsRef, where("collaborators", "array-contains", currentUser.uid));

        const [createdSnapshot, collaboratorSnapshot] = await Promise.all([
          getDocs(createdQuery),
          getDocs(collaboratorQuery)
        ]);

        const userProjectsMap = new Map();
        createdSnapshot.docs.forEach(doc => userProjectsMap.set(doc.id, { id: doc.id, ...doc.data() }));
        collaboratorSnapshot.docs.forEach(doc => userProjectsMap.set(doc.id, { id: doc.id, ...doc.data() }));
        
        setProjects(Array.from(userProjectsMap.values()));
      } catch (err) {
        console.error('Error al cargar proyectos:', err);
        setError('Error al cargar los proyectos');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [currentUser]);

  // Función para abrir el modal de invitación LOCAL
  const handleOpenInviteModal = (projectId, projectName) => {
    console.log("MyProjectsPage: Abriendo modal local para:", projectId, projectName);
    setSelectedProjectId(projectId);
    setSelectedProjectName(projectName || 'Proyecto');
    setInviteModalOpen(true); // Esto actualiza el estado local
  };

  useEffect(() => {
    // Log para verificar el cambio de estado del modal
    console.log("MyProjectsPage: inviteModalOpen cambió a:", inviteModalOpen);
  }, [inviteModalOpen]);


  if (!currentUser) {
    return (
      <div className="dashboard-container" style={{ textAlign: 'center', padding: '2rem' }}>
        <p>Debes iniciar sesión para ver tus proyectos.</p>
        <Link to="/login" className="btn">Iniciar Sesión</Link>
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

      {error && <div className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

      {loading ? (
        <div className="loading" style={{ textAlign: 'center', padding: '2rem' }}>Cargando proyectos...</div>
      ) : (
        <div className="projects-grid">
          {projects.length > 0 ? (
            projects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                // Llamar a la función local para abrir el modal
                onInviteClick={project.createdBy === currentUser?.uid ? handleOpenInviteModal : undefined}
              />
            ))
          ) : (
            <div className="no-projects" style={{ textAlign: 'center', padding: '2rem' }}>
              <p>No tienes proyectos todavía o no eres colaborador en ninguno.</p>
              <Link to="/project/new" className="btn btn-primary">
                Crear mi primer proyecto
              </Link>
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

export default MyProjectsPage;