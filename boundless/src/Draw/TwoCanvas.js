import {RefObject, useCallback, useEffect, useRef, useState} from 'react';
import Two from "two.js";
import {current} from "@reduxjs/toolkit";
import ReactDOM from 'react-dom'


const TwoCanvas = ({width, height, canvasID}) => {
    const svgRef = useRef(null);
    const [two, setTwo] = useState(null);
    const [mouse, setMouse] = useState(null);
    const [isDrawing, setIsDrawing] = useState(null);
    const [x, setX] = useState(0);
    const [y, setY] = useState(0);
    const [size, setSize] = useState(80);



    const makeCircle = useCallback((event) => {



        setTwo(new Two({fullscreen:true }).appendTo(svgRef.current));
        const rect = two.makeRectangle(x, y, size, size);
        rect.fill = "rgb(0,200,255)";
        rect.noStroke();
        setX(x + 10);
        setY(y + 10);
        setSize(size+2);
        two.update();
        console.log("click Made\n");



    }, []);


    useEffect(()=>{
        if(!svgRef.current){
            return
        }
        const canvas = svgRef.current;
            canvas.addEventListener('mousedown', makeCircle);
            return () => {
                canvas.removeEventListener('mousedown', makeCircle);
            }
    });

    return (
    <div>
    <svg ref={svgRef} height={height} width={width}/>
    </div>)
}
export default TwoCanvas;
