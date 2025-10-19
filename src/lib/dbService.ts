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
  CollectionReference,
  WhereFilterOp,
  OrderByDirection
} from 'firebase/firestore';
import { db } from './firebase'; // Import the initialized db instance

type QueryConstraint = {
  type: 'where' | 'orderBy' | 'limit';
  fieldPath: string;
  opStr?: WhereFilterOp;
  value?: any;
  direction?: OrderByDirection;
  limitCount?: number;
};

const applyQueryConstraints = (collectionRef: CollectionReference, constraints?: QueryConstraint[]) => {
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
};

const getDocData = async <T>(collectionName: string, id: string): Promise<T | null> => {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as T) : null;
};

const getDocsData = async <T>(collectionName: string, constraints?: QueryConstraint[]): Promise<T[]> => {
    const collectionRef = collection(db, collectionName);
    const q = applyQueryConstraints(collectionRef, constraints);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
};

const addDocData = async (collectionName: string, data: any): Promise<string> => {
    const newDocRef = await addDoc(collection(db, collectionName), data);
    return newDocRef.id;
};

const setDocData = async (collectionName: string, id: string, data: any): Promise<void> => {
    await setDoc(doc(db, collectionName, id), data);
};

const updateDocData = async (collectionName: string, id: string, data: any): Promise<void> => {
    await updateDoc(doc(db, collectionName, id), data);
};

const deleteDocData = async (collectionName: string, id: string): Promise<void> => {
    await deleteDoc(doc(db, collectionName, id));
};

const getCount = async (collectionName: string, constraints?: QueryConstraint[]): Promise<number> => {
    const collectionRef = collection(db, collectionName);
    const q = applyQueryConstraints(collectionRef, constraints);
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count;
};

const createBatch = () => {
    const batch = writeBatch(db);

    return {
        set: (collectionName: string, id: string | null, data: any) => {
            const collectionRef = collection(db, collectionName);
            const docRef = id ? doc(collectionRef, id) : doc(collectionRef);
            batch.set(docRef, data);
            return this;
        },
        update: (collectionName: string, id: string, data: any) => {
            batch.update(doc(db, collectionName, id), data);
            return this;
        },
        delete: (collectionName: string, id: string) => {
            batch.delete(doc(db, collectionName, id));
            return this;
        },
        commit: () => batch.commit(),
    };
};

export const dbService = {
  getDoc: getDocData,
  getDocs: getDocsData,
  addDoc: addDocData,
  setDoc: setDocData,
  updateDoc: updateDocData,
  deleteDoc: deleteDocData,
  getCountFromServer: getCount,
  createBatch: createBatch,
};
