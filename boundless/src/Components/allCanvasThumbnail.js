import '../Stylesheets/allCanvasThumbnail.css'
import CanvasThumbnail from "./canvasThumbnail";
import {selectLoggedIn, selectUsername} from "../Redux/loginState";
import firebase from 'firebase'
import {useSelector} from "react-redux";
import React, {useState, useEffect} from 'react';

export default function AllCanvasThumbnail() {

    const [canvasList, setCanvasList] = useState([]);
    const [test, setTest] = useState(0);
    let canvases = [CanvasThumbnail({href: '#/canvas/new', text: 'New Canvas', newCanvas: true})];
    const username = useSelector(selectUsername);

    const loadFromDB = async (databaseRef) => {
        let count = 1;
        console.log("Loading from DB");
        await databaseRef.child("users").child(username).once('value', (snapshot) => {
            snapshot.forEach((childSnapshot) => {
                let childKey = childSnapshot.key;
                canvases.push(CanvasThumbnail({
                    href: '#/canvas/' + childKey,
                    text: 'Canvas ' + count,
                    newCanvas: false
                }))
                console.log(canvases);
                ++count;
            });
        }).then(()=> {
            console.log("Finished loading");
            // setTest(2);
        }).catch((error) => {
            console.error(error);
        });
        return canvases;
    }

    useEffect(() => {
        let databaseRef = firebase.database().ref();
        loadList(databaseRef);
    }, []);

    const loadList = async (databaseRef) => {
        loadFromDB(databaseRef).then((filledCanvases) => {
            console.log("Load List: " + filledCanvases.length);
            let temp = filledCanvases.map((canvas, index) => {
                return (<div key={index}>{canvas}</div>)
            });
            console.log(temp);
            setCanvasList(temp);
            console.log("nice!");

        }).catch((error) => {
            console.error(error);
        });
    }

    // canvasList = canvases.map((canvas, index) => {
    //     return <div key={index}>{canvas}</div>
    // })
    // console.log(canvases.length);
    console.log(canvasList.length);

    return (
        <div>
            <div className='grid-container'>
                {canvasList}
            </div>
        </div>
    );
}
{
    /*
    Function takes an array of lines - any length -
    each line is an arrya of points
    each of those points is an x and y coordinate
    Takes in array adn retruns -
    if any of those lines intersect - then at that intersection point, the lines need to trade everything that is passed that..


     */
}
