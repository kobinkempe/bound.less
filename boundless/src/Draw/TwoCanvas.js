import {RefObject, useCallback, useEffect, useRef, useState} from 'react';
import Two from "two.js";
import {current} from "@reduxjs/toolkit";
import ReactDOM from 'react-dom'

/**
const loadHook = () =>{
    const []
}
**/


let TEXT_RENDERING_BOOL = true;
const TwoCanvas = ({width, height, canvasID}) => {
    const svgRef = useRef(null);

    const [two, setTwo] = useState(
        new Two({height:window.innerHeight, width:window.innerWidth, autostart:true})
    );

    //Determines whether TwoCanvas has been appended onto svgRef
    const [isLoaded, setIsLoaded] = useState(false);
    const [mouse, setMouse] = useState([0,0]);
    const [isDrawing, setIsDrawing] = useState(false);
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
        console.log(("Loaded Two"));
        setTwo(two.appendTo(svgRef.current));
        setIsLoaded(true);
    });
    function getRandomColor() {
        return 'rgb('
            + Math.floor(Math.random() * 255) + ','
            + Math.floor(Math.random() * 255) + ','
            + Math.floor(Math.random() * 255) + ')';
    }

    /**
    const makeCircle = useCallback((event) => {
        if(!isGood()) {
            //const two = new Two({height:height, width:width}).appendTo(svgRef.current);
            const rect = two.makeRectangle(0,0, size, size);
            rect.fill = getRandomColor();
            rect.noStroke();
            setMouse([mouse[0] + 10, mouse[1] + 10]);
            setSize(size + 2);
            console.log("click Made\n");
            two.update();
        }

    }, []);

    //Appends twoCanvas and approves loading
    useEffect(() => {
        if (!isGood()) {
            return;
        }
        const canvas  = two.renderer.domElement;
        canvas.addEventListener('mousedown', makeCircle);
        return () => {
            //canvas.removeEventListener('mousedown', makeCircle);
        };
    });
**/

    const startPaint = useCallback((event) => {
        //console.log("startPaint CAlled");
        const coordinates = getsCoordinates(event);
        //console.log("getsCoordiantes returned called")
        if (coordinates) {
            setMouse(coordinates);
            setIsDrawing(true);
        }
    }, []);

    useEffect(() => {
        if (!svgRef.current) {
            //console.log("SVG Status: "+(svgRef.current != null));
            //console.log("two load status: "+isLoaded);
            return;
        }
        //if(isLoaded) {
            const canvas = two.renderer.domElement;
            //console.log("startPaint event added")
            canvas.addEventListener('mousedown', startPaint);
            return () => {
                canvas.removeEventListener('mousedown', startPaint);
            };
        //}
    }, [startPaint, two]);

    const paint = useCallback(
        (event ) => {
            //console.log("Paint Called")
            if (isDrawing) {
                //console.log("Paint Called w/isDrawing as true;")
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
            //console.log("paint Ev. Handle notGood")
            //console.log("SVG Status: "+(svgRef.current != null));
            //console.log("two load status: "+isLoaded);
            return;
        }
            //console.log("mouseMove event added")
            const canvas = two.renderer.domElement;
            canvas.addEventListener('mousemove', paint);
            return () => {
                canvas.removeEventListener('mousemove', paint);
            };
    }, [paint, two]);

    const exitPaint = useCallback(() => {
        setIsDrawing(false);
        setMouse(undefined);
    }, []);

    useEffect(() => {
        if (!svgRef.current) {
            //console.log("MouseUp or MouseLeave Ev. Handle notGood")
            //console.log("SVG Status: "+(svgRef.current != null));
            //console.log("two load status: "+isLoaded);
            return;
        }
            const canvas = two.renderer.domElement;
            //console.log("MouseUp & mouseLEave mounted");
            canvas.addEventListener('mouseup', exitPaint);
            canvas.addEventListener('mouseleave', exitPaint);

            return () => {
                canvas.removeEventListener('mouseup', exitPaint);
                canvas.removeEventListener('mouseleave', exitPaint);
            };
    }, [exitPaint, two]);

    const getsCoordinates = (event) => {
        if (!svgRef.current) {
            //console.log("getsCoordinates failed")
            //console.log("SVG Status: "+(svgRef.current != null));
            //console.log("two load status: "+isLoaded);
            return;
        }
            //console.log("getsCoordinates called");
            const canvas = two.renderer.domElement;

        console.log("x: "+event.pageX-svgRef.current.offsetX+" y: "+event.pageY-svgRef.current.offsetY);

        //Coordinate notes:
        // Don't use canvas or svgRef.current (which would normally make sense)
        // because they're like fake parent classes wrap the actual SVG two.js
        // generates and appends

        //COORDINATES THAT WORK (3/7)
        // x: event.pageX, y: event.offsetY
        return [event.pageX,  event.offsetY]
    };

    const drawLine = (originalMousePosition,  newMouse) => {
        if (!svgRef.current) {
            //console.log("drawLine failed")
            //console.log("SVG Status: "+(svgRef.current != null));
            return;
        }
        console.log("tryan make a line");
        const path = two.makeLine(
                    originalMousePosition[0],
                    originalMousePosition[1],
                    newMouse[0],
                    newMouse[1]);
        path.stroke = "rgb(40,0,0)";
        path.curved = true;
        two.update();
        setTwo(two);

    };



    return (
            <div ref={svgRef}>
            </div>
    )
}
export default TwoCanvas;



