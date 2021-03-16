import '../Stylesheets/canvasThumbnail.css'
import firebase from "../Firebase";

export default function canvasThumbnail() {

    return (

        <div className='sheetBox'>
            <a className='sheetCaptionImage' href='/#/canvas/new'>
                <div className='newCanvas' />
            </a>
            <text>New Canvas</text>
        </div>

    )
}

/* CODE FROM STORAGE */
// var storage = firebase.storage();
// var storageRef = storage.ref();
// var spaceRef = storageRef.child('welcome.jpg');
//
// storageRef.child('welcome.jpg').getDownloadURL().then(function(url) {
//     var test = url;
//     alert(url);
//     document.querySelector('img').src = test;
// }).catch((error) => {
//     switch (error.code) {
//         case 'storage/object-not-found':
//             console.log("File doesn't exist");
//             break;
//         case 'storage/unauthorized':
//             console.log("User doesn't have permission to access object");
//             break;
//         case 'storage/canceled':
//             console.log("User cancelled upload");
//             break;
//         case 'storage/unknown':
//             console.log("Unknown Error");
//             break;
//     }
// });