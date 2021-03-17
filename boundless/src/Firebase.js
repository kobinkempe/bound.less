import firebase from 'firebase/app';
import 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyBD3o_1XfHdCNQj8LPmT4npc1tf-jxRP3Q",
    authDomain: "bound-less-vu.firebaseapp.com",
    projectId: "bound-less-vu",
    storageBucket: "bound-less-vu.appspot.com",
    messagingSenderId: "904885000533",
    appId: "1:904885000533:web:66672c754d71ced2e237dc",
    measurementId: "G-5V26EN8R4Z"
};

firebase.initializeApp(firebaseConfig);

export const storage = firebase.storage();

export default firebase;