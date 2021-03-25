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



//TODO: Look into reducing re-rendering



let TEXT_RENDERING_BOOL = true;
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


    // Circle line-drawing where circles move out in opacity to edges

    //TODO: make 'clear' tool a parameter that sets a new state -> triggers useEffect -> sets state as false
    // in order to preserve last-used-tool




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
        new Two({width:window.innerWidth, height:window.innerHeight, autostart:true, resolution:40})
    );

    //Determines whether TwoCanvas has been appended onto svgRef
    const [isLoaded, setIsLoaded] = useState(false);

    //Stores mouse coordinates
    const [mouse, setMouse] = useState([0,0]);

    //Boolean for if the mouse is currently down
    const [inUse, setInUse] = useState(false);
    const [touchInUse, setTouchInUse] = useState(false);
    const [touchID, setTouchID] = useState(-1);
    //const [wipeState, setWipeState] = useState(false);





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
        //setWipeState(wipe);
    });

    //Checks if Delete was called
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

    //Currently not being used, but ***VERY*** fun
    function getRandomColor() {
        return 'rgb('
            + Math.floor(Math.random() * 255) + ','
            + Math.floor(Math.random() * 255) + ','
            + Math.floor(Math.random() * 255) + ')';
    }

    /** Shape Stuff**/

    const dropShape = useCallback((coord) => {
        if (coord) {
            if (toolInUse === 'circle') {
                const circ = two.makeCircle(coord[0], coord[1], radius / 2);
                circ.fill = color;
                circ.noStroke();
                two.update();
                setTwo(two);
            } else if (toolInUse === 'rectangle') {
                console.log('Rectangle tool triggered')
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
                //TODO: draw a circle
            }
        } else if(toolInUse === 'circle' || toolInUse === 'rectangle'){
            dropShape(getTouchCoords(event.changedTouches[0]));
        }
    }, [toolInUse, touchInUse, dropShape]);

    const moveTouch = useCallback(
        (event) => {
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
        },
        [touchInUse, touchID, mouse, toolInUse]
    );

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
        //setWipeState(wipe);
    }, [toolInUse, touchID]);

        //Callback for when mouse is down
    const startPaint = useCallback((event) => {
            //console.log("startPaint CAlled");
            const coordinates = getsCoordinates(event);
            //console.log("getsCoordiantes returned called")
            if (toolInUse === 'pen' && coordinates) {
                setMouse(coordinates);
                setInUse(true);
                //TODO: draw a circle
            } else if(toolInUse === 'circle' || toolInUse === 'rectangle'){
                dropShape(getsCoordinates(event));
            }
        }, [toolInUse, dropShape]);

    //useEffect for startPaint
    useEffect(() => {
        if (!svgRef.current) {
            //console.log("SVG Status: "+(svgRef.current != null));
            //console.log("two load status: "+isLoaded);
            return;
        }
        const canvas = two.renderer.domElement;
        //console.log("startPaint event added")

        canvas.addEventListener('mousedown', startPaint);
        canvas.addEventListener('touchstart', startTouch);
        return () => {
            canvas.removeEventListener('touchstart', startTouch);
            canvas.removeEventListener('mousedown', startPaint);
        };
    }, [startPaint, startTouch, two, toolInUse]);

    //instantiates newMouse and draws lines
    const paint = useCallback(
        (event) => {
            //console.log("Paint Called")
            if (inUse) {
                //console.log("Paint Called w/inUse as true;")
                const newMouse = getsCoordinates(event);
                if (mouse && newMouse && (toolInUse === 'pen')) {
                    drawLine(mouse, newMouse);
                    setMouse(newMouse);
                }
            }
        },
        [inUse, mouse, toolInUse]
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
        canvas.addEventListener('touchmove', moveTouch);
        return () => {
            canvas.removeEventListener('touchmove', moveTouch);
            canvas.removeEventListener('mousemove', paint);
        };
    }, [paint, moveTouch, two, toolInUse]);

    //Triggers when the mouse is up or off the screen
    const exitPaint = useCallback(() => {


        setMouse(undefined);
        setInUse(false);
        //setWipeState(wipe);
    }, [toolInUse]);

    // const mouseUpCallback = useCallback( (event) => {
    //
    //
    //     //NOTE: In current implementation, it is the tool callback switches (mouseUpCallback,
    //     // mouseDownCallback, etc) that exit out of other tools, not the actual toolbar.
    //     exitPaint()
    //     switch(toolInUse){
    //         case "pen":
    //             //exitPaint();
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
        //canvas.addEventListener('mouseup', exitPaint);
        canvas.addEventListener('mouseleave', exitPaint);
        //canvas.addEventListener('mouseup', dropShape);

        canvas.addEventListener('touchend', endTouch);
        return () => {
            //canvas.removeEventListener('mouseup', mouseUpCallback);
            canvas.removeEventListener('touchend', endTouch);
            //canvas.removeEventListener('mouseup', exitPaint);
            canvas.removeEventListener('mouseleave', exitPaint);
            //canvas.removeEventListener('mouseup', dropShape);
        };
    }, [endTouch, touchID, exitPaint, two, toolInUse]);

    //Gets the coordinates of the mouse event
    const getsCoordinates = (event) => {
        if (!svgRef.current) {
            return;
        }
        const canvas = two.renderer.domElement;

        //Coordinate notes:
        // Don't use canvas or svgRef.current (which would normally make sense)
        // because canvas is modded via Two and doesn't work and
        // svgRef.current is just an empty component that I stick the two SVG onto



        //COORDINATES THAT WORK (3/7) (for some reason)
        // x: event.pageX, y: event.offsetY
        return [event.pageX,  event.offsetY]
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