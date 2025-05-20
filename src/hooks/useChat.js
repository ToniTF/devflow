import { useEffect, useState } from 'react';
import { db } from '../firebase/firestore'; // Asegúrate de que la ruta sea correcta
import { onSnapshot, collection, addDoc } from 'firebase/firestore';

const useChat = (projectId) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'projects', projectId, 'messages'), (snapshot) => {
            const messagesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMessages(messagesData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [projectId]);

    const sendMessage = async (message) => {
        await addDoc(collection(db, 'projects', projectId, 'messages'), message);
    };

    return { messages, loading, sendMessage };
};

export default useChat;