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

export const PUBLIC_USER = 'Public';

function cleanPath(path){
    //Database strings can't have any of the following values: .#$[]
    let retVal = String(path);
    retVal = retVal.replace(/\./g, '');
    retVal = retVal.replace(/#/g, '');
    retVal = retVal.replace(/$/g, '');
    retVal = retVal.replace(/\[/g, '');
    retVal = retVal.replace(/]/g, '');

    if (retVal === ''){
        return ' ';
    } else {
        return retVal;
    }
}

export const addCanvas = (canvasID,
                          username = PUBLIC_USER,
                          isPublic=true,
                          onSuccess=()=>{},
                          onError=()=>{}) => {
    if(isPublic){
        database
            .child(cleanPath(username))
            .child(cleanPath(canvasID))
            .set('public')
            .then(
                ()=>{
                    if(username === PUBLIC_USER){
                        onSuccess();
                    } else {
                        database
                            .child(PUBLIC_USER)
                            .child(cleanPath(canvasID))
                            .set('public')
                            .then(onSuccess, onError);
                    }
                },
                onError);
    } else if (username !== PUBLIC_USER) {
        database
            .child(cleanPath(username))
            .child(cleanPath(canvasID))
            .set('private')
            .then(onSuccess, onError);
    }
}

export const removeCanvas = (canvasID, username=PUBLIC_USER, onSuccess=()=>{}, onError=()=>{}) => {
    database
        .child(cleanPath(username))
        .child(cleanPath(canvasID))
        .remove()
        .then(
            () => {
                if(username === PUBLIC_USER){
                    onSuccess();
                } else {
                    database
                        .child(PUBLIC_USER)
                        .child(cleanPath(canvasID))
                        .remove()
                        .then(onSuccess, onError);
                }
            },
            onError);
}

export const makeCanvasPrivate = (canvasID, username, onSuccess=()=>{}, onError=()=>{}) => {
    database
        .child(PUBLIC_USER)
        .child(cleanPath(canvasID))
        .remove()
        .then(
            ()=>{
                addCanvas(canvasID, username, false, onSuccess, onError)
            },
            onError);
}

export const makeCanvasPublic = (canvasID, username, onSuccess=()=>{}, onError=()=>{}) => {
    addCanvas(canvasID, username, true, onSuccess, onError);
}

export const canAccessCanvas = (canvasID, onSuccess, username = PUBLIC_USER, onError = ()=>{}) => {
    // You can't a return values on this... Just send a callback function to
    // onSuccess that uses the desired return value. Like so:
    //  onSuccess=(retVal) => {
    //      //use retVal, which is a boolean for if that user has the canvas
    //  }

    database
        .child(username)
        .child(canvasID)
        .once('value')
        .then(
            (val)=>{
                if(val.exists()){
                    onSuccess(true);
                } else if(username === PUBLIC_USER) {
                    onSuccess(false);
                } else {
                    database
                        .child(PUBLIC_USER)
                        .child(canvasID)
                        .once('value')
                        .then(
                            (val)=>{
                                onSuccess(val.exists());
                            }
                        );
                }
            },
            onError)
}

export default firebase;