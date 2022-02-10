import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyBQVn7AI-d01w77HBZnfPiw2NC160D0HvM',
  authDomain: 'generalremindersender.firebaseapp.com',
  projectId: 'generalremindersender',
  storageBucket: 'generalremindersender.appspot.com',
  messagingSenderId: '1072573359198',
  appId: '1:1072573359198:web:3789b24c5f5450b93400cf',
  measurementId: 'G-BBLPCXMJ3S',
};

const user_id = 0;

firebase.initializeApp(firebaseConfig);

export const db = firebase.firestore();
const storage_instance = firebase.storage();
export const auth = firebase.auth();

if (window.location.hostname === 'localhost') {
  db.useEmulator('localhost', 8080);
  auth.useEmulator('http://localhost:9099');
  storage_instance.useEmulator('localhost', 9199);
}

const storage = storage_instance.ref();

export const streamSheetsCollection = (observer: any) => {
  return db.collection(`users/${user_id}/sheets`).onSnapshot(observer);
};

export const streamUserDoc = (observer: any) => {
  return db.doc(`/users/${user_id}`).onSnapshot(observer);
};

export const streamCurrentSheetDoc = (sheet: string, observer: any) => {
  return db.doc(`/users/${user_id}/sheets/${sheet}`).onSnapshot(observer);
};

export const getCurrentSheetDoc = (sheet: string) => {
  return db.doc(`/users/${user_id}/sheets/${sheet}`).get();
};

export const updateUserDoc = (payload: Object) => {
  return db.doc(`/users/${user_id}`).update(payload);
};

type CurrentSheetDocPayload = {
  top: number;
  right: number;
  bottom: number;
  left: number;
  maxRight: number;
  maxBottom: number;
};
export const updateCurrentSheetDoc = (
  sheet: string,
  payload: CurrentSheetDocPayload
) => {
  return db.doc(`/users/${user_id}/sheets/${sheet}`).update(payload);
};

export const uploadSpreadsheet = (files: File[]) => {
  return new Promise(resolve => {
    const counter = 0;
    files.forEach(async (file: File) => {
      const ref = storage.child(file.name);
      const metadata: any = {
        customMetadata: {
          user_id: user_id,
        },
      };
      ref.put(file, metadata).then(() => {
        if (files.length - 1 === counter) {
          resolve(0);
        }
      });
      console.log(`Uploaded ${file.name} to storage`);
    });
  });
};
