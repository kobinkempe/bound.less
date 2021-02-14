import React from "react";
import firebase from "firebase/app";
import '../Stylesheets/oleTom.css';

const heyworld = () => {
    console.log("Got to heyworld\n");
    const storageRef = firebase.storage().ref();
    //const srcURL = "https://miro.medium.com/max/1400/1*pUEZd8z__1p-7ICIO1NZFA.png";
    const heyImage = (<img src="../logo.svg" className="downloadImg" alt="Tom Brady"/>);
    storageRef.child('tom_brady_kissing.jpg').getDownloadURL()
        .then((url) => {
            heyImage.setAttribute("src", url);
            console.log("URL: "+url+"\n");
        })
        .catch((error) => {
            switch(error.code) {
                case 'storage/object-not-found':
                    console.log("File doesn't exist\n");
                    break;
                case 'storage/unauthorized':
                    // User doesn't have permission to access the object
                    console.log("User doesn't have permission to access the object\n");
                    break;
                case 'storage/canceled':
                    console.log("User canceled the uploadn\n");
                    break;
                case 'storage/unknown':
                     console.log("Unknown error occurred, inspect the server response\n");
                    break;
        }
            console.log(error+"\n");
        });
    return heyImage;

}

export default heyworld;
