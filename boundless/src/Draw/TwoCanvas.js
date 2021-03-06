import {RefObject, useCallback, useEffect, useRef, useState} from 'react';
import Two from "two.js";
import {current} from "@reduxjs/toolkit";
import ReactDOM from 'react-dom'


let TEXT_RENDERING_BOOL = true;
const TwoCanvas = ({width, height, canvasID}) => {
    const svgRef = useRef(null);

    const [two, setTwo] = useState(
        new Two({height:window.innerHeight, width:window.innerWidth, autostart:true})
    );

    //Determines whether TwoCanvas has been appended onto svgRef
    const [isLoaded, setIsLoaded] = useState(false);
    const [mouse, setMouse] = useState([0,0]);
    const [isDrawing, setIsDrawing] = useState(null);
    const [size, setSize] = useState(80);


    // Boolean for if all two stuff is loaded in
    function isGood(){
        return svgRef.current && isLoaded;
    }

    //Appends twoCanvas and approves loading
    useEffect(() => {
        if (!svgRef.current || isLoaded) {
            return;
        }
        setTwo(two.appendTo(svgRef.current));
        setIsLoaded(true);
    });


    const makeCircle = useCallback((event) => {
        if(!isGood()) {
            //const two = new Two({height:height, width:width}).appendTo(svgRef.current);
            const rect = two.makeRectangle(mouse[0], mouse[1], size, size);
            rect.fill = "rgb(0,200,255)";
            rect.noStroke();
            setMouse([mouse[0] + 10, mouse[1] + 10]);
            setSize(size + 2);
            console.log("click Made\n");
            two.update();
        }

    }, []);

    //Appends twoCanvas and approves loading
    useEffect(() => {
        if (!svgRef.current || isLoaded) {
            return;
        }
        setTwo(two.appendTo(svgRef.current));
        setIsLoaded(true);
        const canvas  = svgRef.current;
        canvas.addEventListener('mousedown', makeCircle);
        return () => {
            canvas.removeEventListener('mousedown', makeCircle());
        };
    });

    /**

    const startPaint = useCallback((event) => {
        const coordinates = getsCoordinates(event);
        console.log("startLine called")
        if (coordinates) {
            setMouse(coordinates);
            setIsDrawing(true);
        }
    }, []);

    useEffect(() => {
        if (!isGood()) {
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
        if (!isGood()) {
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
        if (!isGood()) {
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
        if (!isGood()) {
            return;
        }
        console.log("getHere");
        const canvas  = svgRef.current;
        return [event.pageX - canvas.offsetLeft, event.pageY - canvas.offsetTop];
    };

    const drawLine = (originalMousePosition,  newMouse) => {
        if (!isGood()) {
            return;
        }
        console.log("drawLine called")
        if (two.renderer === Two.Types.svg) {
            const path = two.makeLine(
                originalMousePosition[0],
                originalMousePosition[1],
                newMouse[0],
                newMouse[1]);
            path.stroke = "rgb(40,0,0)";
            path.curved = true;
            two.update();
            setTwo(two);
        }
    };
    */




    return (
            <div ref={svgRef}>
            </div>
    )
}
export default TwoCanvas;



