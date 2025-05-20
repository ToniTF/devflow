import React, { useState } from 'react';

const MessageInput = ({ onSend }) => {
    const [message, setMessage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (message.trim()) {
            onSend(message);
            setMessage('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="message-input">
            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escribe tu mensaje..."
                className="input-message"
            />
            <button type="submit" className="send-button">Enviar</button>
        </form>
    );
};

export default MessageInput;