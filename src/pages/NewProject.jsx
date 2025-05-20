import React, { useState, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ProjectContext } from '../context/ProjectContext';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import './NewProject.css';

const NewProject = () => {
    const { currentUser } = useContext(AuthContext);
    const { addProject } = useContext(ProjectContext);
    const history = useHistory();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        repositoryUrl: '',
        tags: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isPublic, setIsPublic] = useState(false); // Nuevo estado para público/privado

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
        setLoading(true);
        setError(null);

        try {
            const projectData = {
                name: formData.name.trim(),
                description: formData.description.trim(),
                repositoryUrl: formData.repositoryUrl,
                tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
                createdBy: currentUser.uid,
                collaborators: [currentUser.uid],
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                isPublic: isPublic // Incluir el valor seleccionado por el usuario
            };

            // Guardar en Firestore
            const docRef = await addDoc(collection(db, 'projects'), projectData);
            
            // Actualizar el contexto
            addProject({ id: docRef.id, ...projectData });
            
            // Redirigir a la página del proyecto
            history.push(`/project/${docRef.id}`);
        } catch (err) {
            console.error('Error al crear proyecto:', err);
            setError('No se pudo crear el proyecto. Inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="new-project-container">
            <h1>Crear nuevo proyecto</h1>
            
            {error && <div className="error-message">{error}</div>}
            
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
                        placeholder="Ej. Mi Aplicación Web"
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
                        placeholder="Describe brevemente tu proyecto..."
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
                
                <div className="form-group">
                    <label className="privacy-label">
                        <input
                            type="checkbox"
                            checked={isPublic}
                            onChange={(e) => setIsPublic(e.target.checked)}
                            className="privacy-checkbox"
                        />
                        <span>Hacer este proyecto público (visible para todos)</span>
                    </label>
                    <p className="privacy-hint">
                        Los proyectos públicos aparecen en la página principal y pueden ser vistos por cualquier persona.
                        Los proyectos privados solo son visibles para ti y tus colaboradores.
                    </p>
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
                        disabled={loading}
                    >
                        {loading ? 'Creando...' : 'Crear proyecto'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default NewProject;