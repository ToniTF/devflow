import React, { useEffect, useState } from "react";
// Importación corregida con la ruta relativa adecuada
import { useChat } from "../../hooks/useChat"; 
import Message from "./Message";
import MessageInput from "./MessageInput";

const ChatRoom = ({ projectId }) => {
  const { messages, loading, error, sendMessage } = useChat(projectId);
  
  if (loading) return <div className="chat-loading">Cargando mensajes...</div>;
  if (error) return <div className="chat-error">{error}</div>;
  
  return (
    <div className="chat-container">
      <div className="messages-container">
        {messages.length > 0 ? (
          messages.map(msg => <Message key={msg.id} message={msg} />)
        ) : (
          <p className="no-messages">No hay mensajes aún. ¡Sé el primero en escribir!</p>
        )}
      </div>
      <MessageInput onSendMessage={sendMessage} />
    </div>
  );
};

export default ChatRoom;