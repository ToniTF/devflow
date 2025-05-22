import React, { createContext, useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import InviteModal from '../components/Projects/InviteModal';

export const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedProjectName, setSelectedProjectName] = useState('');
  
  // Cargar proyectos al iniciar
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectsRef = collection(db, 'projects');
        const q = query(projectsRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const projectsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setProjects(projectsList);
        setLoading(false);
      } catch (error) {
        console.error("Error al cargar proyectos:", error);
        setLoading(false);
      }
    };
    
    fetchProjects();
  }, []);
  
  // Funciones para manipular proyectos
  const addProject = (project) => {
    setProjects(prev => [project, ...prev]);
  };
  
  const updateProject = (updatedProject) => {
    setProjects(prev => 
      prev.map(project => 
        project.id === updatedProject.id ? updatedProject : project
      )
    );
  };
  
  const deleteProject = (projectId) => {
    setProjects(prev => prev.filter(project => project.id !== projectId));
  };
  
  const updateProjectInList = (updatedProject) => {
    setProjects(prevProjects => 
      prevProjects.map(project => 
        project.id === updatedProject.id ? updatedProject : project
      )
    );
  };
  
  // Función para eliminar un proyecto del estado global
  const removeProject = (projectId) => {
    setProjects(prevProjects => prevProjects.filter(project => project.id !== projectId));
  };

  const openInviteModal = (projectId, projectName) => {
    console.log('Abriendo modal para:', projectId, projectName);
    setSelectedProjectId(projectId);
    setSelectedProjectName(projectName);
    setInviteModalOpen(true);
  };
  
  const closeInviteModal = () => {
    setInviteModalOpen(false);
  };
  
  // Proporcionar el contexto con todas las funciones
  return (
    <ProjectContext.Provider 
      value={{ 
        projects, 
        loading,
        addProject,
        updateProject,
        removeProject, 
        openInviteModal,
        closeInviteModal,
        selectedProjectId,
        selectedProjectName
      }}
    >
      {children}
      {inviteModalOpen && <InviteModal />}
    </ProjectContext.Provider>
  );
};