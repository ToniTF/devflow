const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

const generateUniqueId = () => {
    return 'id-' + Math.random().toString(36).substr(2, 16);
};

const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

export { formatDate, generateUniqueId, validateEmail };