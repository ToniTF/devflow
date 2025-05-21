import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { AuthContext } from '../context/AuthContext';
import ProjectCard from '../components/Projects/ProjectCard';
import InviteModal from '../components/Projects/InviteModal';
import './Dashboard.css';

const Dashboard = () => {
  const { currentUser } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedProjectName, setSelectedProjectName] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        // Consultamos todos los proyectos públicos, sin filtrar por usuario
        const projectsRef = collection(db, 'projects');
        const publicProjectsQuery = query(projectsRef, where("isPublic", "==", true));
        
        // Si el usuario está autenticado, también buscamos sus proyectos privados
        let userProjects = [];
        if (currentUser) {
          const userProjectsQuery = query(
            projectsRef, 
            where("createdBy", "==", currentUser.uid)
          );
          const userProjectsSnapshot = await getDocs(userProjectsQuery);
          userProjects = userProjectsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
        }
        
        // Obtenemos proyectos públicos
        const publicProjectsSnapshot = await getDocs(publicProjectsQuery);
        const publicProjects = publicProjectsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Combinamos proyectos y eliminamos duplicados
        const allProjects = [...userProjects];
        publicProjects.forEach(project => {
          if (!allProjects.some(p => p.id === project.id)) {
            allProjects.push(project);
          }
        });
        
        setProjects(allProjects);
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

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Panel de Proyectos</h1>
        {/* Solo mostrar el botón de crear proyecto cuando el usuario está autenticado */}
        {currentUser && (
          <div className="dashboard-actions">
            <Link to="/project/new" className="btn btn-primary">
              <i className="fas fa-plus"></i> Nuevo Proyecto
            </Link>
          </div>
        )}
      </div>

      {/* Banner simplificado para usuarios no autenticados */}
      {!currentUser && (
        <div className="login-banner">
          <p>Estás viendo proyectos públicos. Para crear proyectos o ver los tuyos privados, inicia sesión.</p>
          <Link to="/login" className="btn">Iniciar sesión</Link>
          {/* Eliminamos el botón de registro */}
        </div>
      )}

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
                isOwner={currentUser && project.createdBy === currentUser.uid}
                showInviteButton={!!currentUser}
                onInviteCollaborator={handleInviteCollaborator}
              />
            ))
          ) : (
            <div className="no-projects">
              <p>No hay proyectos disponibles.</p>
              {currentUser && (
                <Link to="/project/new" className="btn btn-primary">
                  Crear mi primer proyecto
                </Link>
              )}
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

export default Dashboard;