export const FIREBASE_CONFIG = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
};

export const ROUTES = {
    HOME: '/',
    DASHBOARD: '/dashboard',
    PROJECT: '/project/:id',
    PROFILE: '/profile',
};

export const CHAT_LIMIT = 50; // Maximum number of messages to display in chat

export const ERROR_MESSAGES = {
    AUTH: {
        LOGIN_FAILED: "Error al iniciar sesión. Por favor, inténtalo de nuevo.",
        SIGNUP_FAILED: "Error al registrarse. Por favor, inténtalo de nuevo.",
    },
    PROJECT: {
        CREATE_FAILED: "Error al crear el proyecto. Por favor, inténtalo de nuevo.",
        FETCH_FAILED: "Error al cargar los proyectos. Por favor, inténtalo de nuevo.",
    },
};