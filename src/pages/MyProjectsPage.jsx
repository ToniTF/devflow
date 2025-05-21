import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ProjectContext } from '../context/ProjectContext';
import ProjectCard from '../components/Projects/ProjectCard';
import { db } from '../firebase/config';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import '../styles/MyProjects.css';

const MyProjectsPage = () => {
  const { currentUser } = useContext(AuthContext);
  const { openInviteModal } = useContext(ProjectContext);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    const fetchProjects = async () => {
      setLoading(true);
      try {
        // 1. Obtener proyectos creados por el usuario
        const createdProjectsQuery = query(
          collection(db, 'projects'),
          where('createdBy', '==', currentUser.uid)
        );

        // 2. Obtener proyectos donde el usuario es colaborador
        const collabProjectsQuery = query(
          collection(db, 'projects'),
          where('collaborators', 'array-contains', currentUser.uid)
        );

        // Ejecutar ambas consultas
        const [createdSnapshot, collabSnapshot] = await Promise.all([
          getDocs(createdProjectsQuery),
          getDocs(collabProjectsQuery)
        ]);

        // Combinar los resultados evitando duplicados
        const projectsMap = new Map();
        
        createdSnapshot.forEach(doc => {
          projectsMap.set(doc.id, { id: doc.id, ...doc.data(), isOwner: true });
        });

        collabSnapshot.forEach(doc => {
          if (!projectsMap.has(doc.id)) {
            projectsMap.set(doc.id, { id: doc.id, ...doc.data(), isOwner: false });
          }
        });

        setProjects(Array.from(projectsMap.values()));
      } catch (error) {
        console.error('Error al cargar proyectos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [currentUser]);

  return (
    <div className="my-projects-container">
      <h1>Mis proyectos</h1>

      {loading ? (
        <div className="loading-container">
          <p>Cargando proyectos...</p>
        </div>
      ) : projects.length > 0 ? (
        <div className="projects-grid">
          {projects.map(project => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              onInviteClick={project.isOwner ? (projectId, projectName) => openInviteModal(projectId, projectName) : null}
            />
          ))}
        </div>
      ) : (
        <div className="no-projects-message">
          <p>No tienes proyectos actualmente.</p>
          <p>Puedes <a href="/project/new">crear un nuevo proyecto</a> o esperar a ser invitado a colaborar.</p>
        </div>
      )}
    </div>
  );
};

export default MyProjectsPage;