import { 
  collection, 
  addDoc,
  doc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  where, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './config';

// Crear una nueva tarea
export const createTask = async (projectId, taskData) => {
  try {
    // Asegúrate de que la referencia a la colección sea correcta
    const tasksRef = collection(db, 'projects', projectId, 'tasks');
    
    // Prepara los datos para guardar
    const newTask = {
      title: taskData.title,
      description: taskData.description || '',
      status: taskData.status || 'pending',
      priority: taskData.priority || 'medium',
      createdBy: taskData.createdBy,
      assignedTo: taskData.assignedTo || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    // Si hay fecha límite, convertirla a timestamp
    if (taskData.dueDate) {
      newTask.dueDate = taskData.dueDate; 
    }
    
    console.log("Guardando tarea en Firestore:", newTask);
    
    // Guardar en Firestore
    const docRef = await addDoc(tasksRef, newTask);
    
    // Retornar los datos con el ID
    return {
      id: docRef.id,
      ...newTask,
      // Convertir los timestamps a Date para uso local
      createdAt: new Date(),
      updatedAt: new Date()
    };
  } catch (error) {
    console.error('Error al crear tarea:', error);
    throw error;
  }
};

// Obtener todas las tareas de un proyecto
export const getProjectTasks = async (projectId) => {
  try {
    const tasksRef = collection(db, 'projects', projectId, 'tasks');
    const q = query(tasksRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error al obtener tareas:', error);
    throw error;
  }
};

// Actualizar una tarea
export const updateTask = async (projectId, taskId, taskData) => {
  try {
    const taskRef = doc(db, 'projects', projectId, 'tasks', taskId);
    await updateDoc(taskRef, {
      ...taskData,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error al actualizar tarea:', error);
    throw error;
  }
};

// Eliminar una tarea
export const deleteTask = async (projectId, taskId) => {
  try {
    const taskRef = doc(db, 'projects', projectId, 'tasks', taskId);
    await deleteDoc(taskRef);
    return true;
  } catch (error) {
    console.error('Error al eliminar tarea:', error);
    throw error;
  }
};

// Asignar tarea a un colaborador
export const assignTask = async (projectId, taskId, userId) => {
  try {
    const taskRef = doc(db, 'projects', projectId, 'tasks', taskId);
    await updateDoc(taskRef, {
      assignedTo: userId,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error al asignar tarea:', error);
    throw error;
  }
};

// Cambiar el estado de una tarea
export const changeTaskStatus = async (projectId, taskId, status) => {
  try {
    const taskRef = doc(db, 'projects', projectId, 'tasks', taskId);
    await updateDoc(taskRef, {
      status: status,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error al cambiar estado de tarea:', error);
    throw error;
  }
};