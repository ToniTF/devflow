import { useState, useEffect } from 'react';
import { firestore } from '../firebase/firestore';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
} from '../firebase/firestore';

export const useProjects = (userId = null) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar todos los proyectos o solo los del usuario actual
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        const projectsData = await getProjects(userId);
        setProjects(projectsData);
        setLoading(false);
      } catch (err) {
        console.error("Error al cargar proyectos:", err);
        setError("No se pudieron cargar los proyectos");
        setLoading(false);
      }
    };

    loadProjects();
  }, [userId]);

  // Funciones para manipular proyectos
  const addProject = async (projectData, currentUserId) => {
    try {
      const newProject = await createProject(projectData, currentUserId);
      setProjects(prev => [newProject, ...prev]);
      return newProject;
    } catch (err) {
      setError("No se pudo crear el proyecto");
      throw err;
    }
  };

  const editProject = async (projectId, projectData) => {
    try {
      const updatedProject = await updateProject(projectId, projectData);
      setProjects(prev => 
        prev.map(project => project.id === projectId 
          ? { ...project, ...updatedProject } 
          : project
        )
      );
      return updatedProject;
    } catch (err) {
      setError("No se pudo actualizar el proyecto");
      throw err;
    }
  };

  const removeProject = async (projectId) => {
    try {
      await deleteProject(projectId);
      setProjects(prev => prev.filter(project => project.id !== projectId));
      return true;
    } catch (err) {
      setError("No se pudo eliminar el proyecto");
      throw err;
    }
  };

  return {
    projects,
    loading,
    error,
    addProject,
    editProject,
    removeProject
  };
};