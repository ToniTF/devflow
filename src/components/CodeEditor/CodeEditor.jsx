import React, { useState, useEffect, useRef } from 'react';
import { Controlled as ControlledEditor } from 'react-codemirror2';

// Importaciones necesarias
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material-darker.css';
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
  const getCleanInitialValue = (val) => {
    if (typeof val === 'string') {
      // Si el valor es solo espacios/saltos de línea, o vacío, devuelve ''.
      if (val.trim() === '') {
        return '';
      }
      // De lo contrario, solo quita espacios/saltos al inicio.
      return val.trimStart();
    }
    return '';
  };

  const [value, setValue] = useState(getCleanInitialValue(initialValue));
  // Usaremos editorKey para forzar el remontaje del editor si es necesario
  const [editorKey, setEditorKey] = useState(Date.now()); 

  useEffect(() => {
    const cleanInitial = getCleanInitialValue(initialValue);
    // Si el valor inicial limpio es diferente del valor actual,
    // actualizamos el valor y cambiamos la key para forzar el remontaje.
    // Esto es una medida drástica, pero puede resolver problemas de renderizado persistentes.
    if (cleanInitial !== value) {
      setValue(cleanInitial);
      // Cambiar la key solo si el estado de "vacío" del editor cambia drásticamente
      // Por ejemplo, de tener contenido a estar vacío, o viceversa.
      const currentIsEmpty = value.trim() === '';
      const newIsEmpty = cleanInitial.trim() === '';
      if (currentIsEmpty !== newIsEmpty) {
        setEditorKey(Date.now());
      }
    }
  }, [initialValue]); // Solo depender de initialValue

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
        key={editorKey} // Usar la key para forzar el remontaje
        value={value} // Usar el estado 'value' que ya está procesado
        editorDidMount={(editor) => {
          // Un refresh inicial puede ayudar
           editor.refresh();
        }}
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
          readOnly: readOnly,
          // Asegurar que la primera línea sea 1
          firstLineNumber: 1 
        }}
        onBeforeChange={handleChange}
        className="code-editor"
      />
    </div>
  );
};

export default CodeEditor;
