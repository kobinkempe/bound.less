import React from "react";
import {RefObject, useCallback, useEffect, useRef, useState} from 'react';
import Two from "two.js";
import {current} from "@reduxjs/toolkit";
import ReactDOM from 'react-dom'
import {useSelector} from "react-redux";
import {selectRGB} from "../Redux/rSlicePenOptions";
import svg from "two.js/src/renderers/svg";


/**
 *
 * @param params
 */




const UNDO_LIMIT = 10;
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
