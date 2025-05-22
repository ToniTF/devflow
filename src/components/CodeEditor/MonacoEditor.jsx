import React from 'react';
import Editor from "@monaco-editor/react";
import './MonacoEditor.css';

const MonacoEditor = ({ 
  value = '', 
  language = 'javascript',
  readOnly = false,
  theme = 'vs-dark',
  onChange = () => {},
  height = "300px" 
}) => {
  
  const handleEditorChange = (newValue) => {
    onChange(newValue);
  };

  return (
    <div className="monaco-editor-container">
      <Editor
        height={height}
        defaultLanguage={language}
        defaultValue={value}
        theme={theme}
        onChange={handleEditorChange}
        options={{
          readOnly,
          minimap: { enabled: true },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          fontSize: 14,
          lineNumbers: "on",
          wordWrap: "on",
        }}
      />
    </div>
  );
};

export default MonacoEditor;
