import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useHistory } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import ChatRoom from '../components/Chat/ChatRoom';
import './ProjectPage.css';

const ProjectPage = () => {
  const { id } = useParams();
  const { currentUser } = useContext(AuthContext);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
              <button className="btn btn-secondary">Editar</button>
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
          <div className="files-list">
            {project.files && project.files.length > 0 ? (
              project.files.map((file, index) => (
                <div key={index} className="file-item">
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">{file.size} KB</span>
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
      </div>
    </div>
  );
};

export default ProjectPage;