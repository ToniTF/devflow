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

// Función para obtener datos de un usuario por su ID
export const getUserById = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      
      // Priorizar el nombre de usuario de GitHub
      return { 
        id: userDoc.id, 
        ...userData,
        // Usar preferentemente el nombre de usuario de GitHub
        displayName: userData.githubUsername || userData.displayName || 'Usuario sin nombre'
      };
    } else {
      console.log(`Usuario con ID ${userId} no encontrado`);
      return { displayName: 'Usuario desconocido' };
    }
  } catch (error) {
    console.error('Error al obtener datos de usuario:', error);
    return { displayName: 'Usuario desconocido' };
  }
};

// Función para añadir un colaborador a un proyecto
export const addCollaboratorToProject = async (projectId, userId) => {
  try {
    const projectRef = doc(projectsCollection, projectId);
    const projectDoc = await getDoc(projectRef);
    
    if (!projectDoc.exists()) {
      throw new Error('Proyecto no encontrado');
    }
    
    const projectData = projectDoc.data();
    const collaborators = projectData.collaborators || [];
    
    // Verificar si el usuario ya es colaborador
    if (collaborators.includes(userId)) {
      return { success: true, message: 'Ya eres colaborador de este proyecto' };
    }
    
    // Añadir el usuario a la lista de colaboradores
    collaborators.push(userId);
    
    await updateDoc(projectRef, {
      collaborators: collaborators,
      updatedAt: serverTimestamp()
    });
    
    return { 
      success: true, 
      message: 'Te has unido al proyecto exitosamente' 
    };
  } catch (error) {
    console.error(`Error al añadir colaborador al proyecto ${projectId}:`, error);
    return { 
      success: false, 
      message: 'No se pudo unir al proyecto. Inténtalo de nuevo.' 
    };
  }
};

// Exporta la referencia a la base de datos
export { db as firestore };