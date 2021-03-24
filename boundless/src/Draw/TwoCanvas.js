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





const UNDO_LIMIT = 10;

const undoStack = [];

//TODO: Look into Two.Group serializable



const TwoCanvas = ({toolInUse, wipe=false, radius, color, undo=false}) => {




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
    const [isTwoLoaded, setIsTwoLoaded] = useState(false);

    //Stores mouse coordinates
    const [mouse, setMouse] = useState([0,0]);


    //Boolean for if the mouse is currently down
    const [inUse, setInUse] = useState(false);

    //Undo variables
    const [isUndoLoaded, setIsUndoLoaded] = useState([new Two.Group()]);

    const [group, setGroup] = useState(null);
    const [lastGroup, setLastGroup] = useState( );





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
        if(!svgRef.current || isTwoLoaded) {
            return;
        }
        console.log(("Loaded Two"));
        const two = new Two();
        setTwo(two.appendTo(svgRef.current));
        setLastGroup(two.scene);

        setIsTwoLoaded(true);
    });

    /*
    //Loads in Undo array
    useEffect(() =>{
        if(!svgRef.current)
    })
*/
    //Checks if Delete was called
    useEffect(()=>{
        if(!svgRef.current){
            return
        }

        if(wipe){
            lastGroup.add(two.scene);
            setLastGroup(lastGroup);
            undoStack.push(lastGroup);
            two.clear();
            two.update();
            setTwo(two);
            //wipe=false;
        }
    }, [two, svgRef, wipe, lastGroup, undoStack])



    //Checks if undo was called
    useEffect(()=>{
        if(!svgRef.current){
            return
        }

        if(undo && isTwoLoaded && undoStack.length > 0){
            undoStack.pop();
            two.scene=undoStack[undoStack.length-1];
            two.update();
            setTwo(two);
            //wipe=false;
        }
    }, [two, svgRef, wipe])



    /** Shape Stuff**/





    //Callback for when mouse is down
    const startPaint = useCallback((event) => {
        //console.log("startPaint CAlled");
        const coordinates = getsCoordinates(event);
        //console.log("getsCoordiantes returned called")
        if (coordinates) {
            setMouse(coordinates);
            setInUse(true);
        }
    }, [toolInUse]);

    //useEffect for startPaint
     useEffect(() => {
        if (!svgRef.current) {
            //console.log("SVG Status: "+(svgRef.current != null));
            //console.log("two load status: "+isTwoLoaded);
            return;
        }
            const canvas = two.renderer.domElement;
            //console.log("startPaint event added")

            canvas.addEventListener('mousedown', startPaint);
            canvas.addEventListener('touchstart', startPaint);
            return () => {
                canvas.removeEventListener('touchstart', startPaint);
                canvas.removeEventListener('mousedown', startPaint);
            };
    }, [startPaint, two, toolInUse]);

    //instantiates newMouse and draws lines
    const paint = useCallback(
        (event ) => {
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
            //console.log("two load status: "+isTwoLoaded);
            return;
        }
            //console.log("mouseMove event added")
            const canvas = two.renderer.domElement;
            canvas.addEventListener('mousemove', paint);
            canvas.addEventListener('touchmove', paint);
        return () => {
                canvas.removeEventListener('touchmove', paint);
                canvas.removeEventListener('mousemove', paint);
            };
    }, [paint, two, toolInUse]);

    //Triggers when the mouse is up or off the screen
    const exitPaint = useCallback(() => {


        setMouse(undefined);
        setInUse(false);

        if(isUndoLoaded.length > 0 && isTwoLoaded){
            setLastGroup(two.scene);
            undoStack.push(lastGroup);

            setLastGroup(new Two.Group());
            if(undoStack.length > 10){
                undoStack.shift();
            }
            setIsUndoLoaded(undoStack);
        }
    }, [toolInUse, lastGroup, undoStack]);


    const dropShape = useCallback((event) => {
        //if(inUse) {
                const newMouse = getsCoordinates(event);
                if(newMouse){
                    if(toolInUse === 'circle') {
                        console.log('Circle tool triggered');
                        const circ = two.makeCircle(newMouse[0], newMouse[1], radius/2);
                        circ.fill = color;
                        circ.noStroke();
                        two.update();
                        console.log(color);
                        setTwo(two);
                        undoStack.push(lastGroup);
                        setLastGroup(two.scene);

                    } else if(toolInUse === 'rectangle'){
                        console.log('Rectangle tool triggered')
                        const rect = two.makeRectangle(newMouse[0], newMouse[1], radius/2, radius/2);
                        rect.fill = color;
                        rect.noStroke();
                        two.update();
                        console.log(color);
                        setTwo(two);
                        undoStack.push(lastGroup);
                        setLastGroup(two.scene);
                    }

                }

            //}


    },
        // So many dependencies!
        // It makes me wonder if ever just using old ES6 React would be better
        [inUse, toolInUse, two, radius, color, lastGroup]);

    const mouseUpCallback = useCallback( (event) => {


        //NOTE: In current implementation, it is the tool callback switches (mouseUpCallback,
        // mouseDownCallback, etc) that exit out of other tools, not the actual toolbar.
        exitPaint()
        switch(toolInUse){
            case "pen":
                //exitPaint();
                break;
                //Note: if stickers ever get online, this is where they should be thrown into
                // the callback functions
            case "circle":

                setInUse(true)
                dropShape(event);
                break;
            case "rectangle":
                setInUse(true)
                dropShape(event);
                break;
        }
    }, [inUse, toolInUse]);

    //useEffect for exitPaint
    useEffect(() => {
        if (!svgRef.current) {
            //console.log("MouseUp or MouseLeave Ev. Handle notGood")
            //console.log("SVG Status: "+(svgRef.current != null));
            //console.log("two load status: "+isTwoLoaded);
            return;
        }
            const canvas = two.renderer.domElement;
            //console.log("MouseUp & mouseLEave mounted");

                canvas.addEventListener('mouseup', mouseUpCallback);
                //canvas.addEventListener('mouseup', exitPaint);
                canvas.addEventListener('mouseleave', exitPaint);
                //canvas.addEventListener('mouseup', dropShape);

                canvas.addEventListener('touchend', mouseUpCallback);
        return () => {
                canvas.removeEventListener('mouseup', mouseUpCallback);
                canvas.removeEventListener('touchend', mouseUpCallback);
            //canvas.removeEventListener('mouseup', exitPaint);
                canvas.removeEventListener('mouseleave', exitPaint);
                //canvas.removeEventListener('mouseup', dropShape);
            };
    }, [mouseUpCallback, two, toolInUse]);

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
        lastGroup.add(path);
        setLastGroup(lastGroup);

    };



    return (
        <div style={{overflow :"hidden" , height:'100vh', width:'100vw'}} >
            <text>{lastGroup.length}</text>
            <div ref={svgRef} style={{"overflow":"hidden"}}>
            </div>
        </div>
    )
}
export default TwoCanvas;
