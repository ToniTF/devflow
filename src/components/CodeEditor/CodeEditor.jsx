import React, { useState } from 'react';
import { Controlled as ControlledEditor } from 'react-codemirror2';

// Importaciones necesarias
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material-darker.css'; // Usamos un tema más oscuro
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/htmlmixed/htmlmixed';
import 'codemirror/mode/css/css';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/addon/edit/matchbrackets';
import './CodeEditor.css';

const CodeEditor = ({ 
  initialValue = '', 
  language = 'javascript', 
  readOnly = false,
  onChange = () => {},
  height = '300px'
}) => {
  // Un solo estado para el valor del editor
  const [value, setValue] = useState(() => {
    // Limpiar cualquier salto de línea o espacio al inicio
    return typeof initialValue === 'string' 
      ? initialValue.replace(/^\s+/, '')  // Elimina espacios/saltos al inicio
      : '';
  });

  // Determinar el modo del lenguaje
  const getLanguageMode = () => {
    const modes = {
      'javascript': 'javascript',
      'html': 'htmlmixed',
      'css': 'css'
    };
    return modes[language.toLowerCase()] || 'javascript';
  };

  const handleChange = (editor, data, newValue) => {
    setValue(newValue);
    onChange(newValue);
  };

  return (
    <div className="code-editor-wrapper" style={{ height }}>
      <ControlledEditor
        value={value}
        options={{
          mode: getLanguageMode(),
          theme: 'material-darker',
          lineNumbers: true,
          lineWrapping: true,
          autoCloseBrackets: true,
          matchBrackets: true,
          tabSize: 2,
          indentUnit: 2,
          smartIndent: true,
          readOnly: readOnly
          // Eliminada la opción scrollbarStyle que causaba el error
        }}
        onBeforeChange={handleChange}
        className="code-editor"
      />
    </div>
  );
};

export default CodeEditor;
