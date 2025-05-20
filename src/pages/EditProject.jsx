import React, { useState, useEffect, useContext } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ProjectContext } from '../context/ProjectContext';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import './NewProject.css'; // Reutilizamos los estilos del formulario de nuevos proyectos

const EditProject = () => {
    const { id } = useParams();
    const { currentUser } = useContext(AuthContext);
    const { updateProject } = useContext(ProjectContext);
    const history = useHistory();
    
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        repositoryUrl: '',
        tags: ''
    });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Cargar datos del proyecto
    useEffect(() => {
        const fetchProject = async () => {
            try {
                const docRef = doc(db, 'projects', id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const projectData = docSnap.data();
                    
                    // Verificar si el usuario es el propietario
                    if (projectData.createdBy !== currentUser?.uid) {
                        setError('No tienes permiso para editar este proyecto');
                        return;
                    }
                    
                    setFormData({
                        name: projectData.name || '',
                        description: projectData.description || '',
                        repositoryUrl: projectData.repositoryUrl || '',
                        tags: projectData.tags?.join(', ') || ''
                    });
                } else {
                    setError('Proyecto no encontrado');
                }
            } catch (err) {
                console.error('Error al cargar el proyecto:', err);
                setError('Error al cargar el proyecto');
            } finally {
                setLoading(false);
            }
        };

        if (id && currentUser) {
            fetchProject();
        } else {
            setLoading(false);
        }
    }, [id, currentUser]);

    // Redirigir si no hay usuario autenticado
    if (!currentUser) {
        history.push('/login');
        return null;
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            const projectRef = doc(db, 'projects', id);
            
            const updatedData = {
                name: formData.name,
                description: formData.description,
                repositoryUrl: formData.repositoryUrl,
                tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
                updatedAt: serverTimestamp()
            };

            // Actualizar en Firestore
            await updateDoc(projectRef, updatedData);
            
            // Actualizar en el contexto
            updateProject({ id, ...updatedData });
            
            // Redirigir a la página del proyecto
            history.push(`/project/${id}`);
        } catch (err) {
            console.error('Error al actualizar proyecto:', err);
            setError('No se pudo actualizar el proyecto. Inténtalo de nuevo.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="loading-container">Cargando datos del proyecto...</div>;
    }

    if (error) {
        return (
            <div className="error-container">
                <p>{error}</p>
                <button className="btn btn-secondary" onClick={() => history.goBack()}>
                    Volver
                </button>
            </div>
        );
    }

    return (
        <div className="new-project-container">
            <h1>Editar proyecto</h1>
            
            <form onSubmit={handleSubmit} className="new-project-form">
                <div className="form-group">
                    <label htmlFor="name">Nombre del proyecto</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>
                
                <div className="form-group">
                    <label htmlFor="description">Descripción</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        rows="4"
                    ></textarea>
                </div>
                
                <div className="form-group">
                    <label htmlFor="repositoryUrl">URL del repositorio (opcional)</label>
                    <input
                        type="url"
                        id="repositoryUrl"
                        name="repositoryUrl"
                        value={formData.repositoryUrl}
                        onChange={handleChange}
                        placeholder="https://github.com/tu-usuario/tu-repo"
                    />
                </div>
                
                <div className="form-group">
                    <label htmlFor="tags">Etiquetas (separadas por comas)</label>
                    <input
                        type="text"
                        id="tags"
                        name="tags"
                        value={formData.tags}
                        onChange={handleChange}
                        placeholder="Ej. react, javascript, firebase"
                    />
                </div>
                
                <div className="form-actions">
                    <button 
                        type="button" 
                        className="btn btn-secondary"
                        onClick={() => history.goBack()}
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit" 
                        className="btn btn-primary"
                        disabled={submitting}
                    >
                        {submitting ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditProject;