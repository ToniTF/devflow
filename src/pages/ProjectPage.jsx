import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useHistory } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { doc, getDoc, updateDoc, arrayRemove, arrayUnion } from 'firebase/firestore'; // Añadida importación de arrayUnion
import { db } from '../firebase/config';
import { deleteProject } from '../firebase/projects';
import ChatRoom from '../components/Chat/ChatRoom';
import TaskManager from '../components/Tasks/TaskManager';
import CloudinaryUploader from '../components/Files/CloudinaryUploader';
import CodeSnippet from '../components/CodeEditor/CodeSnippet';
import './ProjectPage.css';

const ProjectPage = () => {
  const { id } = useParams();
  const { currentUser } = useContext(AuthContext);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filesUpdated, setFilesUpdated] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
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

  // Función para iniciar el proceso de eliminación (muestra el modal)
  const handleShowDeleteConfirmation = () => {
    setShowDeleteConfirmation(true);
  };

  // Función para cancelar la eliminación
  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
  };

  // Función para confirmar y ejecutar la eliminación
  const handleConfirmDelete = async () => {
    if (!isOwner) return;
    
    try {
      setIsDeleting(true);
      await deleteProject(id);
      history.push('/my-projects');
    } catch (error) {
      console.error('Error al eliminar el proyecto:', error);
      setError('No se pudo eliminar el proyecto. Inténtalo de nuevo.');
      setIsDeleting(false);
      setShowDeleteConfirmation(false);
    }
  };

  // Para guardar snippets de código
  const handleSaveCodeSnippet = async (code, title, language, snippetId) => {
    try {
      // Si ya existe un snippet, actualizarlo en lugar de crear uno nuevo
      if (snippetId && project.codeSnippets) {
        // Primero eliminamos el snippet existente
        const updatedSnippets = project.codeSnippets.filter(s => s.id !== snippetId);
        
        // Luego creamos el snippet actualizado
        const updatedSnippet = {
          id: snippetId,
          code: code,
          language: language || 'javascript',
          title: title || 'Snippet sin título',
          createdBy: currentUser.uid,
          updatedAt: new Date()
        };
        
        // Actualizar en Firestore
        const projectRef = doc(db, "projects", id);
        await updateDoc(projectRef, {
          codeSnippets: [...updatedSnippets, updatedSnippet]
        });
        
        // Actualizar estado local
        setProject(prev => ({
          ...prev,
          codeSnippets: [...updatedSnippets, updatedSnippet]
        }));
        
        return true;
      }
      
      // Crear nuevo snippet
      const snippetData = {
        id: Date.now().toString(),
        code: code,
        language: language || 'javascript',
        title: title || 'Snippet sin título',
        createdBy: currentUser.uid,
        createdAt: new Date()
      };
      
      const projectRef = doc(db, "projects", id);
      
      // Si no hay snippets previos, inicializar el array
      if (!project.codeSnippets) {
        await updateDoc(projectRef, {
          codeSnippets: [snippetData]
        });
      } else {
        // Añadir al array existente
        await updateDoc(projectRef, {
          codeSnippets: [...project.codeSnippets, snippetData]
        });
      }
      
      // Actualizar el estado local
      setProject(prev => ({
        ...prev,
        codeSnippets: [...(prev.codeSnippets || []), snippetData]
      }));
      
      return true;
    } catch (error) {
      console.error('Error al guardar el snippet:', error);
      return false;
    }
  };
  
  // Eliminar snippet de código
  const handleDeleteSnippet = async (snippetId) => {
    try {
      if (!snippetId || !project.codeSnippets) return false;
      
      // Actualizar en Firestore
      const projectRef = doc(db, "projects", id);
      const updatedSnippets = project.codeSnippets.filter(snippet => snippet.id !== snippetId);
      
      await updateDoc(projectRef, {
        codeSnippets: updatedSnippets
      });
      
      // Actualizar estado local inmediatamente
      setProject(prev => ({
        ...prev,
        codeSnippets: prev.codeSnippets.filter(snippet => snippet.id !== snippetId)
      }));
      
      return true;
    } catch (error) {
      console.error('Error al eliminar el snippet:', error);
      return false;
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
              <button 
                className="btn btn-danger"
                onClick={handleShowDeleteConfirmation}
                disabled={isDeleting}
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar proyecto'}
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

      {/* Modal de confirmación para eliminar el proyecto */}
      {showDeleteConfirmation && (
        <div className="delete-confirmation-overlay">
          <div className="delete-confirmation-modal">
            <h2>Eliminar proyecto</h2>
            <p>¿Estás seguro de que quieres eliminar este proyecto?</p>
            <p className="delete-warning">
              Esta acción no se puede deshacer. Se eliminarán todas las tareas, mensajes y archivos asociados.
            </p>
            <div className="delete-actions">
              <button 
                className="btn btn-secondary"
                onClick={handleCancelDelete}
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button 
                className="btn btn-danger confirm-delete"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar definitivamente'}
              </button>
            </div>
          </div>
        </div>
      )}

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

        {/* Sección de snippets de código */}
        <div className="project-code-snippets">
          <h3>Snippets de código</h3>
          
          {/* Añadir nuevo snippet */}
          {(isOwner || isCollaborator) && (
            <CodeSnippet
              title="Nuevo Snippet"
              onSave={handleSaveCodeSnippet}
            />
          )}
          
          {/* Lista de snippets existentes */}
          {project.codeSnippets && project.codeSnippets.length > 0 ? (
            project.codeSnippets.map(snippet => (
              <CodeSnippet
                key={snippet.id}
                snippetId={snippet.id}
                initialCode={snippet.code}
                language={snippet.language || 'javascript'}
                title={snippet.title || 'Sin título'}
                editable={isOwner || currentUser.uid === snippet.createdBy}
                onSave={handleSaveCodeSnippet}
                onDelete={handleDeleteSnippet}
              />
            ))
          ) : (
            <p>No hay snippets de código en este proyecto</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectPage;