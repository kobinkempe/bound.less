import {RefObject, useCallback, useEffect, useRef, useState} from 'react';
import Two from "two.js";
import {current} from "@reduxjs/toolkit";
import ReactDOM from 'react-dom'


let TEXT_RENDERING_BOOL = true;
const TwoCanvas = ({/** Where we're going? We don't need props**/}) => {
    const svgRef = useRef(null);

    //Creates the 'two' object w/o mounting it to the actual DOM
    const [two, setTwo] = useState(
        new Two({height:window.innerHeight, width:window.innerWidth, autostart:true})
    );

    //Determines whether TwoCanvas has been appended onto svgRef
    const [isLoaded, setIsLoaded] = useState(false);

    //Stores mouse coordinates
    const [mouse, setMouse] = useState([0,0]);

    //Boolean for if the mouse is currently down
    const [isDrawing, setIsDrawing] = useState(false);



    /** QUICK TIPS
     *  - So the wait I implemented this is primarily with
     *  useEffect + Callback pairings.
     *
     *  useEffect is called EVERY TIME THE DOM IS RENDERED and returns
     *  when the dom is dismounted.
     *
     *  useCallbacks are useEffects that only render when any of their dependencies
     *  change, so best practice is to have them depend on certain state booleans
     *
     *
     * **/

    //Appends twoCanvas and approves loading
    useEffect(() => {
        if (!svgRef.current || isLoaded) {
            return;
        }
        console.log(("Loaded Two"));
        setTwo(two.appendTo(svgRef.current));
        setIsLoaded(true);
    });

    //Currently not being used, but very fun
    function getRandomColor() {
        return 'rgb('
            + Math.floor(Math.random() * 255) + ','
            + Math.floor(Math.random() * 255) + ','
            + Math.floor(Math.random() * 255) + ')';
    }


    //Callback for when mouse is down
    const startPaint = useCallback((event) => {
        //console.log("startPaint CAlled");
        const coordinates = getsCoordinates(event);
        //console.log("getsCoordiantes returned called")
        if (coordinates) {
            setMouse(coordinates);
            setIsDrawing(true);
        }
    }, []);

    //useEffect for startPaint
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

    //instantiates newMouse and draws lines
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

    //useEffect for paint
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

    //Triggers when the mouse is up or off the screen
    const exitPaint = useCallback(() => {
        setIsDrawing(false);
        setMouse(undefined);
    }, []);

    //useEffect for exitPaint
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

    //Gets the coordinates of the mouse event
    const getsCoordinates = (event) => {
        if (!svgRef.current) {
            //console.log("getsCoordinates failed")
            //console.log("SVG Status: "+(svgRef.current != null));
            //console.log("two load status: "+isLoaded);
            return;
        }
            //console.log("getsCoordinates called");
            const canvas = two.renderer.domElement;

        console.log("x: "+event.pageX +" y: "+event.offsetY);

        //Coordinate notes:
        // Don't use canvas or svgRef.current (which would normally make sense)
        // because canvas is modded via Two and doesn't work and
        // svgRef.current is just an empty component that I stick the two SVG onto



        //COORDINATES THAT WORK (3/7) (for some reason)
        //
        //
        //
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



