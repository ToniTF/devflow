import React, { useEffect, useState } from 'react';
import { useChat } from '../../../hooks/useChat';
import Message from './Message';
import MessageInput from './MessageInput';

const ChatRoom = ({ projectId }) => {
    const { messages, sendMessage } = useChat(projectId);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (messages) {
            setLoading(false);
        }
    }, [messages]);

    const handleSendMessage = (message) => {
        sendMessage(message);
    };

    return (
        <div className="chat-room">
            <h2>Chat Room</h2>
            {loading ? (
                <p>Loading messages...</p>
            ) : (
                <div className="messages">
                    {messages.map((msg) => (
                        <Message key={msg.id} message={msg} />
                    ))}
                </div>
            )}
            <MessageInput onSendMessage={handleSendMessage} />
        </div>
    );
};

export default ChatRoom;