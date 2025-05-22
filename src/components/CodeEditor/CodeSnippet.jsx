import React, { useState, useEffect } from 'react';
import CodeEditor from './CodeEditor';
import './CodeSnippet.css';

const CodeSnippet = ({ 
  initialCode = '', 
  language = 'javascript', 
  title = 'Nuevo Snippet',
  snippetId = null,
  editable = true,
  onSave = null,
  onDelete = null
}) => {
  // Limpiar el código inicial de espacios/saltos al inicio
  const cleanCode = typeof initialCode === 'string' 
    ? initialCode.replace(/^\s+/, '') 
    : '';
  
  // Estado local
  const [code, setCode] = useState(cleanCode);
  const [snippetTitle, setSnippetTitle] = useState(title || 'Sin título');
  const [snippetLanguage, setSnippetLanguage] = useState(language || 'javascript');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Actualizar estado local cuando cambian las props
  useEffect(() => {
    setSnippetTitle(title);
    setSnippetLanguage(language);
    setCode(cleanCode);
  }, [title, language, cleanCode]);
  
  // Asegurar que se actualice correctamente el código
  const handleCodeChange = (newCode) => {
    setCode(newCode);
  };
  
  const handleTitleClick = () => {
    if (editable) {
      setIsEditingTitle(true);
    }
  };
  
  const handleTitleChange = (e) => {
    setSnippetTitle(e.target.value);
  };
  
  const handleTitleBlur = () => {
    setIsEditingTitle(false);
  };
  
  const handleLanguageChange = (e) => {
    setSnippetLanguage(e.target.value);
  };
  
  const handleSave = async () => {
    if (!onSave) return;
    
    setIsSaving(true);
    try {
      await onSave(code, snippetTitle, snippetLanguage, snippetId);
    } catch (error) {
      console.error('Error al guardar el snippet:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete || !snippetId) return;
    
    if (window.confirm('¿Estás seguro de que quieres eliminar este snippet?')) {
      setIsDeleting(true);
      try {
        await onDelete(snippetId);
      } catch (error) {
        console.error('Error al eliminar el snippet:', error);
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="code-snippet">
      <div className="code-snippet-header">
        <div className="code-snippet-title">
          {isEditingTitle && editable ? (
            <input
              type="text"
              value={snippetTitle}
              onChange={handleTitleChange}
              onBlur={handleTitleBlur}
              autoFocus
              className="title-input"
            />
          ) : (
            <div onClick={handleTitleClick} className={editable ? "editable-title" : ""}>
              {snippetTitle}
              {editable && <span className="edit-icon"> ✎</span>}
            </div>
          )}
        </div>
        
        <div className="code-snippet-actions">
          {editable && (
            <>
              <select 
                className="language-select"
                value={snippetLanguage}
                onChange={handleLanguageChange}
                disabled={isSaving}
              >
                <option value="javascript">JavaScript</option>
                <option value="html">HTML</option>
                <option value="css">CSS</option>
              </select>
              
              <button 
                className="btn-save-code"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? 'Guardando...' : 'Guardar'}
              </button>
              
              {snippetId && onDelete && (
                <button 
                  className="btn-delete-snippet"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  title="Eliminar snippet"
                >
                  <i className="fas fa-trash"></i> Eliminar
                </button>
              )}
            </>
          )}
        </div>
      </div>
      
      <div className="code-editor-container">
        <CodeEditor 
          initialValue={code}
          language={snippetLanguage}
          readOnly={!editable}
          onChange={handleCodeChange}
          height="250px"
        />
      </div>
    </div>
  );
};

export default CodeSnippet;
