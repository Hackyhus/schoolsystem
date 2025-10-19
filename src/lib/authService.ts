import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase'; // Import the initialized auth instance

export interface UserCredentials {
    email: string;
    password?: string;
}

export interface AuthResponse {
    uid: string;
    email: string | null;
}

const createUser = async (credentials: UserCredentials): Promise<AuthResponse> => {
    if (!credentials.password) throw new Error("Password is required for user creation.");
    const userCredential = await createUserWithEmailAndPassword(auth, credentials.email, credentials.password);
    const { user } = userCredential;
    return { uid: user.uid, email: user.email };
};

const signIn = async (credentials: UserCredentials): Promise<AuthResponse> => {
    if (!credentials.password) throw new Error("Password is required for sign-in.");
    const userCredential = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
    const { user } = userCredential;
    return { uid: user.uid, email: user.email };
};

const doSignOut = async (): Promise<void> => {
    await signOut(auth);
};

const onAuthChange = (callback: (user: User | null) => void): (() => void) => {
    return onAuthStateChanged(auth, callback);
};

export const authService = {
    createUser,
    signIn,
    signOut: doSignOut,
    onAuthStateChanged: onAuthChange,
};
