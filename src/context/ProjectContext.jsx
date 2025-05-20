import React, { createContext, useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';

export const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
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
  
  return (
    <ProjectContext.Provider 
      value={{ 
        projects, 
        loading,
        addProject,
        updateProject,
        deleteProject 
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};