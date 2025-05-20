import firebase from 'firebase/app';
import 'firebase/auth';
import { firebaseConfig } from './config';

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();

export const signInWithGithub = async () => {
    const provider = new firebase.auth.GithubAuthProvider();
    try {
        const result = await auth.signInWithPopup(provider);
        return result.user;
    } catch (error) {
        console.error("Error during GitHub authentication:", error);
        throw error;
    }
};

export const signOut = async () => {
    try {
        await auth.signOut();
    } catch (error) {
        console.error("Error signing out:", error);
        throw error;
    }
};

export const onAuthStateChanged = (callback) => {
    return auth.onAuthStateChanged(callback);
};