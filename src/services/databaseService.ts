
import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  limit,
  getCountFromServer,
  writeBatch,
  DocumentReference,
  Firestore,
  CollectionReference
} from 'firebase/firestore';
import type { QueryConstraint, DocumentData } from './types';

// Interface for our database service
export interface IDatabaseService {
  getDoc<T>(collectionName: string, id: string): Promise<T | null>;
  getDocs<T>(collectionName: string, constraints?: QueryConstraint[]): Promise<T[]>;
  addDoc<T extends DocumentData>(collectionName: string, data: T): Promise<string>;
  setDoc(collectionName: string, id: string, data: DocumentData): Promise<void>;
  updateDoc(collectionName: string, id: string, data: Partial<DocumentData>): Promise<void>;
  deleteDoc(collectionName: string, id: string): Promise<void>;
  getCountFromServer(collectionName: string, constraints?: QueryConstraint[]): Promise<number>;
  createBatch(): IWriteBatch;
}

export interface IWriteBatch {
    set(collectionName: string, id: string | null, data: DocumentData): IWriteBatch;
    set(docRef: any, data: DocumentData): IWriteBatch;
    update(collectionName: string, id: string, data: Partial<DocumentData>): IWriteBatch;
    update(docRef: any, data: Partial<DocumentData>): IWriteBatch;
    delete(collectionName: string, id: string): IWriteBatch;
    delete(docRef: any): IWriteBatch;
    commit(): Promise<void>;
    getNativeBatch(): any;
}


// Firebase implementation of the database service
export class FirebaseDatabaseService implements IDatabaseService {
  private db: Firestore;

  constructor(db: Firestore) {
    this.db = db;
  }
  
  private applyQueryConstraints(collectionRef: CollectionReference, constraints?: QueryConstraint[]) {
    if (!constraints) return query(collectionRef);
    
    const queryArgs: any[] = [collectionRef];
    constraints.forEach(c => {
       switch(c.type) {
           case 'where':
               if(c.opStr && c.value !== undefined) queryArgs.push(where(c.fieldPath, c.opStr, c.value));
               break;
           case 'orderBy':
                queryArgs.push(orderBy(c.fieldPath, c.direction));
                break;
           case 'limit':
               if(c.limitCount) queryArgs.push(limit(c.limitCount));
               break;
       }
    });

    return query.apply(null, queryArgs);
  }

  async getDoc<T>(collectionName: string, id: string): Promise<T | null> {
    const docRef = doc(this.db, collectionName, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as T) : null;
  }

  async getDocs<T>(collectionName: string, constraints?: QueryConstraint[]): Promise<T[]> {
    const collectionRef = collection(this.db, collectionName);
    const q = this.applyQueryConstraints(collectionRef, constraints);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
  }

  async addDoc<T extends DocumentData>(collectionName: string, data: T): Promise<string> {
    const newDocRef = await addDoc(collection(this.db, collectionName), data);
    return newDocRef.id;
  }

  async setDoc(collectionName: string, id: string, data: DocumentData): Promise<void> {
    await setDoc(doc(this.db, collectionName, id), data);
  }

  async updateDoc(collectionName: string, id: string, data: Partial<DocumentData>): Promise<void> {
    await updateDoc(doc(this.db, collectionName, id), data);
  }

  async deleteDoc(collectionName: string, id: string): Promise<void> {
    await deleteDoc(doc(this.db, collectionName, id));
  }

  async getCountFromServer(collectionName: string, constraints?: QueryConstraint[]): Promise<number> {
    const collectionRef = collection(this.db, collectionName);
    const q = this.applyQueryConstraints(collectionRef, constraints);
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count;
  }

  createBatch(): IWriteBatch {
    return new FirebaseWriteBatch(this.db);
  }
}

class FirebaseWriteBatch implements IWriteBatch {
    private batch;
    private db;

    constructor(db: Firestore) {
        this.db = db;
        this.batch = writeBatch(db);
    }
    
    getNativeBatch() {
        return this.batch;
    }

    set(collectionNameOrDocRef: string | DocumentReference, idOrData: string | null | DocumentData, data?: DocumentData): IWriteBatch {
        if (typeof collectionNameOrDocRef === 'string') {
            const collectionRef = collection(this.db, collectionNameOrDocRef);
            const docRef = idOrData ? doc(collectionRef, idOrData as string) : doc(collectionRef);
            this.batch.set(docRef, data!);
        } else {
            this.batch.set(collectionNameOrDocRef, idOrData as DocumentData);
        }
        return this;
    }

    update(collectionNameOrDocRef: string | DocumentReference, idOrData: string | Partial<DocumentData>, data?: Partial<DocumentData>): IWriteBatch {
       if (typeof collectionNameOrDocRef === 'string') {
            const docRef = doc(this.db, collectionNameOrDocRef, idOrData as string);
            this.batch.update(docRef, data!);
        } else {
            this.batch.update(collectionNameOrDocRef, idOrData as Partial<DocumentData>);
        }
        return this;
    }
    
    delete(collectionNameOrDocRef: string | DocumentReference, id?: string): IWriteBatch {
         if (typeof collectionNameOrDocRef === 'string') {
            const docRef = doc(this.db, collectionNameOrDocRef, id as string);
            this.batch.delete(docRef);
        } else {
            this.batch.delete(collectionNameOrDocRef);
        }
        return this;
    }

    async commit(): Promise<void> {
        await this.batch.commit();
    }
}
