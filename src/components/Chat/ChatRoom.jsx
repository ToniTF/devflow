import React, { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { sendMessage, listenToMessages } from "../../firebase/chat";
import { getUserById } from "../../firebase/firestore";
import "./ChatRoom.css";

const ChatRoom = ({ projectId }) => {
  const { currentUser } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState({});
  const messagesEndRef = useRef(null);

  // 1. Efecto para cargar mensajes - se ejecuta solo cuando cambia projectId
  useEffect(() => {
    let unsubscribe = null;

    const setupListener = async () => {
      if (!projectId) return;

      try {
        setLoading(true);
        unsubscribe = listenToMessages(projectId, (updatedMessages) => {
          setMessages(updatedMessages);
          setLoading(false);
        });
      } catch (error) {
        console.error("Error al escuchar mensajes:", error);
        setLoading(false);
      }
    };

    setupListener();

    return () => {
      if (unsubscribe && typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [projectId]);

  // 2. Efecto para cargar datos de usuarios - separado del efecto de mensajes
  useEffect(() => {
    if (!messages.length) return;

    const fetchUsers = async () => {
      const uniqueUserIds = [...new Set(messages.map((msg) => msg.sender))];
      const usersToLoad = uniqueUserIds.filter((userId) => !users[userId]);

      if (!usersToLoad.length) return;

      const newUsers = {};
      for (const userId of usersToLoad) {
        try {
          const userData = await getUserById(userId);
          if (userData) {
            newUsers[userId] = userData;
          }
        } catch (error) {
          console.error(`Error al cargar usuario ${userId}:`, error);
        }
      }

      if (Object.keys(newUsers).length > 0) {
        setUsers((prev) => ({ ...prev, ...newUsers }));
      }
    };

    fetchUsers();
  }, [messages]);

  // 3. Efecto para scroll automático
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Manejador de envío de mensajes
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser) return;

    try {
      await sendMessage(projectId, currentUser.uid, newMessage);
      setNewMessage("");
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
    }
  };

  if (!currentUser) {
    return (
      <div className="chat-unauthorized">
        Debes iniciar sesión para usar el chat
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {loading ? (
          <div className="chat-loading">Cargando mensajes...</div>
        ) : messages.length > 0 ? (
          messages.map((message) => (
            <div
              key={message.id}
              className={`message ${
                message.sender === currentUser.uid
                  ? "own-message"
                  : "other-message"
              }`}
            >
              <div className="message-header">
                <span className="sender-name">
                  {users[message.sender]?.displayName || "Usuario"}
                </span>
                <span className="message-time">
                  {message.createdAt
                    ? new Date(message.createdAt.toDate()).toLocaleTimeString()
                    : ""}
                </span>
              </div>
              <div className="message-content">{message.content}</div>
            </div>
          ))
        ) : (
          <div className="no-messages">
            No hay mensajes aún. ¡Sé el primero en escribir!
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="chat-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="chat-input"
        />
        <button
          type="submit"
          className="send-button"
          disabled={!newMessage.trim()}
        >
          Enviar
        </button>
      </form>
    </div>
  );
};

export default ChatRoom;