import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useHistory } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { doc, getDoc, updateDoc, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase/config';
import ChatRoom from '../components/Chat/ChatRoom';
import TaskManager from '../components/Tasks/TaskManager'; // Añadir esta importación
import CloudinaryUploader from '../components/Files/CloudinaryUploader';
import './ProjectPage.css';

const ProjectPage = () => {
  const { id } = useParams();
  const { currentUser } = useContext(AuthContext);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filesUpdated, setFilesUpdated] = useState(false);
  const history = useHistory();

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const docRef = doc(db, 'projects', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProject({ id: docSnap.id, ...docSnap.data() });
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

    if (id) fetchProject();
  }, [id]);

  const isCollaborator = project?.collaborators?.includes(currentUser?.uid);
  const isOwner = project?.createdBy === currentUser?.uid;

  const handleFileUploaded = (fileData) => {
    setProject(prev => ({
      ...prev,
      files: [...(prev.files || []), fileData]
    }));
  };

  // Función para eliminar archivos de Cloudinary
  const handleDeleteFile = async (fileData) => {
    if (window.confirm('¿Estás seguro de eliminar este archivo?')) {
      try {
        // Solo necesitamos actualizar Firestore, no Cloudinary
        // (aunque es posible eliminar de Cloudinary con API firmada)
        const projectRef = doc(db, "projects", id);
        await updateDoc(projectRef, {
          files: arrayRemove(fileData)
        });
        
        setProject(prev => ({
          ...prev,
          files: prev.files.filter(f => f.id !== fileData.id)
        }));
      } catch (err) {
        console.error('Error al eliminar archivo:', err);
      }
    }
  };

  if (loading) return <div className="loading-container">Cargando proyecto...</div>;
  if (error) return <div className="error-container">{error}</div>;
  if (!project) return <div className="error-container">Proyecto no encontrado</div>;
  if (!currentUser) return <div className="error-container">Debes iniciar sesión para ver este proyecto</div>;
  if (!isCollaborator && !isOwner) return <div className="error-container">No tienes acceso a este proyecto</div>;

  return (
    <div className="project-detail-container">
      <div className="project-header">
        <div className="project-title">
          <h1>{project.name}</h1>
          {isOwner && (
            <div className="project-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => history.push(`/project/edit/${id}`)}
              >
                Editar
              </button>
            </div>
          )}
        </div>
        <div className="project-meta">
          <span className="project-created">
            Creado: {project.createdAt?.toDate().toLocaleDateString() || 'Fecha no disponible'}
          </span>
          <span className="project-collaborators">
            Colaboradores: {project.collaborators?.length || 1}
          </span>
        </div>
      </div>

      <div className="project-description">
        <h3>Descripción</h3>
        <p>{project.description || 'Sin descripción'}</p>
      </div>

      <div className="project-content">
        <div className="project-files">
          <h3>Archivos del proyecto</h3>
          
          {(isOwner || project.collaborators?.includes(currentUser?.uid)) && (
            <CloudinaryUploader 
              projectId={id} 
              currentUser={currentUser} 
              onFileUploaded={handleFileUploaded} 
            />
          )}
          
          <div className="files-list">
            {project.files && project.files.length > 0 ? (
              project.files.map((file) => (
                <div key={file.id} className="file-item">
                  <a href={file.url} target="_blank" rel="noopener noreferrer" className="file-link">
                    <span className="file-name">{file.name}</span>
                  </a>
                  <span className="file-size">{file.size} KB</span>
                  
                  {(isOwner || file.uploadedBy === currentUser?.uid) && (
                    <button 
                      className="btn-delete-file" 
                      onClick={() => handleDeleteFile(file)}
                      title="Eliminar archivo"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p>No hay archivos en este proyecto</p>
            )}
          </div>
        </div>

        <div className="project-chat">
          <h3>Chat del proyecto</h3>
          <ChatRoom projectId={id} />
        </div>

        {project && (
          <div className="project-tasks-section">
            <TaskManager 
              projectId={id}
              collaborators={project.collaborators || []}
              isOwner={project.createdBy === currentUser?.uid}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectPage;