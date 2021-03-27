import React from "react";
import {RefObject, useCallback, useEffect, useRef, useState} from 'react';
import Two from "two.js";
import {current} from "@reduxjs/toolkit";
import ReactDOM from 'react-dom'
import {useSelector} from "react-redux";
import {selectRGB} from "../Redux/rSlicePenOptions";
import svg from "two.js/src/renderers/svg";

//I get by with a little help(er) from my friends (me)
import {fillLine, makePoint} from "./TwoHelpers";

const TwoCanvas = ({toolInUse, wipe=false, radius, color}) => {
    /** Currently supported Tools:
     *  Pen
     *  All-Canvas Delete
     *  Place Circle
     *  Place Rectangle
     *  Change Color (implemented in CanvasPage)
     *
     *
     *
     * **/

    //TODO: Circle line-drawing where circles move out in opacity to edges
    //TODO: make 'clear' tool a parameter that sets a new state -> triggers useEffect -> sets state as false
    // in order to preserve last-used-tool
    //TODO: Look into reducing re-rendering

    /**
     * BUG LIST:
     * Create
     *
     *
     *
     * **/

    const svgRef = useRef(null);

    //Creates the 'two' object w/o mounting it to the actual DOM
    const [two, setTwo] = useState(
        new Two({width: window.outerWidth, height: window.outerHeight, autostart:true, resolution:40})
    );

    //Determines whether TwoCanvas has been appended onto svgRef
    const [isLoaded, setIsLoaded] = useState(false);

    //Stores mouse coordinates
    const [mouse, setMouse] = useState([0,0]);

    //Boolean for if the mouse is currently down
    const [inUse, setInUse] = useState(false);
    const [touchInUse, setTouchInUse] = useState(false);
    const [touchID, setTouchID] = useState(-1);

    /** TOOLS **/

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

    //Wipe Tool
    useEffect(()=>{
        if(!svgRef.current){
            return
        }

        if(wipe){
            two.clear();
            two.update();
            setTwo(two);
        }
    }, [two, svgRef, wipe /*,wipeState*/])

    const dropShape = useCallback((coord) => {
        if (coord) {
            if (toolInUse === 'circle') {
                const circ = two.makeCircle(coord[0], coord[1], radius / 2);
                circ.fill = color;
                circ.noStroke();
                two.update();
                setTwo(two);
            } else if (toolInUse === 'rectangle') {
                const rect = two.makeRectangle(coord[0], coord[1], radius, radius);
                rect.fill = color;
                rect.noStroke();
                two.update();
                setTwo(two);
            }
        }
    }, [color, radius, toolInUse, two])

    const startTouch = useCallback((event) => {
        event.preventDefault();
        if(toolInUse === 'pen' && !touchInUse){
            setTouchInUse(true);
            let thisTouch = event.changedTouches[0];
            setTouchID(thisTouch.identifier);
            let coordinates = getTouchCoords(thisTouch);
            if (coordinates) {
                setMouse(coordinates);
            }
        } else if(toolInUse === 'circle' || toolInUse === 'rectangle'){
            dropShape(getTouchCoords(event.changedTouches[0]));
        }
    }, [toolInUse, touchInUse, dropShape]);

    const moveTouch = useCallback((event) => {
        event.preventDefault();
        if (touchInUse) {
            for(let activeTouch of event.changedTouches){
                if(activeTouch.identifier === touchID){
                    const newMouse = getTouchCoords(activeTouch);
                    if (mouse && newMouse && (toolInUse === 'pen')) {
                        drawLine(mouse, newMouse);
                        setMouse(newMouse);
                    }
                }
            }

        }
    }, [touchInUse, touchID, mouse, toolInUse]);

    const endTouch = useCallback((event) => {
        event.preventDefault();
        if(event.targetTouches.length === 0){
            setMouse(undefined);
            setTouchInUse(false);
        } else {
            for(let endingTouch of event.changedTouches) {
                if (endingTouch.identifier === touchID) {
                    setTouchInUse(true);
                    setMouse(getTouchCoords(event.targetTouches[0]));
                    setTouchID(event.targetTouches[0].identifier);
                }
            }
        }
    }, [toolInUse, touchID]);

    const startMouse = useCallback((event) => {
            const coordinates = getsCoordinates(event);
            if (toolInUse === 'pen' && coordinates) {
                setMouse(coordinates);
                setInUse(true);
            } else if(toolInUse === 'circle' || toolInUse === 'rectangle'){
                dropShape(getsCoordinates(event));
            }
        }, [toolInUse, dropShape]);

    const moveMouse = useCallback((event) => {
        if (inUse) {
            const newMouse = getsCoordinates(event);
            if (mouse && newMouse && (toolInUse === 'pen')) {
                drawLine(mouse, newMouse);
                setMouse(newMouse);
            }
        }
    },[inUse, mouse, toolInUse]);

    const endMouse = useCallback(() => {
        setMouse(undefined);
        setInUse(false);
    }, [toolInUse]);

    //useEffect for startMouse
    useEffect(() => {
        if (!svgRef.current) {
            //console.log("SVG Status: "+(svgRef.current != null));
            //console.log("two load status: "+isLoaded);
            return;
        }
        const canvas = two.renderer.domElement;

        canvas.addEventListener('mousedown', startMouse);
        canvas.addEventListener('touchstart', startTouch);
        return () => {
            canvas.removeEventListener('touchstart', startTouch);
            canvas.removeEventListener('mousedown', startMouse);
        };
    }, [startMouse, startTouch, two, toolInUse]);

    //useEffect for moveMouse
    useEffect(() => {
        if (!svgRef.current) {
            //console.log("moveMouse Ev. Handle notGood")
            //console.log("SVG Status: "+(svgRef.current != null));
            //console.log("two load status: "+isLoaded);
            return;
        }
        const canvas = two.renderer.domElement;
        canvas.addEventListener('mousemove', moveMouse);
        canvas.addEventListener('touchmove', moveTouch);
        return () => {
            canvas.removeEventListener('touchmove', moveTouch);
            canvas.removeEventListener('mousemove', moveMouse);
        };
    }, [moveMouse, moveTouch, two, toolInUse]);

    //useEffect for endMouse
    useEffect(() => {
        if (!svgRef.current) {
            //console.log("MouseUp or MouseLeave Ev. Handle notGood")
            //console.log("SVG Status: "+(svgRef.current != null));
            //console.log("two load status: "+isLoaded);
            return;
        }
        const canvas = two.renderer.domElement;

        canvas.addEventListener('mouseup', endMouse);
        canvas.addEventListener('mouseleave', endMouse);

        canvas.addEventListener('touchend', endTouch);
        return () => {
            canvas.removeEventListener('touchend', endTouch);
            canvas.removeEventListener('mouseleave', endMouse);
        };
    }, [endTouch, touchID, endMouse, two, toolInUse]);

    //Gets the coordinates of the mouse event
    const getsCoordinates = (event) => {
        if (!svgRef.current) {
            return;
        }

        //Coordinate notes:
        // Don't use canvas or svgRef.current (which would normally make sense)
        // because canvas is modded via Two and doesn't work and
        // svgRef.current is just an empty component that I stick the two SVG onto

        return [event.pageX,  event.pageY]
    };

    const getTouchCoords = (touch) => {
        if (!svgRef.current) {
            return;
        }
        return [touch.pageX, touch.pageY]
    }

    const drawLine = (originalMousePosition,  newMouse) => {
        if (!svgRef.current) {
            //console.log("drawLine failed")
            //console.log("SVG Status: "+(svgRef.current != null));
            return;
        }
        const m1 = makePoint(originalMousePosition);
        const m2 = makePoint(newMouse);
        const path = two.makeCurve([m1, m2], true);
        //path.scale = .5 + (radius/100);
        path.fill = color;
        path.stroke = color;
        path.curved = true;
        setTwo(fillLine(two, originalMousePosition, newMouse, color, radius/2));
        path.linewidth = radius;
        //document.querySelector('#two-'+path.id);

        two.update();
        setTwo(two);

    };

    return (
        <div style={{overflow :"hidden" , height:'100vh', width:'100vw'}} >
            <div ref={svgRef} style={{"overflow":"hidden"}}>
            </div>
        </div>
    )
}
export default TwoCanvas;

// //Currently not being used, but ***VERY*** fun
// function getRandomColor() {
//     return 'rgb('
//         + Math.floor(Math.random() * 255) + ','
//         + Math.floor(Math.random() * 255) + ','
//         + Math.floor(Math.random() * 255) + ')';
// }

// const mouseUpCallback = useCallback( (event) => {
//
//
//     //NOTE: In current implementation, it is the tool callback switches (mouseUpCallback,
//     // mouseDownCallback, etc) that exit out of other tools, not the actual toolbar.
//     mouseEnd()
//     switch(toolInUse){
//         case "pen":
//             //mouseEnd();
//             break;
//         //Note: if stickers ever get online, this is where they should be thrown into
//         // the callback functions
//         case "circle":
//             setInUse(true)
//             dropShape(event);
//             break;
//         case "rectangle":
//             setInUse(true)
//             dropShape(event);
//             break;
//     }
// }, [inUse, toolInUse]);
