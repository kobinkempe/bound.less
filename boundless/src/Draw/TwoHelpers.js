import React from "react";
import {RefObject, useCallback, useEffect, useRef, useState} from 'react';
import Two from "two.js";
import {current} from "@reduxjs/toolkit";
import ReactDOM from 'react-dom'
import {useSelector} from "react-redux";
import {selectRGB} from "../Redux/rSlicePenOptions";
import svg from "two.js/src/renderers/svg";


export function makePoint(mouse){


    const v = new Two.Vector(mouse[0], mouse[1]);
    v.position = new Two.Vector().copy(v);
    return v;

}

const LINE_RES = 16;

export function fillLine(two, m1, m2, penColor, r){
    const xD = m2[0]-m1[0];
    const yD = m2[1]-m1[1];

    for(let i = 0; i<LINE_RES; ++i){
        let j = two.makeCircle(m1[0]+xD/16, m1[1]+yD/16,r);
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
