import React, { useState, useEffect } from 'react';
// Cambiar la importación de CodeEditor a MonacoEditor
import MonacoEditor from './MonacoEditor'; 
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
  const [code, setCode] = useState(initialCode); 
  const [snippetTitle, setSnippetTitle] = useState(title);
  const [snippetLanguage, setSnippetLanguage] = useState(language);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setSnippetTitle(title);
    setSnippetLanguage(language);
    // MonacoEditor usa 'defaultValue' para el contenido inicial,
    // por lo que no necesitamos limpiar el 'code' aquí de la misma manera.
    // El estado 'code' se usa para pasar el valor actual y para la lógica de guardado.
    if (initialCode !== code) {
      setCode(initialCode);
    }
  }, [title, language, initialCode]);
  
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
      // Asegurarse de que 'code' tenga el valor más reciente del editor
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
                {/* Añadir más lenguajes si MonacoEditor los soporta y los necesitas */}
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
        {/* Usar MonacoEditor en lugar de CodeEditor */}
        <MonacoEditor 
          value={code} // MonacoEditor usa 'value' (o defaultValue para no controlado)
          language={snippetLanguage}
          readOnly={!editable}
          onChange={handleCodeChange} // Conectar el onChange
          height="250px"
          theme="vs-dark" // Coincide con tu preferencia de tema oscuro
        />
      </div>
    </div>
  );
};

export default CodeSnippet;
