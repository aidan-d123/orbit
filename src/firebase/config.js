import firebase from "firebase/app"
import "firebase/firestore"
import "firebase/auth"
import "firebase/storage"

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCeBqZpjw15otwKEMLZyXzzUIUXrlCaoTg",
  authDomain: "orbit-bd7f0.firebaseapp.com",
  projectId: "orbit-bd7f0",
  storageBucket: "orbit-bd7f0.appspot.com",
  messagingSenderId: "859954230324",
  appId: "1:859954230324:web:2019e28e9440981392c661",
  measurementId: "G-NGKTZ1TS1W"
};

// init firebase
firebase.initializeApp(firebaseConfig);

// init firetsore
const projectFirestore = firebase.firestore();

// init auth
const projectAuth = firebase.auth();

const projectStorage = firebase.storage();
// timestamp
const timestamp = firebase.firestore.Timestamp

export { projectAuth, projectFirestore, projectStorage, timestamp }