import { useState, useEffect } from 'react';
import { db } from '../firebase/firestore'; // Asegúrate de que la ruta sea correcta
import { collection, getDocs, addDoc } from 'firebase/firestore';

const useProjects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const projectsCollection = collection(db, 'projects');
                const projectSnapshot = await getDocs(projectsCollection);
                const projectList = projectSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setProjects(projectList);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    const addProject = async (project) => {
        try {
            const docRef = await addDoc(collection(db, 'projects'), project);
            setProjects(prevProjects => [...prevProjects, { id: docRef.id, ...project }]);
        } catch (err) {
            setError(err.message);
        }
    };

    return { projects, loading, error, addProject };
};

export default useProjects;