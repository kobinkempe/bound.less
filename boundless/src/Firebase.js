import firebase from 'firebase/app';
import 'firebase/storage';
import 'firebase/auth';
import 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyBD3o_1XfHdCNQj8LPmT4npc1tf-jxRP3Q",
    authDomain: "bound-less-vu.firebaseapp.com",
    databaseURL: "https://bound-less-vu-default-rtdb.firebaseio.com",
    projectId: "bound-less-vu",
    storageBucket: "bound-less-vu.appspot.com",
    messagingSenderId: "904885000533",
    appId: "1:904885000533:web:66672c754d71ced2e237dc",
    measurementId: "G-5V26EN8R4Z"
};

firebase.initializeApp(firebaseConfig);

export const storage = firebase.storage();

export const database = firebase.database().ref('users');

export const addCanvas = (canvasID, username = 'Public', onSuccess=()=>{}, onError=()=>{}) => {
    database.child(username).child(canvasID).set('private').then(onSuccess, onError);
}

export const hasCanvas = (canvasID, username = 'Public', onSuccess=()=>{}, onError = ()=>{}) => {
    let ret = 'wait';
    database.child(username).child(canvasID).once('value',
        (snapshot) => {
            ret = snapshot.exists();
        }).then(onSuccess, onError)
    if(ret !== 'wait'){
        return ret;
    } else {
        console.log('didn\'t work');
        onError();
        return false;
    }
}

export default firebase;