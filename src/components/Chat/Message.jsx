import React from 'react';

const Message = ({ message, sender }) => {
    return (
        <div className="message">
            <strong>{sender}:</strong> {message}
        </div>
    );
};

export default Message;