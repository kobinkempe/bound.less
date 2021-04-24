import '../Stylesheets/allCanvasThumbnail.css'
import CanvasThumbnail from "./canvasThumbnail";
import {selectLoggedIn, selectUsername} from "../Redux/loginState";
import firebase from 'firebase'
import {useSelector} from "react-redux";

export default function AllCanvasThumbnail() {

    let canvases = [CanvasThumbnail({href: '#/canvas/new', text: 'New Canvas', newCanvas: true})]

    const username = useSelector(selectUsername);
    let count = 1;
    let canvasList;

    let databaseRef = firebase.database().ref();

    const loadfromDB = async () => {

        databaseRef.child("users").child(username).once('value', (snapshot) => {
            snapshot.forEach((childSnapshot) => {
                let childKey = childSnapshot.key;
                canvases.push(CanvasThumbnail({
                    href: '#/canvas/' + childKey,
                    text: 'Canvas' + count,
                    newCanvas: false
                }))
                ++count;
            });
        }).then(() => {
            console.log("Finished");
        }).catch((error) => {
            console.error(error);
        });
    }

    const loadList = async (canvases) => {
        await loadfromDB().then(() => {
            console.log(canvases.length);
            return canvases.map((canvas, index) => {
                return <div key={index}>{canvas}</div>
            });}
        )
    }

    canvasList = loadList(canvases);

    // canvasList = canvases.map((canvas, index) => {
    //     return <div key={index}>{canvas}</div>
    // })

    console.log(canvases.length);

    return (
        <div>
            <div className='grid-container'>
                {canvasList}
            </div>
        </div>
    );
}
