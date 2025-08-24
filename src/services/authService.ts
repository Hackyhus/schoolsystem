import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';

// Interface for user credentials and auth responses
export interface UserCredentials {
    email: string;
    password?: string;
}

export interface AuthResponse {
    uid: string;
    email: string | null;
}

// Interface for our authentication service
export interface IAuthService {
    createUser(credentials: UserCredentials): Promise<AuthResponse>;
    signIn(credentials: UserCredentials): Promise<AuthResponse>;
    signOut(): Promise<void>;
    onAuthStateChanged(callback: (user: User | null) => void): () => void;
}

// Firebase implementation of the authentication service
export class FirebaseAuthService implements IAuthService {
    private auth: Auth;

    constructor(auth: Auth) {
        this.auth = auth;
    }

    async createUser(credentials: UserCredentials): Promise<AuthResponse> {
        if (!credentials.password) throw new Error("Password is required for user creation.");
        const userCredential = await createUserWithEmailAndPassword(this.auth, credentials.email, credentials.password);
        const { user } = userCredential;
        return { uid: user.uid, email: user.email };
    }

    async signIn(credentials: UserCredentials): Promise<AuthResponse> {
        if (!credentials.password) throw new Error("Password is required for sign-in.");
        const userCredential = await signInWithEmailAndPassword(this.auth, credentials.email, credentials.password);
        const { user } = userCredential;
        return { uid: user.uid, email: user.email };
    }

    async signOut(): Promise<void> {
        await signOut(this.auth);
    }
    
    onAuthStateChanged(callback: (user: User | null) => void): () => void {
        return onAuthStateChanged(this.auth, callback);
    }
}
