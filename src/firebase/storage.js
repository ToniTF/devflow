import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from "firebase/storage";
import { updateDoc, doc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db, storage } from './config';
import { v4 as uuidv4 } from 'uuid';

// Subir un archivo
export const uploadProjectFile = async (projectId, file, userId) => {
  try {
    const fileId = uuidv4();
    const fileExtension = file.name.split('.').pop();
    const filePath = `projects/${projectId}/files/${fileId}.${fileExtension}`;
    const storageRef = ref(storage, filePath);
    
    // Subir archivo a Storage
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    
    // Guardar metadatos en Firestore
    const projectRef = doc(db, "projects", projectId);
    const fileData = {
      id: fileId,
      name: file.name,
      type: file.type,
      size: Math.round(file.size / 1024), // Tamaño en KB
      url: downloadURL,
      path: filePath,
      uploadedBy: userId,
      uploadedAt: new Date()
    };
    
    await updateDoc(projectRef, {
      files: arrayUnion(fileData)
    });
    
    return fileData;
  } catch (error) {
    console.error("Error al subir archivo:", error);
    throw error;
  }
};

// Eliminar un archivo
export const deleteProjectFile = async (projectId, fileData) => {
  try {
    // Eliminar de Storage
    const fileRef = ref(storage, fileData.path);
    await deleteObject(fileRef);
    
    // Eliminar de Firestore
    const projectRef = doc(db, "projects", projectId);
    await updateDoc(projectRef, {
      files: arrayRemove(fileData)
    });
    
    return true;
  } catch (error) {
    console.error("Error al eliminar archivo:", error);
    throw error;
  }
};