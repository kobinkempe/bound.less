import React from "react";
import {RefObject, useCallback, useEffect, useRef, useState} from 'react';
import Two from "two.js";
import {current} from "@reduxjs/toolkit";
import ReactDOM from 'react-dom'
import {useSelector} from "react-redux";
import {selectRGB} from "../Redux/rSlicePenOptions";
import svg from "two.js/src/renderers/svg";
import firebase from "firebase";
import {selectLoggedIn} from "../Redux/loginState";


/**
 *
 * @param params
 */




const UNDO_LIMIT = 10;

export const useNumUndos = (initialAmount) => {
    const [num, setNum] = useState(initialAmount);

    const inc = () => {
        setNum(num+1);
    }

    return [num, inc];
}


export const useUndoQueue = () => {
    const [uArr, setUArr] = useState([]);


    function queueAction(command) {
        if(command === 'top'){
            return uArr[uArr.length-1];
        } else if(command === 'pop'){
            const j = uArr.pop();
            setUArr(uArr);
            console.log("Next Undo is: "+j+" paths long");
            return j;
        }
    }

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

    return [uArr, pushQueue, queueAction];

}


const CANV_NAME = 1;
export const useTwo = () => {
    const [two, setTwo] = useState(new Two({width: window.outerWidth, height: window.outerHeight, autostart:true, resolution:40}))

    let s = new XMLSerializer();
    let userName;

    if(firebase.auth().currentUser) {
        userName = "/" + firebase.auth().currentUser.displayName + "/" + "canvas_" + CANV_NAME + ".svg";
    } else {
        userName = "/public/" + "canvas_" + CANV_NAME + ".svg";
    }

    useEffect(() => {
        const interval = setInterval(() => {

            let d = two.renderer.domElement;
            let str = s.serializeToString(d);

            let storageRef = firebase.storage().ref();
            let canvasRef = storageRef.child("canvas1.svg");

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
            console.log('This will run every 10 seconds!');
        }, 10000);

        return () => clearInterval(interval);
    }, [two]);

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
