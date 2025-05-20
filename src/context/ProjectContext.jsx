import React, { createContext, useState, useEffect } from 'react';
import { firestore } from '../firebase/firestore';

export const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = firestore.collection('projects').onSnapshot(snapshot => {
            const projectsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setProjects(projectsData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const addProject = async (project) => {
        await firestore.collection('projects').add(project);
    };

    const inviteCollaborator = async (projectId, collaboratorEmail) => {
        await firestore.collection('projects').doc(projectId).update({
            collaborators: firestore.FieldValue.arrayUnion(collaboratorEmail)
        });
    };

    return (
        <ProjectContext.Provider value={{ projects, loading, addProject, inviteCollaborator }}>
            {children}
        </ProjectContext.Provider>
    );
};