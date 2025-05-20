import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { AuthContext } from '../context/AuthContext';
import ProjectCard from '../components/Projects/ProjectCard';
import './Dashboard.css';

const Dashboard = () => {
  const { currentUser } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Panel de Proyectos</h1>
        <div className="dashboard-actions">
          {currentUser ? (
            <Link to="/project/new" className="btn btn-primary">
              <i className="fas fa-plus"></i> Nuevo Proyecto
            </Link>
          ) : (
            <Link to="/login" className="btn btn-primary">
              <i className="fas fa-sign-in-alt"></i> Iniciar sesión para crear proyectos
            </Link>
          )}
        </div>
      </div>

      {!currentUser && (
        <div className="login-banner">
          <p>Estás viendo proyectos públicos. Para crear proyectos o ver los tuyos privados, inicia sesión.</p>
          <Link to="/login" className="btn">Iniciar sesión</Link>
          <Link to="/register" className="btn btn-outline">Registrarse</Link>
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
    </div>
  );
};

export default Dashboard;