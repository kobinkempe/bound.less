import {RefObject, useCallback, useEffect, useRef, useState} from 'react';
import Two from "two.js";
import {current} from "@reduxjs/toolkit";
import ReactDOM from 'react-dom'


let TEXT_RENDERING_BOOL = true;
const TwoCanvas = ({width, height, canvasID}) => {
    const svgRef = useRef(null);
    const [two, setTwo] = useState(new Two({height:height, width:width, autostart:true}));
    const [mouse, setMouse] = useState([0,0]);
    const [isDrawing, setIsDrawing] = useState(null);
    const [size, setSize] = useState(80);

    const startPaint = useCallback((event) => {
        const coordinates = getsCoordinates(event);
        if (coordinates) {
            setMouse(coordinates);
            setIsDrawing(true);
        }
    }, []);

    useEffect(() => {
        if (!svgRef.current) {
            return;
        }
        const canvas  = svgRef.current;
        canvas.addEventListener('mousedown', startPaint);
        return () => {
            canvas.removeEventListener('mousedown', startPaint);
        };
    }, [startPaint]);

    const paint = useCallback(
        (event ) => {
            if (isDrawing) {
                const newMouse = getsCoordinates(event);
                if (mouse && newMouse) {
                    drawLine(mouse, newMouse);
                    setMouse(newMouse);
                }
            }
        },
        [isDrawing, mouse]
    );

    useEffect(() => {
        if (!svgRef.current) {
            return;
        }
        const canvas  = svgRef.current;
        canvas.addEventListener('mousemove', paint);
        return () => {
            canvas.removeEventListener('mousemove', paint);
        };
    }, [paint]);

    const exitPaint = useCallback(() => {
        setIsDrawing(false);
        setMouse(undefined);
    }, []);

    useEffect(() => {
        if (!svgRef.current) {
            return;
        }
        const canvas = svgRef.current;
        canvas.addEventListener('mouseup', exitPaint);
        canvas.addEventListener('mouseleave', exitPaint);
        return () => {
            canvas.removeEventListener('mouseup', exitPaint);
            canvas.removeEventListener('mouseleave', exitPaint);
        };
    }, [exitPaint]);

    const getsCoordinates = (event) => {
        if (!svgRef.current) {
            return;
        }

        const canvas  = svgRef.current;
        return [event.pageX - canvas.offsetLeft, event.pageY - canvas.offsetTop];
    };

    const drawLine = (originalMousePosition,  newMouse) => {
        if (!svgRef.current) {
            return;
        }
        console.log("drawLine called")
        if (two.renderer === Two.Types.svg) {
            const path = two.makeLine(
                originalMousePosition[0],
                originalMousePosition[1],
                newMouse[0],
                newMouse[1]);
            path.stroke = "rgb(0,0,0)";
            path.curved = true;
            two.update();
        }
    };







    //Fallback in case of massive failure.
    /**
    const makeCircle = useCallback((event) => {

        //const two = new Two({height:height, width:width}).appendTo(svgRef.current);
        two.appendTo(svgRef.current);
        const rect = two.makeRectangle(mouse[0], mouse[1], size, size);
        rect.fill = "rgb(0,200,255)";
        rect.noStroke();
        setMouse([mouse[0]+10, mouse[1]+10]);
        setSize(size+2);
        console.log("click Made\n");
        two.update();

    }, []);

    useEffect(() => {
        if (!svgRef.current) {
            return;
        }
        const canvas  = svgRef.current;
        setTwo(new Two({fullscreen: true, autostart: true}).appendTo(svgRef.current));
        canvas.addEventListener('mousedown', makeCircle);
        return () => {
            canvas.removeEventListener('mousedown', makeCircle);
        };
    }, [makeCircle]);

     **/



    return (
            <div ref={svgRef}>
            </div>
    )
}
export default TwoCanvas;
