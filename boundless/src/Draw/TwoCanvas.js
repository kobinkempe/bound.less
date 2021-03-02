import {RefObject, useCallback, useEffect, useRef, useState} from 'react';
import Two from "two.js";


const   TwoCanvas = ({width, height, canvasID}) => {
    const svgRef = useRef(null);
    const [two, setTwo] = useState(new Two({fullscreen:true}).appendTo(svgRef.current));
    const [mouse, setMouse] = useState(null);
    const [isDrawing, setIsDrawing] = useState(null);
    const [right, setRight] = useRef();
    const [left, setLeft] = useRef(false);
    const [x, setX] = useState(0);
    const [y, setY] = useState(0);
    const [size, setSize] = useState(40);



    const makeCircle = useCallback((event) => {
        const rect = two.makeRectangle(x, y, size, size);
        rect.fill = 'rgb(0,200,255)';
        rect.noStroke();
        setX(x + 10);
        setY(y + 10);
        setSize(size+2);
        two.update();
        console.log("click Made\n")
    }, []);


    useEffect(()=>{
        if(!svgRef.current){
            return
        }
        const canvas = svgRef.current;
        canvas.addEventListener('mouseDown', makeCircle);
        return () =>{
            canvas.removeEventListener('mouseDown', makeCircle);
        }


    });

    return <svg ref={svgRef} height={height} width={width}/>
}
export default TwoCanvas;
