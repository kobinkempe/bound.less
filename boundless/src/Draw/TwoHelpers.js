import React, {useEffect, useState} from "react";
import Two from "two.js";
import firebase from "firebase";
import {addCanvas} from "../Firebase";

/**
 *
 * @param params
 */

const UNDO_LIMIT = 100;

export const useNumUndos = (initialAmount) => {
    const [num, setNum] = useState(initialAmount);

    const inc = () => {
        setNum(num+1);
    }

    return [num, inc];
}


export const useUndoQueue = () => {
    const [uArr, setUArr] = useState([]);



    const pushQueue = (data) => {
        if(data !== 0){
            console.log("Trying to push \""+data+"\" onto the undoQueue");
            uArr.push(data);
        }

        if(uArr.length > UNDO_LIMIT){
            uArr.shift();
        }
        setUArr(uArr);
    }

    return [uArr, pushQueue, setUArr];

}



/**
 *
 * useTwo:
 *
 * This component saves the Two instance that is drawing everything as a state, which is then
 * loaded up into the firebase to a unique folder name with the logged-in user's name.
 *
 *
 *
 * @returns {[Two, ((value: (((prevState: Two) => Two) | Two)) => void)]}
 */

export const useFirebaseSVG = (canvasPath) => {

    const [two, setTwo] = useState(new Two({width: window.outerWidth, height: window.outerHeight, autostart:true, resolution:40}));

    //console.log(canvasPath);
    let storageRef = firebase.storage().ref();
    let canvasRef = storageRef.child(canvasPath);
    canvasRef.getDownloadURL()
        .then((url) => {

            /*let xhr = new XMLHttpRequest();
            xhr.responseType = 'text';
            xhr.onload = (event) => {
                let text = xhr.response;
                console.log(text);

                let svg = two.interpret(text);
                svg.center();
                svg.translation.set(two.width / 2, two.height / 2);

            };*/
            // xhr.open('GET', url);
            // xhr.send();

            two.load(url, ((svg) => {
                svg.center();
                svg.translation.set(two.width / 2, two.height / 2);
            }));

            two.update();
            setTwo(two);
            //console.log("Reached this point");
        })
        .catch((error) => {
            switch (error.code) {
                case 'storage/object-not-found':
                    console.log("File does not exist");
                    break;
                case 'storage/unauthorized':
                    console.log("User doesn't have permission");
                    break;
                case 'storage/unknown':
                    console.log("Unknown error");
                    break;
            }
        });

    return [two, setTwo];
}

const CANV_NAME = "1"

export const useTwo = ({canvasID, isNew}) => {

    let canvasPath;

    if(firebase.auth().currentUser) {
        canvasPath = "/" + firebase.auth().currentUser.displayName + "/" + "canvas_" + CANV_NAME + ".svg";
    } else {
        canvasPath = "/public/" + "canvas_" + CANV_NAME + ".svg";
    }

    //console.log("TwoHelpers useTwo:" + canvasPath);
    //console.log("TwoHelpers useTwo:" + canvasID + ", " + isNew);

    const [two, setTwo] = useFirebaseSVG(canvasPath);

    // addCanvas("canvas_" + canvasID, firebase.auth().currentUser.displayName);

    let s = new XMLSerializer();

    useEffect(() => {
        const interval = setInterval(() => {

            let d = two.renderer.domElement;
            let str = s.serializeToString(d);

            let storageRef = firebase.storage().ref();
            let canvasRef = storageRef.child(userName);

            //TODO: Test the code below after our demo (3/29)
            //let canvasRef = storageRef.child(userName+"_1.svg");


            canvasRef.putString(str).then((snapshot) => {
                //console.log('Uploaded string');
            }).catch((error) => {
                switch (error.code) {
                    case 'storage/unauthorized':
                        console.log("You're not authorized");
                        break;
                    case 'storage/canceled':
                        console.log("User canceled upload");
                        break;
                    case 'storage/unknown':
                        console.log("Unknown error");
                        break;
                }
            })
            //console.log('Image auto-saved on cloud');
        }, 10000);

        return () => clearInterval(interval);
    }, [two]);

    //TODO: In this custom hook is where the TwoCanvas could possible be passed
    // user information into the canvas (i.e. preferences made on profile).
    return [two, setTwo]
}


//Currently not being used, but very fun
function getRandomColor() {
    return 'rgb('
        + Math.floor(Math.random() * 255) + ','
        + Math.floor(Math.random() * 255) + ','
        + Math.floor(Math.random() * 255) + ')';
}

export function makePoint(mouse){


    // v.position = new Two.Vector().copy(v);
    return new Two.Anchor(mouse[0], mouse[1]);

}

//
export const LINE_RES = 1;

export function fillLine(two, m1, m2, penColor, r){
    const xD = m2[0]-m1[0];
    const yD = m2[1]-m1[1];
    let x = m1[0];
    let y = m1[1];

    for(let i = 0; i<LINE_RES; ++i){
        x = x+ xD/LINE_RES;
        y = y+ yD/LINE_RES;
        let j = two.makeCircle(x, y,r);
        j.noStroke();
        j.fill = penColor;
    }
    two.update();
    return two;

}

/**
function createGrid(s) {

    var size = s || 30;
    var two = new Two({
        type: Two.Types.canvas,
        width: size,
        height: size
    });

    var a = two.makeLine(two.width / 2, 0, two.width / 2, two.height);
    var b = two.makeLine(0, two.height / 2, two.width, two.height / 2);
    a.stroke = b.stroke = '#6dcff6';

    two.update();
    **/

/* import React from "react";
import {RefObject, useCallback, useEffect, useRef, useState} from 'react';
import Two from "two.js";
import {current} from "@reduxjs/toolkit";
import ReactDOM from 'react-dom'
import {useSelector} from "react-redux";
import {selectRGB} from "../Redux/rSlicePenOptions";
import svg from "two.js/src/renderers/svg";







function UndoStack(){

const CANV_NAME = 1;
const storageRef = firebase.storage.ref();

/**
 *
 * useTwo:
 *
 * This component saves the Two instance that is drawing everything as a state, which is then
 * loaded up into the firebase to a unique folder name with the logged-in user's name.
 *
 *
 *
 * @returns {[Two, ((value: (((prevState: Two) => Two) | Two)) => void)]}
 */ /*
export const useTwo = ({id, isNew}) => {

    let s = new XMLSerializer();
    let userName;

    if(firebase.auth().currentUser) {
        userName = "/" + firebase.auth().currentUser.displayName + "/" + "canvas_" + id + ".svg";
        addCanvas("canvas_" + id, firebase.auth().currentUser.displayName);
    } else {
        userName = "/public/" + "canvas_" + id + ".svg";
    }

    const [two, setTwo] = isNew ?
        useState(new Two({width: window.outerWidth, height: window.outerHeight, autostart:true, resolution:40})) :
        () => {
            let canvasRef = storageRef.child(userName);
            canvasRef.getDownloadURL()
                .then((url) => {
                    two.load(url, ((svg) => {
                        svg.center();
                        svg.translation.set(two.width / 2, two.height / 2); //move to center of canvas
                    }));
                })
                .catch((error) => {
                    switch (error.code) {
                        case 'storage/object-not-found':
                            console.log("File does not exist");
                            break;
                        case 'storage/unauthorized':
                            console.log("User doesn't have permission");
                            break;
                        case 'storage/unknown':
                            console.log("Unknown error");
                            break;
                    }
                })}
}

useEffect(() => {
    const interval = setInterval(() => {

        let d = two.renderer.domElement;
        let str = s.serializeToString(d);

        let storageRef = firebase.storage().ref();
        let canvasRef = storageRef.child(userName);

        //TODO: Test the code below after our demo (3/29)
        //let canvasRef = storageRef.child(userName+"_1.svg");


        canvasRef.putString(str).then((snapshot) => {
            console.log('Uploaded string');
        }).catch((error) => {
            switch (error.code) {
                case 'storage/unauthorized':
                    console.log("You're not authorized");
                    break;
                case 'storage/canceled':
                    console.log("User canceled upload");
                    break;
                case 'storage/unknown':
                    console.log("Unknown error");
                    break;
            }
        })
        console.log('Image auto-saved on cloud');
    }, 10000);

    return () => clearInterval(interval);
}, [two]);

//TODO: In this custom hook is where the TwoCanvas could possible be passed
// user information into the canvas (i.e. preferences made on profile).
return [two, setTwo]
}

//Currently not being used, but very fun
function getRandomColor() {
    return 'rgb('
        + Math.floor(Math.random() * 255) + ','
        + Math.floor(Math.random() * 255) + ','
        + Math.floor(Math.random() * 255) + ')';
}

export function makePoint(mouse){


    const v = new Two.Vector(mouse[0], mouse[1]);
    v.position = new Two.Vector().copy(v);
    return v;

}

//
const LINE_RES = 4;

export function fillLine(two, m1, m2, penColor, r){
    const xD = m2[0]-m1[0];
    const yD = m2[1]-m1[1];

    for(let i = 0; i<LINE_RES; ++i){
        let j = two.makeCircle(m1[0]+xD/LINE_RES, m1[1]+yD/LINE_RES,r);
        j.noStroke();
        j.fill = penColor;
    }
    two.update();
    return two;

}

/**
 function createGrid(s) {

    var size = s || 30;
    var two = new Two({
        type: Two.Types.canvas,
        width: size,
        height: size
    });

    var a = two.makeLine(two.width / 2, 0, two.width / 2, two.height);
    var b = two.makeLine(0, two.height / 2, two.width, two.height / 2);
    a.stroke = b.stroke = '#6dcff6';

    two.update();
 **/
/*
    if (!isNew) {
        let canvasRef = storageRef.child(userName);
        canvasRef.getDownloadURL()
            .then((url) => {
                const [two, setTwo] = two.load(url, ((svg) => {
                    svg.center(); // center object shapes
                    svg.translation.set(two.width / 2, two.height / 2); //move to center of canvas
                }))
            })
            .catch((error) => {
                switch (error.code) {
                    case 'storage/object-not-found':
                        console.log("File does not exist");
                        break;
                    case 'storage/unauthorized':
                        console.log("User doesn't have permission");
                        break;
                    case 'storage/unknown':
                        console.log("Unknown error");
                        break;
                }
            });
    } else {
        const [two, setTwo] = useState(new Two({
            width: window.outerWidth,
            height: window.outerHeight,
            autostart: true,
            resolution: 40
        }));
    }

    useEffect(() => {
        const interval = setInterval(() => {

            let d = two.renderer.domElement;
            let str = s.serializeToString(d);

            let canvasRef = storageRef.child(userName);

            //TODO: Test the code below after our demo (3/29)
            //let canvasRef = storageRef.child(userName+"_1.svg");


            canvasRef.putString(str).then((snapshot) => {
                console.log('Uploaded string');
            }).catch((error) => {
                switch (error.code) {
                    case 'storage/unauthorized':
                        console.log("You're not authorized");
                        break;
                    case 'storage/canceled':
                        console.log("User canceled upload");
                        break;
                    case 'storage/unknown':
                        console.log("Unknown error");
                        break;
                }
            })
            console.log('Image auto-saved on cloud');
        }, 10000);

        return () => clearInterval(interval);
    }, [two]);

    //TODO: In this custom hook is where the TwoCanvas could possible be passed
    // user information into the canvas (i.e. preferences made on profile).
    return [two, setTwo]
}*/