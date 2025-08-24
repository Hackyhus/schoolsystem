import { getStorage, ref, uploadBytes, getDownloadURL, Storage } from 'firebase/storage';

export interface IStorageService {
    uploadFile(filePath: string, file: File): Promise<{ downloadURL: string, storagePath: string }>;
    getDownloadURL(storagePath: string): Promise<string>;
}

export class FirebaseStorageService implements IStorageService {
    private storage: Storage;

    constructor(storage: Storage) {
        this.storage = storage;
    }

    async uploadFile(filePath: string, file: File): Promise<{ downloadURL:string, storagePath: string }> {
        const storageRef = ref(this.storage, filePath);
        const uploadResult = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(uploadResult.ref);
        return { downloadURL, storagePath: uploadResult.ref.fullPath };
    }
    
    async getDownloadURL(storagePath: string): Promise<string> {
        const storageRef = ref(this.storage, storagePath);
        return await getDownloadURL(storageRef);
    }
}
