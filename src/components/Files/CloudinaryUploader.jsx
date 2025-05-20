import React, { useState } from 'react';
import { updateDoc, doc, arrayUnion } from 'firebase/firestore';
import { db } from '../../firebase/config';
import './FileUploader.css';

const CloudinaryUploader = ({ projectId, currentUser, onFileUploaded }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Actualiza con tus valores de Cloudinary
  const CLOUDINARY_CLOUD_NAME = 'ddpbj2dao';
  const CLOUDINARY_UPLOAD_PRESET = 'ihunvirj';
  
  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };
  
  const handleUpload = async () => {
    if (!file) {
      setError('Por favor selecciona un archivo');
      return;
    }
    
    // Validar tamaño máximo (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('El archivo es demasiado grande. Máximo 10MB.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    // Crear el formulario para subir a Cloudinary
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', `devflow/projects/${projectId}`);
    
    try {
      // Subir a Cloudinary
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }
      
      // Crear el objeto del archivo
      const fileData = {
        id: data.public_id,
        name: file.name,
        type: file.type,
        size: Math.round(file.size / 1024), // Tamaño en KB
        url: data.secure_url,
        uploadedBy: currentUser.uid,
        uploadedAt: new Date()
      };
      
      // Guardar metadatos en Firestore
      const projectRef = doc(db, "projects", projectId);
      await updateDoc(projectRef, {
        files: arrayUnion(fileData)
      });
      
      // Informar al componente padre
      onFileUploaded(fileData);
      
      // Limpiar estado
      setFile(null);
      setLoading(false);
    } catch (err) {
      console.error("Error al subir archivo:", err);
      setError('Error al subir archivo. Inténtalo de nuevo.');
      setLoading(false);
    }
  };
  
  return (
    <div className="file-uploader">
      <input 
        type="file" 
        onChange={handleFileChange}
        disabled={loading}
      />
      
      {file && (
        <div className="selected-file">
          <span>{file.name}</span>
          <span className="file-size">({Math.round(file.size / 1024)} KB)</span>
        </div>
      )}
      
      {error && <p className="error-message">{error}</p>}
      
      <button 
        className="btn btn-primary upload-btn"
        onClick={handleUpload}
        disabled={!file || loading}
      >
        {loading ? 'Subiendo...' : 'Subir archivo'}
      </button>
    </div>
  );
};

export default CloudinaryUploader;