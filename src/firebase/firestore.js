import { db } from './config';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

// Function to add a new project
export const addProject = async (projectData) => {
    try {
        const docRef = await addDoc(collection(db, 'projects'), projectData);
        return docRef.id;
    } catch (error) {
        console.error("Error adding project: ", error);
    }
};

// Function to get all projects
export const getProjects = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, 'projects'));
        const projects = [];
        querySnapshot.forEach((doc) => {
            projects.push({ id: doc.id, ...doc.data() });
        });
        return projects;
    } catch (error) {
        console.error("Error getting projects: ", error);
    }
};

// Function to update a project
export const updateProject = async (projectId, updatedData) => {
    try {
        const projectRef = doc(db, 'projects', projectId);
        await updateDoc(projectRef, updatedData);
    } catch (error) {
        console.error("Error updating project: ", error);
    }
};

// Function to delete a project
export const deleteProject = async (projectId) => {
    try {
        const projectRef = doc(db, 'projects', projectId);
        await deleteDoc(projectRef);
    } catch (error) {
        console.error("Error deleting project: ", error);
    }
};