import '../Stylesheets/allCanvasThumbnail.css'
import CanvasThumbnail from "./canvasThumbnail";
import {selectLoggedIn, selectUsername} from "../Redux/loginState";
import firebase from 'firebase'
import {useSelector} from "react-redux";
import React, {useState, useEffect} from 'react';

export default function AllCanvasThumbnail() {

    let canvases = [CanvasThumbnail({href: '#/canvas/new', text: 'New Canvas', newCanvas: true})];
    const username = useSelector(selectUsername);

    const loadFromDB = async (databaseRef) => {
        let count = 1;
        console.log("Loading from DB");
        databaseRef.child("users").child(username).once('value', (snapshot) => {
            snapshot.forEach((childSnapshot) => {
                let childKey = childSnapshot.key;
                canvases.push(CanvasThumbnail({
                    href: '#/canvas/' + childKey,
                    text: 'Canvas ' + count,
                    newCanvas: false
                }))
                ++count;
            });
        }).then(()=> {
            console.log("Finished loading");
        }).catch((error) => {
            console.error(error);
        });
    }

    const [canvasList, setCanvasList] = useState([]);

    useEffect(() => {
        let databaseRef = firebase.database().ref();
        loadList(databaseRef);
    }, []);

    const loadList = async (databaseRef) => {
        loadFromDB(databaseRef).then(() => {
            console.log("Load List: " + canvases.length);
            setCanvasList(canvases.map((canvas, index) => {
                return (<div key={index}>{canvas}</div>)
            }));
            console.log("nice!");

        }).catch((error) => {
            console.error(error);
        });
    }

    // canvasList = canvases.map((canvas, index) => {
    //     return <div key={index}>{canvas}</div>
    // })
    console.log(canvases.length);

    return (
        <div>
            <div className='grid-container'>
                {canvasList}
                {console.log("Return:" + canvases.length)}
                {console.log(canvasList.length)}
            </div>
        </div>
    );
}
