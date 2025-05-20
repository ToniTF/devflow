import React, { useState } from 'react';
import { uploadProjectFile } from '../../firebase/storage';
import './FileUploader.css';

const FileUploader = ({ projectId, currentUser, onFileUploaded }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
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
    
    try {
      const fileData = await uploadProjectFile(projectId, file, currentUser.uid);
      setFile(null);
      onFileUploaded(fileData);
    } catch (err) {
      setError('Error al subir el archivo. Inténtalo de nuevo.');
      console.error(err);
    } finally {
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

export default FileUploader;