import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './config';

// Colecciones
const projectsCollection = collection(db, 'projects');

// Funciones para gestionar proyectos
export const getProjects = async () => {
  try {
    const querySnapshot = await getDocs(
      query(projectsCollection, orderBy('createdAt', 'desc'))
    );
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error al obtener proyectos:', error);
    throw error;
  }
};

export const getProjectById = async (projectId) => {
  try {
    const projectDoc = await getDoc(doc(projectsCollection, projectId));
    if (!projectDoc.exists()) {
      throw new Error('Proyecto no encontrado');
    }
    return { id: projectDoc.id, ...projectDoc.data() };
  } catch (error) {
    console.error(`Error al obtener proyecto ${projectId}:`, error);
    throw error;
  }
};

export const createProject = async (projectData, userId) => {
  try {
    const newProject = {
      ...projectData,
      createdBy: userId,
      collaborators: [userId], // El creador es el primer colaborador
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(projectsCollection, newProject);
    return { id: docRef.id, ...newProject };
  } catch (error) {
    console.error('Error al crear proyecto:', error);
    throw error;
  }
};

export const updateProject = async (projectId, projectData) => {
  try {
    const projectRef = doc(projectsCollection, projectId);
    await updateDoc(projectRef, {
      ...projectData,
      updatedAt: serverTimestamp()
    });
    return { id: projectId, ...projectData };
  } catch (error) {
    console.error(`Error al actualizar proyecto ${projectId}:`, error);
    throw error;
  }
};

export const deleteProject = async (projectId) => {
  try {
    await deleteDoc(doc(projectsCollection, projectId));
    return true;
  } catch (error) {
    console.error(`Error al eliminar proyecto ${projectId}:`, error);
    throw error;
  }
};

// Exporta la referencia a la base de datos
export { db as firestore };